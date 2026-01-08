# CSS Properties Not Yet in PropertyMap - Quick Summary

## Found 5 CSS Properties Used in Tests/Samples But NOT in propertyMap

### 1. **`pointerEvents`** ⚠️ CRITICAL
- **File**: `packages/panda2tw/tests/css-to-tw.test.ts` (line 102)
- **Test**: "button-like example"
- **Value used**: `"none"`
- **Tailwind class**: `pointer-events-none`
- **Suggested mapping**: `{ pattern: /^(none|auto)$/, classPrefix: "pointer-events-" }`
- **Special handling**: Values map to specific class patterns

### 2. **`cursor`** ⚠️ CRITICAL
- **File**: `packages/panda2tw/samples/button.ts` (line 12)
- **Value used**: `"pointer"`
- **Tailwind class**: `cursor-pointer`
- **Suggested mapping**: `{ pattern: /^.*$/, classPrefix: "cursor-" }`
- **Common values**: pointer, auto, default, help, wait, text, move, grab, not-allowed, etc.

### 3. **`textStyle`** ✓ ALREADY HANDLED
- **File**: `packages/panda2tw/tests/css-to-tw-context.test.ts` (27+ test cases)
- **Type**: Panda-specific mixin property (NOT standard CSS)
- **Status**: Already implemented in `extractTailwindClassesFromPandaCssWithContext()`
- **Examples**: "body", "heading", "title.1", "body.bold", "caption.bold", "notification"
- **Expands to**: fontSize, lineHeight, fontWeight, letterSpacing, textDecoration
- **Action**: ✓ No changes needed - works correctly

### 4. **`whiteSpace`**
- **File**: `packages/panda2tw/src/parser.ts` (line 170) - referenced in DEFAULT_PANDA_PROPERTIES
- **Status**: Not actively used in tests yet
- **Tailwind equivalents**: `whitespace-normal|nowrap|pre|pre-wrap|pre-line|break-spaces`
- **Suggested mapping**: `{ pattern: /^(normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/, classPrefix: "whitespace-" }`

### 5. **`userSelect`**
- **File**: `packages/panda2tw/src/parser.ts` (line 199) - referenced in DEFAULT_PANDA_PROPERTIES
- **Status**: Not actively used in tests yet
- **Tailwind equivalents**: `select-auto|select-none|select-all|select-text`
- **Suggested mapping**: `{ pattern: /^.*$/, classPrefix: "select-" }`

---

## Properties Needing Special Handling Improvements

### `textDecoration` (Already in propertyMap)
- **Current issue**: Hardcoded to return "underline" prefix
- **Needs**: Value-aware handling for "none", "underline", "line-through", "overline"
- **Fix**: Check the value and return appropriate class or empty string

### `fontStyle` (Already in propertyMap)
- **Current issue**: Hardcoded to return "italic" prefix
- **Needs**: Value-aware handling for "italic" vs "normal"
- **Fix**: Check if value === "italic" and return "italic", else skip

---

## Test Coverage Summary

| Test File | Properties Tested | Special Props | Line Count |
|-----------|-------------------|---------------|-----------|
| css-to-tw.test.ts | display, color, bg, alignItems, justifyContent, borderRadius, **pointerEvents**, opacity | "inline-flex", "primary/90" | ~140 |
| css-to-tw-context.test.ts | (same as above) + **textStyle** | "body", "heading", nested variants | 694 |
| cva-to-tw.test.ts | display, color, bg | none | ~30 |
| jsx-props.test.ts | display, gap, width, height | none | ~110 |
| button.ts (sample) | display, alignItems, justifyContent, padding, bg, color, borderRadius, fontSize, fontWeight, **cursor**, transition | "_hover", "_active" | ~22 |

---

## Implementation Priority

**Must Add Immediately:**
1. ✅ `pointerEvents` - Used in critical button test
2. ✅ `cursor` - Used in sample button component

**Should Add Soon:**
3. ⚠️ `userSelect` - Referenced in parser defaults
4. ⚠️ `whiteSpace` - Referenced in parser defaults

**Already Handled (No Action):**
5. ✓ `textStyle` - Panda-specific, implemented separately

**Improve Existing:**
- `textDecoration` - Add value-aware logic
- `fontStyle` - Add value-aware logic
