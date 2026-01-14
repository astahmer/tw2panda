# panda2tw

Convert Panda CSS code back to Tailwind CSS. This is the reverse of [tw2panda](../tw2panda).

## Features

- Convert Panda `css()` calls to Tailwind class strings
- Convert Panda `cva()` recipes to Tailwind class patterns
- CLI tool for batch conversions
- Support for responsive modifiers, pseudo-selectors, and conditions

## Installation

```bash
npm install panda2tw
# or
pnpm add panda2tw
```

## Usage

### CLI

```bash
# Convert a single file and output to stdout
panda2tw rewrite ./src/button.tsx

# Convert and write back to the file
panda2tw rewrite ./src/button.tsx -w

# Convert a CSS object string to Tailwind classes
panda2tw convert "{ display: 'flex', color: 'red.500' }"
```

### Programmatic API

```typescript
import { rewritePandaToTailwind, extractTailwindClassesFromPandaCss } from "panda2tw";

// Convert an entire file
const result = rewritePandaToTailwind(fileContent, filePath);
console.log(result.output); // Converted code

// Convert CSS objects directly
const cssObj = {
  display: "flex",
  color: "red.500",
  _hover: { backgroundColor: "blue.600" },
};

const classes = extractTailwindClassesFromPandaCss(cssObj);
console.log(classes); // ["flex", "text-red-500", "hover:bg-blue-600"]
```

## How It Works

The tool uses a property mapping to convert Panda CSS properties and values to their Tailwind equivalents:

- `{ display: "flex" }` → `"flex"`
- `{ color: "red.500" }` → `"text-red-500"`
- `{ _hover: { backgroundColor: "blue.600" } }` → `"hover:bg-blue-600"`
- `{ md: { display: "flex" } }` → `"md:flex"`

## Limitations

- **Complex variant logic**: The tool generates comments for complex CVA variant patterns rather than fully converting them. Manual review is recommended.
- **Theme tokens**: Conversion assumes Tailwind's default theme. Custom theme values may need manual adjustment.
- **Arbitrary values**: Panda's arbitrary values may not have direct Tailwind equivalents.
- **Custom utilities**: Custom Panda utilities won't be automatically converted.

## Examples

### From Panda CSS:

```typescript
import { css } from "styled-system/css";

export const buttonClasses = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "md",
  fontSize: "sm",
  fontWeight: "medium",
  _hover: {
    backgroundColor: "primary/90",
  },
  _disabled: {
    pointerEvents: "none",
    opacity: "0.5",
  },
});
```

### To Tailwind CSS:

```typescript
export const buttonClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50";
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT
