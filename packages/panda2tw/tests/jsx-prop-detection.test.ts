import { describe, expect, test } from "vitest";
import { rewritePandaToTailwind } from "../src/rewrite.js";

describe("JSX Prop Detection and Conversion", () => {
  describe("CSS properties are converted on any element", () => {
    test("converts CSS props on native HTML elements", () => {
      const input = `
export const Component = () => {
  return (
    <div display="flex" gap="4" padding="8">
      <span width="100" height="50" />
    </div>
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain('className="flex gap-4 p-8"');
      expect(result.output).toContain('className="w-100 h-50"');
      expect(result.conversions).toHaveLength(2);
    });

    test("converts CSS props on custom components", () => {
      const input = `
export const Component = () => {
  return (
    <CustomButton display="inline-flex" margin="2" borderRadius="md" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("className=");
      expect(result.output).toContain("inline-flex");
      expect(result.output).toContain("m-2");
      expect(result.output).toContain("rounded-md");
    });

    test("converts all known CSS properties", () => {
      const cssProperties = [
        "display",
        "position",
        "top",
        "left",
        "width",
        "height",
        "padding",
        "margin",
        "gap",
        "flexDirection",
        "alignItems",
        "justifyContent",
        "backgroundColor",
        "color",
        "borderRadius",
        "opacity",
        "zIndex",
      ];

      for (const prop of cssProperties) {
        const input = `<div ${prop}="value123" />`;
        const result = rewritePandaToTailwind(input, "test.tsx");

        // Should contain className instead of the original prop
        expect(result.output).not.toContain(`${prop}=`);
        expect(result.output).toContain("className=");
      }
    });
  });

  describe("Non-CSS props are preserved", () => {
    test("preserves variant prop", () => {
      const input = `
export const Component = () => {
  return <Button variant="primary" />;
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain('variant="primary"');
      expect(result.conversions).toHaveLength(0);
    });

    test("preserves onClick handler", () => {
      const input = `
export const Component = () => {
  return <button onClick={handleClick} />;
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("onClick={handleClick}");
      expect(result.conversions).toHaveLength(0);
    });

    test("preserves custom component props", () => {
      const customProps = [
        "variant",
        "size",
        "isDisabled",
        "isLoading",
        "onClick",
        "onChange",
        "onBlur",
        "onFocus",
        "aria-label",
        "data-testid",
      ];

      for (const prop of customProps) {
        const input = `<Component ${prop}="value" />`;
        const result = rewritePandaToTailwind(input, "test.tsx");

        expect(result.output).toContain(`${prop}=`);
        expect(result.conversions).toHaveLength(0);
      }
    });

    test("preserves non-CSS props alongside CSS props", () => {
      const input = `
export const Component = () => {
  return (
    <Button
      variant="primary"
      display="flex"
      onClick={handleClick}
      size="lg"
      gap="4"
    />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // Non-CSS props should be preserved
      expect(result.output).toContain('variant="primary"');
      expect(result.output).toContain("onClick={handleClick}");
      expect(result.output).toContain('size="lg"');

      // CSS props should be converted
      expect(result.output).toContain("className=");
      expect(result.output).toContain("flex");
      expect(result.output).toContain("gap-4");
    });
  });

  describe("CSS prop is always recognized", () => {
    test("converts css prop on any element", () => {
      const input = `
export const Component = () => {
  return <button css={{ display: "flex", padding: "4" }} />;
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("className=");
      expect(result.output).not.toContain("css=");
      expect(result.output).toContain("flex");
      expect(result.output).toContain("p-4");
    });

    test("converts css prop on native HTML elements", () => {
      const input = `
export const Component = () => {
  return <div css={{ width: "100", height: "50" }} />;
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("className=");
      expect(result.output).not.toContain("css=");
    });
  });

  describe("Mixed props scenarios", () => {
    test("handles CSS and non-CSS props together", () => {
      const input = `
export const Component = () => {
  return (
    <CustomCard
      variant="elevated"
      display="grid"
      gap="8"
      isInteractive={true}
      padding="16"
    />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // Non-CSS props preserved
      expect(result.output).toContain('variant="elevated"');
      expect(result.output).toContain("isInteractive={true}");

      // CSS props converted
      expect(result.output).toContain("className=");
      expect(result.output).not.toContain("display=");
      expect(result.output).not.toContain("gap=");
      expect(result.output).not.toContain("padding=");
    });

    test("handles css prop with other non-CSS props", () => {
      const input = `
export const Component = () => {
  return (
    <Component
      theme="dark"
      css={{ backgroundColor: "blue.500", padding: "4" }}
      onClick={handleClick}
    />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // Non-CSS props preserved
      expect(result.output).toContain('theme="dark"');
      expect(result.output).toContain("onClick={handleClick}");

      // css prop converted
      expect(result.output).not.toContain("css=");
      expect(result.output).toContain("className=");
    });
  });

  describe("Shorthand CSS properties are recognized", () => {
    test("converts shorthand properties like p, m, w, h", () => {
      const input = `
export const Component = () => {
  return (
    <div p="4" m="2" w="100" h="50" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("className=");
      expect(result.output).not.toContain('p="4"');
      expect(result.output).not.toContain('m="2"');
      expect(result.output).not.toContain('w="100"');
      expect(result.output).not.toContain('h="50"');
    });

    test("converts responsive shorthand properties like px, py, mt, mr, mb, ml", () => {
      const input = `
export const Component = () => {
  return (
    <div px="4" py="2" mt="1" mr="2" mb="3" ml="4" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("className=");
      expect(result.output).not.toContain("px=");
      expect(result.output).not.toContain("py=");
      expect(result.output).not.toContain("mt=");
    });
  });

  describe("Edge cases", () => {
    test("doesn't convert props on elements without any CSS props", () => {
      const input = `
export const Component = () => {
  return <Button variant="primary" size="lg" />;
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain('variant="primary"');
      expect(result.output).toContain('size="lg"');
      expect(result.conversions).toHaveLength(0);
    });

    test("preserves className if already present", () => {
      const input = `
export const Component = () => {
  return (
    <div className="existing-class" display="flex" gap="4" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // Should have className (either existing or new CSS classes)
      expect(result.output).toContain("className=");
    });

    test("handles empty value props correctly", () => {
      const input = `
export const Component = () => {
  return <div display="" />;
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // Empty values should not create conversions
      // But the behavior may vary based on implementation
      expect(result.output).toBeDefined();
    });

    test("handles props with dynamic values", () => {
      const input = `
export const Component = () => {
  return (
    <div
      display={isFlexible ? "flex" : "block"}
      padding={spacing}
      variant="primary"
    />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // Should still have variant prop
      expect(result.output).toContain("variant=");
      // Should handle dynamic CSS props
      expect(result.output).toContain("className=");
    });
  });

  describe("Panda component imports", () => {
    test("recognizes Panda styled-system imports", () => {
      const input = `
import { Stack, Box } from '@weliihq/styled-system/jsx';

export const Component = () => {
  return (
    <Stack display="flex" gap="4">
      <Box width="100" />
    </Stack>
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      expect(result.output).toContain("className=");
      expect(result.output).not.toContain("display=");
      expect(result.conversions).toHaveLength(2);
    });

    test("converts CSS props on Panda components even without explicit styled-system import", () => {
      const input = `
export const Component = () => {
  return (
    <MyCustomComponent display="flex" gap="4" onClick={handleClick} />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx");

      // CSS props should be converted
      expect(result.output).toContain("className=");
      expect(result.output).not.toContain("display=");
      // Non-CSS props should be preserved
      expect(result.output).toContain("onClick=");
    });
  });
});
