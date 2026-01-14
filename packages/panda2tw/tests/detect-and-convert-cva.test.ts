import { describe, expect, test } from "vitest";
import { detectAndConvertCvaInCode } from "../src/detect-and-convert-cva";

describe("detectAndConvertCvaInCode", () => {
  test("detects CVA in const declaration with define.recipe", () => {
    const code = `
const avatar = define.recipe({
  base: {
    display: 'flex',
    position: 'relative',
  },
  variants: {
    size: {
      sm: { width: '16', height: '16' },
      md: { width: '24', height: '24' },
    },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("flex");
    expect(result).toContain("relative");
    expect(result).toContain("w-16");
    expect(result).toContain("h-24");
  });

  test("detects CVA in const declaration with cva() function", () => {
    const code = `
const buttonCva = cva({
  base: { padding: '2', borderRadius: 'md' },
  variants: {
    variant: {
      primary: { backgroundColor: 'blue.600', color: 'white' },
      secondary: { backgroundColor: 'gray.200' },
    },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("p-2");
    expect(result).toContain("primary");
    expect(result).toContain("bg-blue");
  });

  test("detects CVA in call expression (e.g., styled.div)", () => {
    const code = `
const StyledBox = styled.div({
  base: {
    display: 'flex',
    padding: '4',
  },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("flex");
    expect(result).toContain("p-4");
    expect(result).toContain("direction");
  });

  test("ignores objects without base+variants structure", () => {
    const code = `
const config = {
  name: 'avatar',
  base: 'flex',
};
`;
    const result = detectAndConvertCvaInCode(code);
    // Should not convert because no variants property
    expect(result).toBe(code);
  });

  test("preserves non-CVA code", () => {
    const code = `
const regularConfig = {
  className: 'avatar',
  display: 'flex',
};

const avatar = cva({
  base: { display: 'flex' },
  variants: { size: { sm: { width: '16' } } },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("const regularConfig");
    expect(result).toContain("className: 'avatar'");
    expect(result).toContain("flex");
  });

  test("handles multiple CVA definitions in one file", () => {
    const code = `
const avatarCva = cva({
  base: { display: 'flex' },
  variants: { size: { sm: { width: '16' } } },
});

const buttonCva = cva({
  base: { padding: '2' },
  variants: { variant: { primary: { backgroundColor: 'blue.600' } } },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("flex");
    expect(result).toContain("w-16");
    expect(result).toContain("p-2");
    expect(result).toContain("bg-blue");
  });

  test("converts slot-based CVA (with slots property)", () => {
    const code = `
const avatar = define.slotRecipe({
  slots: ['root', 'image', 'fallback'],
  base: {
    root: { display: 'flex', position: 'relative' },
    image: { width: '100%', height: '100%' },
  },
  variants: {
    size: {
      sm: { root: { width: '32px', height: '32px' } },
      lg: { root: { width: '64px', height: '64px' } },
    },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("flex");
    expect(result).toContain("relative");
    expect(result).toContain("w-full");
  });

  test("preserves className and other properties while converting styles", () => {
    const code = `
const avatar = define.recipe({
  className: 'avatar',
  base: { display: 'flex', position: 'relative' },
  variants: { size: { sm: { width: '16' } } },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("className");
    expect(result).toContain("flex");
    expect(result).toContain("relative");
  });

  test("handles edge case: base without variants should not be converted", () => {
    const code = `
const styles = {
  base: { display: 'flex' },
};
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toBe(code);
  });

  test("converts nested slot styles correctly", () => {
    const code = `
const cardRecipe = define.slotRecipe({
  slots: ['root', 'header', 'body'],
  base: {
    root: { display: 'flex', flexDirection: 'column' },
    header: { padding: '4', borderBottom: '1px solid black' },
    body: { padding: '4' },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);
    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
    expect(result).toContain("p-4");
  });

  test("converts slot recipe with CSS selectors to single string", () => {
    const code = `
const avatar = define.slotRecipe({
  slots: ['root', 'image', 'fallback'],
  base: {
    root: {
      display: 'flex',
      position: 'relative',
      borderRadius: 'default',
      backgroundColor: 'background.secondary',
      overflow: 'hidden',
      '&:has(> .avatar__fallback)': {
        border: 'ui-kit-base',
      },
    },
    image: { objectFit: 'full', height: 'full' },
    fallback: { objectFit: 'full', height: 'full' },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);

    // Should have converted styles as a single string per slot
    expect(result).toContain("root:");
    expect(result).toContain("image:");
    expect(result).toContain("fallback:");

    // All classes should be in a string value, including the arbitrary selector
    expect(result).toMatch(/root:\s*"[^"]*flex[^"]*"/);
    expect(result).toMatch(/root:\s*"[^"]*\[&:has\([^)]*\)\][^"]*"/);

    // Should not have nested object with __base or selector keys
    expect(result).not.toContain("__base");
    expect(result).not.toMatch(/"\[&:has/);
    expect(result).toMatchInlineSnapshot(`
      "
      const avatar = define.slotRecipe({
        slots: ['root', 'image', 'fallback'],
        base: {
          root: "flex relative rounded-default bg-background-secondary overflow-hidden [&:has(>_.avatar__fallback)]:border-ui-kit-base",
          image: "object-full h-full",
          fallback: "object-full h-full",
        },
      });
      "
    `);
  });

  test("converts slot recipe with pseudo-elements correctly", () => {
    const code = `
const badge = define.slotRecipe({
  slots: ['root', 'content'],
  base: {
    root: {
      position: 'relative',
      display: 'inline-block',
    },
    content: {
      display: 'flex',
      '_before': {
        content: '""',
        position: 'absolute',
      },
    },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);

    // Should have converted to simple string values
    expect(result).toContain("root:");
    expect(result).toContain("content:");
    expect(result).toMatch(/content:\s*"[^"]*flex[^"]*"/);
    // Pseudo-element content should be converted to content-[] class
    expect(result).toMatch(/content:\s*"[^"]*content-\[\\\\\\"[^"]*"/);
    expect(result).toMatchInlineSnapshot(`
      "
      const badge = define.slotRecipe({
        slots: ['root', 'content'],
        base: {
          root: "relative inline-block",
          content: "flex before:content-[\\\\\\"\\\\\\"] before:absolute",
        },
      });
      "
    `);
  });

  test("maintains single string format for slots without selectors", () => {
    const code = `
const buttonRecipe = define.slotRecipe({
  slots: ['root', 'label'],
  base: {
    root: {
      display: 'flex',
      padding: '2',
      borderRadius: 'md',
    },
    label: {
      fontSize: 'sm',
      fontWeight: 'medium',
    },
  },
});
`;
    const result = detectAndConvertCvaInCode(code);

    // Each slot should be a simple string, not an object
    expect(result).toMatch(/root:\s*"[^"]*flex[^"]*"/);
    expect(result).toMatch(/label:\s*"[^"]*text-sm[^"]*"/);

    // Should not have any nested objects with __base or selector keys
    expect(result).not.toContain("__base");
    expect(result).not.toContain("__");
    expect(result).toMatchInlineSnapshot(`
      "
      const buttonRecipe = define.slotRecipe({
        slots: ['root', 'label'],
        base: {
          root: "flex p-2 rounded-md",
          label: "text-sm font-medium",
        },
      });
      "
    `);
  });
});
