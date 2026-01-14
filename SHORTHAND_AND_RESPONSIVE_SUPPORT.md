# Panda Shorthands and Responsive Properties Support

## Overview

The `panda2tw` converter now supports:
1. **Panda CSS Shorthands** - Converting Panda property shorthands to their full equivalents
2. **Responsive Properties** - Handling responsive conditions from Panda CSS objects

## Implementation Details

### Panda Shorthands

Added a comprehensive `shorthandMap` that maps Panda shorthand property names to their full CSS property equivalents:

**Supported Shorthands:**

#### Margin & Padding
- `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my` → `margin*`
- `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` → `padding*`

#### Sizing
- `w`, `h` → `width`, `height`
- `minW`, `maxW`, `minH`, `maxH` → min/maxWidth/Height

#### Positioning
- `pos` → `position`
- `inset`, `insetX`, `insetY`, `top`, `right`, `bottom`, `left`

#### Borders
- `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderX`, `borderY`
- `rounded`, `roundedTl`, `roundedTr`, `roundedBr`, `roundedBl` → `borderRadius*`

#### Text & Typography
- `text` → `fontSize`
- `textColor` → `color`
- `tracking` → `letterSpacing`
- `leading` → `lineHeight`

#### Layout
- `gap`, `gapX`, `gapY`
- `space`, `spaceX`, `spaceY`
- `items` → `alignItems`
- `justify` → `justifyContent`
- `self` → `alignSelf`
- `cols` → `gridTemplateColumns`
- `rows` → `gridTemplateRows`

#### Colors & Effects
- `bg` → `backgroundColor`
- `shadow` → `boxShadow`

#### Transforms
- `scale`, `scaleX`, `scaleY`, `rotate`, `skew`, `skewX`, `skewY`
- `translate`, `translateX`, `translateY`

#### Other
- `cursor`, `userSelect`, `pointerEvents`, `visibility`, `zIndex`

### Responsive Properties

The converter now properly handles Panda CSS responsive conditions:

**Supported Breakpoints:**
- `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` - Added as Tailwind responsive prefixes
- `base` - Treated as default (no prefix added)

**Behavior:**
- Properties at the base level are rendered without any responsive prefix
- Properties within responsive breakpoint objects are prefixed with the breakpoint name
- Responsive modifiers work with pseudo-selectors (e.g., `md:hover:bg-blue-500`)

### Function Updates

#### `expandShorthand(prop: string): string`
Converts shorthand property names to their full equivalents.

```typescript
expandShorthand("mt") // → "marginTop"
expandShorthand("px") // → "paddingX"
expandShorthand("rounded") // → "borderRadius"
```

#### `extractTailwindClassesFromPandaCss(cssObj: StyleObject): string[]`
Updated to:
1. Expand shorthands before property mapping
2. Handle responsive conditions (base, sm, md, lg, xl, 2xl, 3xl)
3. Support nested pseudo-selectors with responsive modifiers

#### `extractTailwindClassesFromPandaCssWithContext(...)`
Updated similarly to support shorthands and responsive conditions with Panda context-aware token resolution.

## Usage Examples

### Basic Shorthands
```typescript
// Input
{ mt: "4" }
// Output
["mt-4"]

// Input
{ px: "16", py: "8" }
// Output
["px-16", "py-8"]

// Input
{ bg: "blue.500" }
// Output
["bg-blue-500"]
```

### Responsive Properties
```typescript
// Input
{
  base: { pt: "4" },
  md: { pt: "8" },
  lg: { pt: "12" }
}
// Output
["pt-4", "md:pt-8", "lg:pt-12"]
```

### Complex Combined Usage
```typescript
// Input
{
  display: "block",
  mt: "4",
  px: "6",
  base: { padding: "2" },
  md: { display: "flex", padding: "4", px: "8" },
  lg: { padding: "8" },
  _hover: { bg: "gray.100" }
}
// Output
["block", "mt-4", "px-6", "p-2", "md:flex", "md:p-4", "md:px-8", "md:hover:bg-gray-100", "lg:p-8"]
```

## Testing

All functionality is covered by comprehensive tests in [css-to-tw.test.ts](packages/panda2tw/tests/css-to-tw.test.ts):

- **Shorthand Tests**: Verify individual shorthand mappings for all property categories
- **Responsive Tests**: Validate responsive breakpoint handling with various scenarios
- **Integration Tests**: Test combinations of shorthands, responsive properties, and pseudo-selectors

Total test coverage: **68 tests** (97 total in the panda2tw package)

## Implementation Location

- **Main Implementation**: [packages/panda2tw/src/css-to-tw.ts](packages/panda2tw/src/css-to-tw.ts)
  - Lines 15-142: `shorthandMap` definition
  - Lines 143-145: `expandShorthand()` function
  - Lines 668-733: Updated `extractTailwindClassesFromPandaCss()`
  - Lines 995-1062: Updated context-aware traverse in `extractTailwindClassesFromPandaCssWithContext()`

- **Tests**: [packages/panda2tw/tests/css-to-tw.test.ts](packages/panda2tw/tests/css-to-tw.test.ts)
  - Lines 530-647: Panda shorthands test suite
  - Lines 649-785: Responsive properties test suite
