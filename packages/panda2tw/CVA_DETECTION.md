# CVA Detection Feature - TDD Implementation

## Overview

This feature enables automatic detection and conversion of CVA (Class Variance Authority) configurations in the `panda2tw rewrite` command. It identifies objects with `base` and `variants` properties and converts their CSS styles to Tailwind classes.

## What It Does

The CVA detection feature automatically:
1. **Detects CVA patterns** in code:
   - `const xxx = define.recipe({...})`
   - `const xxx = cva({...})`
   - `const xxx = define.slotRecipe({...})`
   - `const xxx = styled.xxx({base: {...}, variants: {...}})`

2. **Converts styles** from Panda CSS to Tailwind classes:
   - Base styles: `{display: 'flex', padding: '2'}` → `"flex p-2"`
   - Variants: `{color: 'blue.600'}` → `"bg-blue-600"`
   - Slot-based styles: Converts nested selector styles to Tailwind classes

3. **Preserves structure**:
   - Keeps imports, exports, and JSX code unchanged
   - Maintains property names and variant structures
   - Works alongside existing css() call conversions

## Implementation Details

### Files Added

1. **`src/detect-and-convert-cva.ts`**
   - Main detection and conversion logic using `ts-morph` for AST manipulation
   - Functions:
     - `detectAndConvertCvaInCode()` - Main entry point
     - `isCvaConfig()` - Checks if an object is a CVA config
     - `convertCvaObject()` - Converts CVA object properties
     - `convertStyleProperty()` - Converts individual style properties
     - `convertSlotStyles()` - Handles slot-based definitions
     - `evaluateObjectLiteral()` - Safely evaluates object literals

2. **`tests/detect-and-convert-cva.test.ts`**
   - 10 comprehensive test cases covering:
     - Define.recipe() detection and conversion
     - CVA() function detection
     - Styled.div() call expressions
     - Slot-based recipes (define.slotRecipe)
     - Multiple CVA definitions in one file
     - Edge cases (objects without variants, non-CVA configs)
     - Preservation of non-CVA code

3. **`tests/rewrite-cva-integration.test.ts`**
   - 3 integration tests verifying:
     - Full file rewrites with CVA configs
     - Preservation of JSX and other code structures
     - Integration with the rewrite command

### Files Modified

1. **`src/index.ts`**
   - Added export of `detectAndConvertCvaInCode`

2. **`src/rewrite.ts`**
   - Added import of `detectAndConvertCvaInCode`
   - Integrated CVA detection into `processSourceFile()` function
   - CVA detection runs as first step before other conversions

3. **`src/css-to-tw.ts`**
   - Enhanced `getSpecialPropertyClass()` to handle `100%` → `full` mappings
   - Supports width/height/maxWidth/minWidth/maxHeight/minHeight

4. **`tests/css-to-tw-context.test.ts`**
   - Updated test expectations from `h-100%` to `h-full`
   - Updated test expectations from `w-100%` to `w-full`

## Usage

### Via CLI with object string:
```bash
node packages/panda2tw/bin.js cva '{base:{display:"flex",padding:"2"},variants:{size:{sm:{width:"16",height:"16"}}}}'
```

### Via rewrite command:
```bash
panda2tw rewrite path/to/file.ts
# or
panda2tw rewrite "src/**/*.tsx"
```

The rewrite command now automatically detects CVA configs and converts them alongside other Panda CSS conversions.

## Test Results

All 206 tests pass:
- ✓ 4 context-aware tests
- ✓ 3 CVA-to-TW tests
- ✓ 87 CSS-to-TW tests
- ✓ 3 rewrite CVA integration tests
- ✓ 10 detect-and-convert-cva tests
- ✓ 12 JSX stack selective tests
- ✓ 11 JSX props tests
- ✓ 33 JSX prop detection tests
- ✓ 43 CSS-to-TW context tests

## Example Conversions

### Before (Panda CSS):
```typescript
const buttonCva = define.recipe({
  base: {
    display: 'flex',
    padding: '2',
    borderRadius: 'md',
  },
  variants: {
    variant: {
      primary: { backgroundColor: 'blue.600', color: 'white' },
      secondary: { backgroundColor: 'gray.200' },
    },
  },
});
```

### After (Tailwind):
```typescript
const buttonCva = define.recipe({
  base: "flex p-2 rounded-md",
  variants: {
    variant: {
      primary: "bg-blue-600 text-white",
      secondary: "bg-gray-200",
    },
  },
});
```

## Key Features

1. **AST-based conversion** - Uses ts-morph for precise code manipulation
2. **Recursive property handling** - Converts nested styles in variants
3. **Slot support** - Handles slot-based recipe definitions
4. **Special value mapping** - Maps CSS values like `100%` to Tailwind `full`
5. **Non-destructive** - Preserves all non-CVA code
6. **Integrated** - Works with existing rewrite command infrastructure

## Future Enhancements

Potential improvements:
- Support for compoundVariants
- Support for defaultVariants
- Custom variant mapping via configuration
- Performance optimization for large files
- Detailed conversion report in CLI output
