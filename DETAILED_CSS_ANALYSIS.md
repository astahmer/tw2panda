# Detailed CSS Properties Analysis for panda2tw

## Executive Summary

**Search Scope**:
- 4 test files in `packages/panda2tw/tests/`
- 1 sample file in `packages/panda2tw/samples/`

**Current propertyMap**: 44 CSS properties supported

**Missing from propertyMap**: 5 CSS properties found in tests/samples
- **2 Critical** (actively used in tests): `pointerEvents`, `cursor`
- **1 Special** (Panda-specific, already handled): `textStyle`
- **2 Referenced** (in parser defaults): `userSelect`, `whiteSpace`

---

## Detailed Property Breakdown

### ✅ ALREADY IN PROPERTYMAP (44 Properties)

#### Display & Layout (19 properties)
```
display, position, flexDirection, alignItems, justifyContent, gap,
overflow, overflowX, overflowY,
top, right, bottom, left,
width, height, maxWidth, maxHeight, minWidth, minHeight
```

#### Spacing (10 properties)
```
padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
margin, marginTop, marginRight, marginBottom, marginLeft
```

#### Colors & Styling (8 properties)
```
color, backgroundColor, borderColor, strokeColor, fillColor,
borderWidth, borderRadius, borderTopLeftRadius, borderTopRightRadius,
borderBottomRightRadius, borderBottomLeftRadius (6 border props)
```

#### Typography (7 properties)
```
fontSize, fontWeight, fontStyle, lineHeight, letterSpacing, textAlign, textDecoration
```

#### Effects & Transforms (8 properties)
```
opacity, boxShadow, textShadow,
transform, transformOrigin, scale, rotate, translate,
transition, transitionDuration, transitionTimingFunction, animation (4 transition/animation)
```

---

## 🔴 MISSING FROM PROPERTYMAP (5 Properties)

### 1️⃣ **pointerEvents** (CRITICAL - Active Usage)

**Where it's used:**
```typescript
// From: packages/panda2tw/tests/css-to-tw.test.ts (Line 102)
_disabled: {
  pointerEvents: "none",    // ← THIS PROPERTY
  opacity: "0.5",
}
```

**Test context**: "button-like example" - testing disabled state

**Value examples found**:
- `"none"` - Most common for disabling interaction

**Expected Tailwind output**:
- `"pointer-events-none"` or `"disabled:pointer-events-none"`

**Tailwind CSS values**:
- `pointer-events-auto` - Allow pointer events
- `pointer-events-none` - Disable pointer events

**Suggested implementation**:
```typescript
pointerEvents: {
  pattern: /^(none|auto)$/,
  classPrefix: "pointer-events-"
}
```

---

### 2️⃣ **cursor** (CRITICAL - Sample Usage)

**Where it's used:**
```typescript
// From: packages/panda2tw/samples/button.ts (Line 12)
const buttonStyles = css({
  display: 'flex',
  // ... other props
  cursor: 'pointer',          // ← THIS PROPERTY
  transition: 'all 200ms',
  // ...
})
```

**Test context**: Real-world button component sample

**Value examples found**:
- `"pointer"` - Standard mouse pointer cursor

**Expected Tailwind output**:
- `"cursor-pointer"`

**Common Tailwind cursor values**:
- `cursor-auto` - Default cursor
- `cursor-default` - Default arrow cursor
- `cursor-pointer` - Pointer/hand cursor
- `cursor-wait` - Wait/loading cursor
- `cursor-text` - Text selection cursor
- `cursor-move` - Move cursor
- `cursor-help` - Help cursor
- `cursor-not-allowed` - Prohibited cursor
- `cursor-grab` - Grab cursor
- `cursor-grabbing` - Grabbing cursor

**Suggested implementation**:
```typescript
cursor: {
  pattern: /^.*$/,
  classPrefix: "cursor-"
}
```

---

### 3️⃣ **textStyle** (SPECIAL - Already Handled)

**Status**: ✅ **ALREADY IMPLEMENTED** - No action needed

**Where it's used**:
- `packages/panda2tw/tests/css-to-tw-context.test.ts` (27+ test cases)
- Extensively tested in 20+ different scenarios

**What it is**:
- **Panda-specific property** (not standard CSS)
- A mixin/composition reference that expands to multiple CSS properties
- Allows reusing text styling patterns from theme

**How it works**:
```typescript
// Definition in context
textStyles: {
  body: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: "500",
  },
  heading: {
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: "bold",
  }
}

// Usage
{ textStyle: "body" }           // Expands to above properties
{ textStyle: "heading" }         // Expands to heading properties
{ textStyle: "title.1" }         // Supports nested variants
{ textStyle: "body.bold" }       // Supports variant selection
```

**Current implementation location**:
- `extractTailwindClassesFromPandaCssWithContext()` in `css-to-tw.ts`
- Handles resolution through PandaContext
- Already tested with 20+ test cases covering:
  - Simple textStyle references
  - Nested variants (e.g., "title.1", "body.bold")
  - textStyle with pseudo-selectors (e.g., `_hover: { textStyle: "heading" }`)
  - textStyle with responsive modifiers (e.g., `md: { textStyle: "heading" }`)
  - textStyle merging with explicit properties
  - Fallback for non-existent styles

**Test examples**:
```typescript
const cssObj = { textStyle: "body" };
// Results in: "text-16px", "leading-24px", "font-500"

const cssObj = { textStyle: "heading", color: "blue.600" };
// Results in: "text-32px", "leading-40px", "font-bold", "text-blue-600"
```

**Action**: ✅ **NO CHANGES NEEDED** - This works correctly

---

### 4️⃣ **userSelect** (Referenced in Parser)

**Where it's referenced**:
```typescript
// From: packages/panda2tw/src/parser.ts (Line 199)
const DEFAULT_PANDA_PROPERTIES = new Set([
  // ... many properties
  "userSelect",    // ← Referenced here
  // ...
])
```

**Status**: Referenced in parser defaults but NOT actively tested in current test suite

**Tailwind CSS equivalents**:
- `select-auto` - Default selection behavior
- `select-none` - Prevent selection
- `select-all` - Select all content
- `select-text` - Select text only

**Common values**:
- `"auto"` - Default behavior
- `"none"` - Disable text selection
- `"text"` - Allow text selection only
- `"all"` - Select all on single click
- `"contain"` - Selection is within the element

**Suggested implementation**:
```typescript
userSelect: {
  pattern: /^.*$/,
  classPrefix: "select-"
}
```

---

### 5️⃣ **whiteSpace** (Referenced in Parser)

**Where it's referenced**:
```typescript
// From: packages/panda2tw/src/parser.ts (Line 170)
const DEFAULT_PANDA_PROPERTIES = new Set([
  // ... many properties
  "whiteSpace",    // ← Referenced here
  // ...
])
```

**Status**: Referenced in parser defaults but NOT actively tested in current test suite

**Tailwind CSS equivalents**:
- `whitespace-normal` - Default whitespace handling
- `whitespace-nowrap` - Prevent wrapping
- `whitespace-pre` - Preserve whitespace/newlines
- `whitespace-pre-wrap` - Preserve whitespace, wrap if needed
- `whitespace-pre-line` - Preserve newlines, collapse other whitespace
- `whitespace-break-spaces` - Preserve whitespace, break on spaces

**CSS Values**:
- `"normal"` - Default
- `"nowrap"` - No wrapping
- `"pre"` - Preserve formatting
- `"pre-wrap"` - Preserve with wrapping
- `"pre-line"` - Preserve lines, collapse spaces
- `"break-spaces"` - Break on spaces

**Suggested implementation**:
```typescript
whiteSpace: {
  pattern: /^(normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/,
  classPrefix: "whitespace-"
}
```

---

## Special Cases Requiring Improved Handling

### ⚠️ **textDecoration** (Already in propertyMap)

**Current implementation**:
```typescript
textDecoration: {
  pattern: /^.*$/,
  classPrefix: "underline"
}
```

**Problem**:
- Hardcoded to use "underline" prefix
- Doesn't handle value "none" properly
- Ignores other values like "line-through", "overline"

**Real CSS values**:
- `"none"` - No decoration (should produce no class or override class)
- `"underline"` - Underline text
- `"line-through"` - Strike-through text
- `"overline"` - Overline text

**Tailwind equivalents**:
- `underline` - Underlined
- `line-through` - Strikethrough
- `no-underline` - Remove underline
- `overline` - Overline (less common in Tailwind)

**Tests using it**:
```typescript
// From css-to-tw-context.test.ts - textStyle value
textDecoration: "none"  // Should not produce "underline" class
```

**Recommended improvement**:
```typescript
// Add custom handler for textDecoration in processProperty()
if (prop === 'textDecoration') {
  if (value === 'none') return; // Skip this property
  if (value === 'underline') className = 'underline';
  if (value === 'line-through') className = 'line-through';
  if (value === 'overline') className = 'overline';
  if (value === 'blink') return; // Not supported in modern Tailwind
}
```

---

### ⚠️ **fontStyle** (Already in propertyMap)

**Current implementation**:
```typescript
fontStyle: {
  pattern: /^.*$/,
  classPrefix: "italic"
}
```

**Problem**:
- Hardcoded to use "italic" prefix
- Doesn't check if value is actually "italic"
- Would incorrectly add "italic" class for value "normal"

**CSS values**:
- `"normal"` - Normal font style (should produce no class)
- `"italic"` - Italicized text
- `"oblique"` - Oblique text (rarely used)

**Tailwind equivalents**:
- `italic` - Apply italic styling
- `not-italic` - Remove italic styling

**Recommended improvement**:
```typescript
// Add custom handler for fontStyle in processProperty()
if (prop === 'fontStyle') {
  if (value === 'italic') className = 'italic';
  else if (value === 'normal') return; // Skip this property
  else if (value === 'oblique') className = 'italic'; // Fallback
}
```

---

## Summary Table

| Property | Status | Tests | Samples | Priority | Implementation |
|----------|--------|-------|---------|----------|-----------------|
| `pointerEvents` | ❌ Missing | ✅ css-to-tw.test.ts | ❌ | CRITICAL | Add to propertyMap |
| `cursor` | ❌ Missing | ❌ | ✅ button.ts | CRITICAL | Add to propertyMap |
| `textStyle` | ✅ Present | ✅ css-to-tw-context.test.ts (27+) | ❌ | DONE | No action needed |
| `userSelect` | ❌ Missing | ❌ | ❌ | Medium | Add to propertyMap |
| `whiteSpace` | ❌ Missing | ❌ | ❌ | Medium | Add to propertyMap |
| `textDecoration` | ✅ Present | ✅ (via textStyle) | ❌ | Improve | Fix value handling |
| `fontStyle` | ✅ Present | ⚠️ (via textStyle) | ❌ | Improve | Fix value handling |

---

## Code Locations for Reference

### Test Files
- [css-to-tw.test.ts](packages/panda2tw/tests/css-to-tw.test.ts#L102) - Line 102: pointerEvents usage
- [css-to-tw-context.test.ts](packages/panda2tw/tests/css-to-tw-context.test.ts) - Lines 1-694: textStyle tests
- [jsx-props.test.ts](packages/panda2tw/tests/jsx-props.test.ts)
- [cva-to-tw.test.ts](packages/panda2tw/tests/cva-to-tw.test.ts)

### Sample Files
- [button.ts](packages/panda2tw/samples/button.ts#L12) - Line 12: cursor property

### Source Files to Modify
- [css-to-tw.ts](packages/panda2tw/src/css-to-tw.ts#L12) - propertyMap definition (line 12-97)
- [parser.ts](packages/panda2tw/src/parser.ts#L170) - DEFAULT_PANDA_PROPERTIES reference

---

## Next Steps

1. **Add missing properties to propertyMap in css-to-tw.ts**:
   - ✅ `pointerEvents`
   - ✅ `cursor`
   - ⚠️ `userSelect` (lower priority)
   - ⚠️ `whiteSpace` (lower priority)

2. **Improve special handling**:
   - `textDecoration` - Add value-aware logic
   - `fontStyle` - Add value-aware logic

3. **No changes needed for**:
   - `textStyle` - Already working correctly

4. **Add test cases** for newly added properties to ensure proper Tailwind conversion
