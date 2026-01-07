# Quick Reference: panda2tw

## Installation

```bash
# From npm
npm install panda2tw
# or with pnpm
pnpm add panda2tw
```

## CLI Usage

### Basic Commands

```bash
# Convert a single file (stdout)
panda2tw rewrite src/button.tsx

# Convert and write back to file
panda2tw rewrite src/button.tsx -w

# Convert a CSS object string
panda2tw convert "{ display: 'flex', color: 'red.500' }"

# Show help
panda2tw --help
panda2tw rewrite --help
```

## API Usage

### Basic Transformation

```typescript
import { rewritePandaToTailwind } from "panda2tw";

const fileContent = `
import { css } from "styled-system/css";

const styles = css({
  display: "flex",
  color: "red.500"
});
`;

const result = rewritePandaToTailwind(fileContent, "button.ts");
console.log(result.output);
console.log(result.conversions); // List of changes made
```

### CSS Object Conversion

```typescript
import { extractTailwindClassesFromPandaCss } from "panda2tw";

const cssObj = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.5rem",
  _hover: {
    backgroundColor: "blue.600"
  },
  md: {
    display: "grid"
  }
};

const classes = extractTailwindClassesFromPandaCss(cssObj);
// Result: ["inline-flex", "items-center", "p-2", "hover:bg-blue-600", "md:grid"]
```

### CVA Conversion

```typescript
import { pandaCvaToTailwind } from "panda2tw";

const cvaConfig = {
  base: {
    display: "inline-flex",
    alignItems: "center"
  },
  variants: {
    variant: {
      default: { backgroundColor: "blue.600" },
      ghost: { backgroundColor: "transparent" }
    }
  }
};

const result = pandaCvaToTailwind(cvaConfig);
console.log(result); // Comments showing the mapping
```

## Property Mapping Examples

| Panda CSS | Tailwind |
|-----------|----------|
| `{ display: "flex" }` | `flex` |
| `{ color: "red.500" }` | `text-red-500` |
| `{ backgroundColor: "blue.600" }` | `bg-blue-600` |
| `{ padding: "2" }` | `p-2` |
| `{ _hover: { ... } }` | `hover:...` |
| `{ _focus: { ... } }` | `focus:...` |
| `{ md: { ... } }` | `md:...` |
| `{ dark: { ... } }` | `dark:...` |

## Pseudo-Selector Prefixes

- `_hover` → `hover:`
- `_focus` → `focus:`
- `_active` → `active:`
- `_disabled` → `disabled:`
- `_visited` → `visited:`
- `_group-hover` → `group-hover:`
- And many more...

## Responsive Breakpoints

Default Tailwind breakpoints (customize as needed):
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

## Common Conversions

### Button Component
```typescript
// Before (Panda)
const buttonClasses = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem 1rem",
  borderRadius: "md",
  fontSize: "sm",
  fontWeight: "medium",
  _hover: { backgroundColor: "primary/90" },
  _disabled: { pointerEvents: "none", opacity: "0.5" }
});

// After (Tailwind)
const buttonClasses = "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50";
```

### Responsive Layout
```typescript
// Before (Panda)
const containerClasses = css({
  display: "block",
  md: { display: "flex" },
  lg: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }
});

// After (Tailwind)
const containerClasses = "block md:flex lg:grid lg:grid-cols-3";
```

## Tips & Tricks

1. **Review converted code** - Always review the output, especially for complex patterns
2. **Test in browser** - Verify styling looks correct after conversion
3. **Batch conversions** - Use the API programmatically for converting multiple files
4. **Keep originals** - Use version control to track changes
5. **Custom utilities** - May need manual handling if using custom Panda utilities

## Limitations

- Complex CVA variants are shown as comments for manual review
- Custom Tailwind themes require manual mapping updates
- Arbitrary/dynamic values may not convert automatically
- Custom utilities need manual conversion

## Troubleshooting

### CSS Object Parsing Error
If you get parsing errors, check that:
- The CSS object is valid JavaScript
- String values are properly quoted
- Nested objects are properly formatted

### Missing Classes
If some classes aren't converting:
- Check if they're custom utilities
- Verify property names are correct
- Check if theme tokens need custom mapping

### Import Issues
If imports aren't being removed:
- The tool only removes `styled-system` imports
- Other imports must be cleaned up manually

## Getting Help

- Check the [package README](./packages/panda2tw/README.md)
- Look at [tests](./packages/panda2tw/tests) for examples
- Review [API documentation](./packages/panda2tw/src)
