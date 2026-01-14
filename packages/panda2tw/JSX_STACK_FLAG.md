# --with-jsx-stack Flag Implementation

## Overview
The `--with-jsx-stack` flag enables selective JSX prop conversion when using Stack/HStack components with CVA styling. When enabled, only JSX props that are **not exposed** in the component's CVA definition or have values that are **not in the exposed values list** are converted to Tailwind classes.

## Usage
```bash
pnpm panda2tw rewrite <path> --with-jsx-stack [--write]
```

## How It Works

### Without Flag (Default Behavior)
**ALL** JSX CSS properties are converted to className:
```tsx
// Input
<HStack gap="8" color="content.secondary" justifyContent="between" width="[6px]">

// Output
<HStack className="gap-8 text-content-secondary justify-between w-[6px]" />
```

### With Flag
Only props that are **not exposed** or have **non-exposed values** are converted:
```tsx
// Input
<HStack gap="8" color="content.secondary" justifyContent="between" width="[6px]">

// Output
<HStack
  className="text-content-secondary w-[6px]"  // Only non-exposed props converted
  gap="8"                                      // Stays - exposed variant, exposed value
  justifyContent="between"                     // Stays - exposed variant, exposed value
/>
```

## Exposed Stack/HStack Variants

The following props and values are considered "exposed" for Stack/HStack components (from `layout.styles.ts`):

```typescript
{
  direction: ["row", "col"],
  align: ["center", "start", "end", "selfStart", "selfCenter", "selfEnd"],
  justifyContent: ["center", "start", "end", "between", "around"],
  wrap: [true],
  w: ["full"],
  h: ["full"],
  gap: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
}
```

## Examples

### Example 1: Mixed Props
```tsx
<HStack gap="8" color="content.secondary" justifyContent="between" width="[6px]">
  Content
</HStack>
```

**Analysis:**
- `gap="8"` → **exposed** (variant exists, "8" is in exposed values) → ✓ STAYS
- `justifyContent="between"` → **exposed** (variant exists, "between" is in exposed values) → ✓ STAYS
- `color="content.secondary"` → **NOT exposed** (not in exposed variants) → ✗ CONVERTS
- `width="[6px]"` → **NOT exposed** (variant "w" exists, but "[6px]" is NOT in exposed values) → ✗ CONVERTS

**Result:**
```tsx
<HStack
  className="text-content-secondary w-[6px]"
  gap="8"
  justifyContent="between"
/>
```

### Example 2: All Exposed Props
```tsx
<Stack direction="col" align="center" gap="4" w="full" h="full">
  Content
</Stack>
```

**Analysis:**
- `direction="col"` → **exposed** → ✓ STAYS
- `align="center"` → **exposed** → ✓ STAYS
- `gap="4"` → **exposed** → ✓ STAYS
- `w="full"` → **exposed** → ✓ STAYS
- `h="full"` → **exposed** → ✓ STAYS

**Result:** (no conversions)
```tsx
<Stack direction="col" align="center" gap="4" w="full" h="full">
  Content
</Stack>
```

### Example 3: Non-Exposed Values
```tsx
<HStack gap="99" align="baseline" width="[calc(100%-20px)]">
  Content
</HStack>
```

**Analysis:**
- `gap="99"` → variant exists but "99" NOT in exposed values [0-12] → ✗ CONVERTS
- `align="baseline"` → variant exists but "baseline" NOT in exposed values → ✗ CONVERTS
- `width="[calc(100%-20px)]"` → variant exists but value NOT in exposed values ["full"] → ✗ CONVERTS

**Result:**
```tsx
<HStack className="gap-99 baseline w-[calc(100%-20px)]">
  Content
</HStack>
```

## Implementation Details

### Files Modified

1. **`src/cli.ts`**
   - Added `--with-jsx-stack` flag to the rewrite command

2. **`src/types.ts`**
   - Added `withJsxStack?: boolean` to `RewriteOptions` type

3. **`src/rewrite.ts`**
   - Added `STACK_EXPOSED_VARIANTS` mapping
   - Added `isExposedVariant()` and `isExposedVariantValue()` helper functions
   - Added `shouldConvertJsxProp()` function to determine conversion behavior
   - Updated `processSourceFile()` to accept and use `withJsxStack` option
   - Modified JSX prop conversion logic to filter non-exposed props when flag is enabled
   - Updated all function calls to pass through the `withJsxStack` option

4. **`samples/component-props.ts`**
   - Created new file with exported `STACK_EXPOSED_VARIANTS` mapping
   - Added helper functions `isExposedVariant()` and `isExposedVariantValue()`
   - Documents the exposed variants for future reference

5. **`samples/layout.styles.ts`**
   - CVA definition that serves as the source of truth for exposed variants

### Key Logic

The conversion decision in `shouldConvertJsxProp()`:
```typescript
function shouldConvertJsxProp(propName: string, propValue: any, withJsxStack: boolean): boolean {
  if (!withJsxStack) return true; // Convert all by default

  // If it's an exposed variant with an exposed value, don't convert
  if (isExposedVariant(propName) && isExposedVariantValue(propName, propValue)) {
    return false;
  }

  return true; // Otherwise, convert it
}
```

## Benefits

- ✅ Keeps component-specific styling logic in JSX props
- ✅ Converts arbitrary/unsupported CSS values to Tailwind classes
- ✅ Maintains clear separation between component API and utility styles
- ✅ Works seamlessly with CVA component libraries
- ✅ Backward compatible - original behavior preserved without the flag

## Related Files

- [layout.tsx](./layout.tsx) - Stack/HStack component definitions
- [layout.styles.ts](./layout.styles.ts) - CVA styling definitions
- [component-props.ts](./component-props.ts) - Exposed prop type definitions
- [jsx-stack-demo.tsx](./jsx-stack-demo.tsx) - Comprehensive examples
