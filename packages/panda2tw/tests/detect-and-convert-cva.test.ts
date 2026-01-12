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
});
