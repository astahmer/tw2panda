import { describe, expect, test } from "vitest";
import { detectAndConvertCvaInCode } from "../src/detect-and-convert-cva";

describe("rewrite integration with CVA detection", () => {
  test("rewrites a file with CVA recipe definition", () => {
    const code = `
import { defineStyle } from 'styled-system/jsx';

const avatarStyles = defineStyle.recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
  },
  variants: {
    size: {
      sm: {
        width: '8',
        height: '8',
      },
      lg: {
        width: '16',
        height: '16',
      },
    },
  },
});

export default avatarStyles;
`;

    const result = detectAndConvertCvaInCode(code);

    // The import and export should remain unchanged
    expect(result).toContain("import { defineStyle }");
    expect(result).toContain("export default avatarStyles");

    // The styles should be converted to Tailwind
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("w-8");
    expect(result).toContain("h-16");
  });

  test("rewrites a file with styled.div CVA", () => {
    const code = `
const Box = styled.div({
  base: {
    display: 'flex',
    padding: '4',
    margin: '2',
  },
  variants: {
    color: {
      blue: { backgroundColor: 'blue.500', color: 'white' },
      red: { backgroundColor: 'red.500', color: 'white' },
    },
  },
});
`;

    const result = detectAndConvertCvaInCode(code);

    expect(result).toContain("const Box");
    expect(result).toContain("styled.div");
    expect(result).toContain("flex");
    expect(result).toContain("p-4");
    expect(result).toContain("m-2");
    expect(result).toContain("blue");
    expect(result).toContain("red");
  });

  test("preserves JSX and other code structure", () => {
    const code = `
function Avatar({ size = 'md', variant = 'default' }: AvatarProps) {
  const styles = cva({
    base: {
      display: 'inline-flex',
      borderRadius: 'full',
    },
    variants: {
      size: {
        sm: { width: '8', height: '8' },
        md: { width: '12', height: '12' },
      },
    },
  });

  return <img className={styles({ size, variant })} />;
}
`;

    const result = detectAndConvertCvaInCode(code);

    // Function and JSX should be preserved
    expect(result).toContain("function Avatar");
    expect(result).toContain("AvatarProps");
    expect(result).toContain("<img className=");

    // Styles should be converted
    expect(result).toContain("inline-flex");
    expect(result).toContain("rounded-full");
  });

  test("rewrites a CVA with textStyle property", () => {
    const code = `
const cardStyles = cva({
  base: {
    textStyle: 'body',
    padding: '4',
    borderRadius: 'md',
  },
  variants: {
    variant: {
      heading: {
        textStyle: 'heading',
      },
      caption: {
        textStyle: 'caption',
        fontSize: 'sm',
      },
    },
  },
});
`;

    const result = detectAndConvertCvaInCode(code);

    expect(result).toContain("const cardStyles");
    expect(result).toContain("cva");
    // textStyle should be converted to text-style-* classes
    expect(result).toContain("text-style-body");
    expect(result).toContain("text-style-heading");
    expect(result).toContain("text-style-caption");
    // Other properties should also be converted
    expect(result).toContain("p-4");
    expect(result).toContain("rounded-md");
    expect(result).toContain("text-sm");
  });
});

