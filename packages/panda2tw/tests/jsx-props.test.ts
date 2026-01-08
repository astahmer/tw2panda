import { describe, expect, test } from "vitest";
import { rewritePandaToTailwind } from "../src/rewrite.js";

describe("JSX Props Conversion", () => {
  test("converts JSX elements with Panda props to Tailwind classes", () => {
    const input = `
import { Stack, Center } from '@weliihq/styled-system/jsx';

export const Component = () => {
  return (
    <Stack display="flex" gap="16">
      <Center width="100" height="100" />
    </Stack>
  );
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    expect(result.output).toMatchInlineSnapshot(`
      "
      export const Component = () => {
        return (
          <Stack className="flex gap-16" >
            <Center className="w-100 h-100" />
          </Stack>
        );
      };"
    `);
    expect(result.conversions).toMatchInlineSnapshot(`
      [
        {
          "original": "display="flex" gap="16"",
          "replacement": "className="flex gap-16"",
        },
        {
          "original": "width="100" height="100"",
          "replacement": "className="w-100 h-100"",
        },
      ]
    `);

    // Strict assertions
    expect(result.output).toContain('className="flex gap-16"');
    expect(result.output).toContain('className="w-100 h-100"');
    expect(result.output).toContain("<Stack");
    expect(result.output).toContain("<Center");
    expect(result.conversions).toHaveLength(2);
    expect(result.conversions[0]).toEqual({
      original: 'display="flex" gap="16"',
      replacement: 'className="flex gap-16"',
    });
    expect(result.conversions[1]).toEqual({
      original: 'width="100" height="100"',
      replacement: 'className="w-100 h-100"',
    });
  });

  test("preserves non-Panda props when present", () => {
    const input = `
import { Button } from '@weliihq/ui-kit';

export const Component = () => {
  return <Button variant="primary" onClick={handleClick} />;
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    expect(result.output).toMatchInlineSnapshot(`
      "import { Button } from '@weliihq/ui-kit';

      export const Component = () => {
        return <Button variant="primary" onClick={handleClick} />;
      };"
    `);
    expect(result.conversions).toMatchInlineSnapshot("[]");

    // Strict assertions
    expect(result.output).toContain('variant="primary"');
    expect(result.output).toContain("onClick={handleClick}");
    expect(result.output).not.toContain("className=");
    expect(result.conversions).toHaveLength(0);
  });

  test("handles className={css(...)} correctly without doubling className", () => {
    const input = `
export function Avatar() {
  return (
    <img
      className={css({ width: '[80px]', height: '[80px]' })}
      alt="presentation"
    />
  );
}
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    expect(result.output).toMatchInlineSnapshot(`
      "export function Avatar() {
        return (
          <img
            className={"w-[80px] h-[80px]"}
            alt="presentation"
          />
        );
      }"
    `);
    expect(result.conversions).toMatchInlineSnapshot(`
      [
        {
          "original": "css({ width: '[80px]', height: '[80px]' })",
          "replacement": ""w-[80px] h-[80px]"",
        },
      ]
    `);

    // Strict assertions - ensure we don't have className={className="..."}
    expect(result.output).not.toContain("className={className=");
    expect(result.output).toContain('className={"w-[80px] h-[80px]"}');
    expect(result.conversions).toHaveLength(1);
  });

  test("converts css prop to className", () => {
    const input = `
export const Component = () => {
  return (
    <div css={{ display: "flex", gap: "16", marginTop: "4" }} />
  );
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    // Check if the css prop is being converted at all
    expect(result.output).toContain("className");
    expect(result.output).not.toContain("css=");
  });

  test("converts css prop with responsive values to className", () => {
    const input = `
export const Component = () => {
  return (
    <div css={{
      display: "block",
      md: { display: "flex", gap: "8" }
    }} />
  );
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    expect(result.output).toContain("className=");
    expect(result.output).toContain("flex");
    expect(result.output).toContain("md:");
    expect(result.output).not.toContain("css=");
    expect(result.conversions).toHaveLength(1);
  });

  test("converts css prop with shorthand properties", () => {
    const input = `
export const Card = () => {
  return (
    <div css={{ p: "4", mt: "2", rounded: "md" }} />
  );
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    expect(result.output).toContain("className=");
    expect(result.output).toContain("p-4");
    expect(result.output).toContain("mt-2");
    expect(result.output).toContain("rounded-md");
    expect(result.output).not.toContain("css=");
    expect(result.conversions).toHaveLength(1);
  });

  test("converts multiple css props in different elements", () => {
    const input = `
export const Layout = () => {
  return (
    <>
      <header css={{ bg: "blue.500", py: "4" }} />
      <main css={{ p: "8", flex: "1" }} />
    </>
  );
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    expect(result.output).toContain('className="');
    expect(result.output).not.toContain("css=");
    expect(result.conversions).toHaveLength(2);
  });

  test("handles mixed Panda props and css prop correctly", () => {
    const input = `
export const Button = () => {
  return (
    <button display="inline-flex" css={{ padding: "2", rounded: "md" }} />
  );
};
    `.trim();

    const result = rewritePandaToTailwind(input, "test.tsx");

    // Both props should be converted to className
    expect(result.output).toContain("className=");
    expect(result.output).not.toContain("display=");
    expect(result.output).not.toContain("css=");
    expect(result.conversions).toHaveLength(1);
  });
});
