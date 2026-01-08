# CSS Properties Analysis: panda2tw

## Overview
This document analyzes all CSS properties used in test files and sample files against the current propertyMap in `css-to-tw.ts`.

---

## Current PropertyMap Coverage (44 properties)

The following CSS properties are **currently supported** in the propertyMap:

### Display Properties
- `display` - Pattern-based validation: `flex|block|inline|grid|hidden|contents`

### Colors (5 properties)
- `color` → `text-`
- `backgroundColor` → `bg-`
- `borderColor` → `border-`
- `strokeColor` → `stroke-`
- `fillColor` → `fill-`

### Sizing (6 properties)
- `width` → `w-`
- `height` → `h-`
- `maxWidth` → `max-w-`
- `maxHeight` → `max-h-`
- `minWidth` → `min-w-`
- `minHeight` → `min-h-`

### Spacing - Padding (5 properties)
- `padding` → `p-`
- `paddingTop` → `pt-`
- `paddingRight` → `pr-`
- `paddingBottom` → `pb-`
- `paddingLeft` → `pl-`

### Spacing - Margin (5 properties)
- `margin` → `m-`
- `marginTop` → `mt-`
- `marginRight` → `mr-`
- `marginBottom` → `mb-`
- `marginLeft` → `ml-`

### Borders (6 properties)
- `borderWidth` → `border-`
- `borderRadius` → `rounded-`
- `borderTopLeftRadius` → `rounded-tl-`
- `borderTopRightRadius` → `rounded-tr-`
- `borderBottomRightRadius` → `rounded-br-`
- `borderBottomLeftRadius` → `rounded-bl-`

### Typography (7 properties)
- `fontSize` → `text-`
- `fontWeight` → `font-`
- `fontStyle` → `italic` (⚠️ **Special handling**: boolean-like, returns hardcoded "italic")
- `lineHeight` → `leading-`
- `letterSpacing` → `tracking-`
- `textAlign` - Pattern-based: `left|center|right|justify` → `text-`
- `textDecoration` → `underline` (⚠️ **Special handling**: requires custom logic for values like "none", "underline", "line-through", etc.)

### Flex & Grid (4 properties)
- `flexDirection` - Pattern-based: `row|column|row-reverse|column-reverse` → `flex-`
- `alignItems` → `items-`
- `justifyContent` → `justify-`
- `gap` → `gap-`

### Overflow (3 properties)
- `overflow` - Pattern-based: `auto|hidden|visible|scroll` → `overflow-`
- `overflowX` - Pattern-based: `auto|hidden|visible|scroll` → `overflow-x-`
- `overflowY` - Pattern-based: `auto|hidden|visible|scroll` → `overflow-y-`

### Position (5 properties)
- `position` - Pattern-based: `static|relative|absolute|fixed|sticky` → (no prefix)
- `top` → `top-`
- `right` → `right-`
- `bottom` → `bottom-`
- `left` → `left-`

### Effects (3 properties)
- `opacity` → `opacity-`
- `boxShadow` → `shadow-`
- `textShadow` → `shadow-`

### Transforms (5 properties)
- `transform` → `transform` (⚠️ **Special handling**: hardcoded class name)
- `transformOrigin` → `origin-`
- `scale` → `scale-`
- `rotate` → `rotate-`
- `translate` → `translate-`

### Transitions & Animation (4 properties)
- `transition` → `transition-`
- `transitionDuration` → `duration-`
- `transitionTimingFunction` → `ease-`
- `animation` → `animate-`

---

## CSS Properties Used in Tests/Samples BUT NOT in propertyMap

### FOUND IN TESTS/SAMPLES (Must Add to propertyMap)

**Count: 5 properties**

1. **`pointerEvents`** ⚠️ **CRITICAL**
   - Used in: `css-to-tw.test.ts` (button-like example)
   - Value example: `"none"`
   - Expected Tailwind: `pointer-events-none`
   - **Special handling needed**: Boolean-like (none|auto) → specific class names
   - Suggested mapping: `pointerEvents` → `pointer-events-`

2. **`cursor`** ⚠️ **CRITICAL**
   - Used in: `samples/button.ts`
   - Value example: `"pointer"`
   - Expected Tailwind: `cursor-pointer`
   - Suggested mapping: `cursor` → `cursor-`

3. **`textStyle`** ⚠️ **VERY SPECIAL HANDLING REQUIRED**
   - Used in: EXTENSIVELY in `css-to-tw-context.test.ts` (27 test cases)
   - This is a **Panda-specific property**, not a standard CSS property
   - It's a mixin reference that expands to multiple CSS properties
   - Current implementation: Already handled in `extractTailwindClassesFromPandaCssWithContext()`
   - **Not needed in propertyMap** - handled separately by custom logic
   - Values: References to text style definitions like "body", "heading", "title.1", "body.bold", "caption.bold", "notification"
   - Expands to: `fontSize`, `lineHeight`, `fontWeight`, `letterSpacing`, `textDecoration`

4. **`whiteSpace`**
   - Referenced in `parser.ts` DEFAULT_PANDA_PROPERTIES (line 170)
   - Value example: unknown from tests (needs validation)
   - Expected Tailwind: `whitespace-pre|normal|nowrap|pre-wrap|pre-line`
   - Suggested mapping: `whiteSpace` → `whitespace-`

5. **`userSelect`**
   - Referenced in `parser.ts` DEFAULT_PANDA_PROPERTIES (line 199)
   - Value example: unknown from tests (needs validation)
   - Expected Tailwind: `select-auto|select-none|select-all|select-text`
   - Suggested mapping: `userSelect` → `select-`

---

## Analysis Summary

### Properties Found in Tests/Samples
- ✅ **Already in propertyMap**: 44 properties
- ⚠️ **NOT in propertyMap but used**: 5 properties
  - 3 are standard CSS properties needing mapping (`pointerEvents`, `cursor`, `whiteSpace`)
  - 1 is a Panda-specific mixin property (`textStyle`) - already handled separately
  - 1 is UI-related (`userSelect`) needing mapping

### Properties with Special Handling

1. **`textDecoration`** (Current propertyMap)
   - Current handling: `textDecoration` → `underline` (hardcoded prefix)
   - Issue: Only handles `"none"` case specially, but should handle:
     - `"none"` → should probably not add any class
     - `"underline"` → `underline`
     - `"line-through"` → `line-through`
     - `"overline"` → `overline`
   - **Recommendation**: Implement custom handler that checks the value

2. **`fontStyle`** (Current propertyMap)
   - Current handling: `fontStyle` → `italic` (hardcoded prefix)
   - Issue: Only handles italics, should handle:
     - `"italic"` → `italic`
     - `"normal"` → (no class)
   - **Recommendation**: Implement custom handler

3. **`textStyle`** (NOT in propertyMap - Special Case)
   - This is ALREADY implemented in `extractTailwindClassesFromPandaCssWithContext()`
   - It's a Panda-specific feature that expands to multiple properties
   - Should NOT be added to basic propertyMap
   - Already works correctly in tests

4. **`transform`** (Current propertyMap)
   - Current handling: `transform` → `transform` (hardcoded class name)
   - This seems correct for Tailwind

---

## Recommendations for Implementation

### High Priority (Must Add)
1. **`pointerEvents`** - Add to propertyMap
   - Mapping: `{ pattern: /^(none|auto)$/, classPrefix: "pointer-events-" }`

2. **`cursor`** - Add to propertyMap
   - Mapping: `{ pattern: /^.*$/, classPrefix: "cursor-" }`

### Medium Priority (Should Add)
3. **`userSelect`** - Add to propertyMap
   - Mapping: `{ pattern: /^.*$/, classPrefix: "select-" }`

4. **`whiteSpace`** - Add to propertyMap
   - Mapping: `{ pattern: /^(normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/, classPrefix: "whitespace-" }`

### Fix/Improve Special Cases
5. **`textDecoration`** - Improve current implementation
   - Add proper value checking instead of just using hardcoded prefix

6. **`fontStyle`** - Improve current implementation
   - Add proper value checking for "italic" vs "normal"

---

## Test Files Analyzed

### Test Files Scanned
- [css-to-tw.test.ts](packages/panda2tw/tests/css-to-tw.test.ts) - 7 tests
  - Properties tested: display, color, backgroundColor, alignItems, justifyContent, borderRadius, pointerEvents, opacity

- [css-to-tw-context.test.ts](packages/panda2tw/tests/css-to-tw-context.test.ts) - 20+ tests
  - Properties tested: display, alignItems, justifyContent, padding, backgroundColor, color, textStyle (extensive)
  - textStyle variants: "body", "heading", "title.1", "body.bold", "caption.bold", "notification"
  - Nested properties from textStyle: fontSize, lineHeight, fontWeight, letterSpacing, textDecoration

- [cva-to-tw.test.ts](packages/panda2tw/tests/cva-to-tw.test.ts) - 3 tests
  - Properties tested: display, alignItems, color, backgroundColor

- [jsx-props.test.ts](packages/panda2tw/tests/jsx-props.test.ts) - 3 tests
  - Properties tested: display, gap, width, height

### Sample Files Analyzed
- [samples/button.ts](packages/panda2tw/samples/button.ts)
  - Properties: display, alignItems, justifyContent, padding, backgroundColor, color, borderRadius, fontSize, fontWeight, cursor, transition
  - Shows real-world usage with transitions and cursor property

---

## Conclusion

**Missing Properties**: 5 CSS properties found in tests/samples need to be added to propertyMap:
1. `pointerEvents` - Used in button example
2. `cursor` - Used in button example
3. `userSelect` - Referenced in parser defaults
4. `whiteSpace` - Referenced in parser defaults
5. `textStyle` - Already handled specially (no change needed)

**Properties Needing Improvement**:
- `textDecoration` - Needs smarter value handling
- `fontStyle` - Needs smarter value handling
