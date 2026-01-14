import { describe, expect, test } from "vitest";
import { rewritePandaToTailwind } from "../src/rewrite.js";

describe("--with-jsx-stack flag (Selective JSX Prop Conversion)", () => {
  describe("Stack component", () => {
    test("keeps exposed props with exposed values as JSX attributes", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack direction="col" align="center" gap="4" w="full" h="full" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // No className should be generated since all props are exposed variants with exposed values
      expect(result.output).not.toContain("className");
      // Props should remain as JSX attributes
      expect(result.output).toContain('direction="col"');
      expect(result.output).toContain('align="center"');
      expect(result.output).toContain('gap="4"');
      expect(result.output).toContain('w="full"');
      expect(result.output).toContain('h="full"');
    });

    test("converts non-exposed props to className", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack gap="4" padding="32px" color="text-blue-500" w="full" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // Non-exposed props should be converted
      expect(result.output).toContain("className");
      expect(result.output).toContain("p-32px");
      expect(result.output).toContain("text-text-blue-500");
      // Exposed props should stay
      expect(result.output).toContain('gap="4"');
      expect(result.output).toContain('w="full"');
    });

    test("converts exposed props with non-exposed values to className", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack gap="99" align="baseline" w="[custom-value]" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // All props have non-exposed values, so should convert
      expect(result.output).toContain("className");
      expect(result.output).toContain("gap-99");
      expect(result.output).toContain("baseline");
      expect(result.output).toContain("w-[custom-value]");
    });

    test("keeps wrap={true} as JSX prop since it's exposed", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack wrap={true} gap="4" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // wrap={true} should stay since it's an exposed variant with exposed value
      expect(result.output).toContain("wrap={true}");
      expect(result.output).toContain('gap="4"');
    });
  });

  describe("HStack component", () => {
    test("keeps exposed props as JSX attributes and converts non-exposed", () => {
      const input = `
export const MyHStack = () => {
  return (
    <HStack gap="8" color="text-red-500" justifyContent="between" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // Exposed props should stay
      expect(result.output).toContain('gap="8"');
      expect(result.output).toContain('justifyContent="between"');
      // Non-exposed should convert
      expect(result.output).toContain("className");
      expect(result.output).toContain("text-text-red-500");
    });
  });

  describe("Flex component", () => {
    test("applies selective conversion to Flex", () => {
      const input = `
export const MyFlex = () => {
  return (
    <Flex direction="row" gap="4" backgroundColor="bg-gray-100" h="full" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // Exposed props should stay
      expect(result.output).toContain('direction="row"');
      expect(result.output).toContain('gap="4"');
      expect(result.output).toContain('h="full"');
      // Non-exposed should convert
      expect(result.output).toContain("className");
      expect(result.output).toContain("bg-bg-gray-100");
    });
  });

  describe("Box component", () => {
    test("applies selective conversion to Box", () => {
      const input = `
export const MyBox = () => {
  return (
    <Box padding="16px" color="text-green-500" w="full" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // w="full" should stay (exposed)
      expect(result.output).toContain('w="full"');
      // Non-exposed should convert
      expect(result.output).toContain("className");
      expect(result.output).toContain("p-16px");
      expect(result.output).toContain("text-text-green-500");
    });
  });

  describe("other components", () => {
    test("converts ALL props for non-selective components even with flag", () => {
      const input = `
export const MyCard = () => {
  return (
    <Card gap="4" padding="32px" color="text-blue-500" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // All props should be converted since Card is not in the selective list
      expect(result.output).toContain("className");
      expect(result.output).toContain("gap-4");
      expect(result.output).toContain("p-32px");
      expect(result.output).toContain("text-text-blue-500");
      // Props should not remain as JSX attributes
      expect(result.output).not.toContain('gap="4"');
      expect(result.output).not.toContain('padding="32px"');
    });
  });

  describe("without flag (default behavior)", () => {
    test("converts ALL CSS props for all components", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack gap="4" padding="32px" color="text-blue-500" w="full" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: false });

      // All CSS props should be converted
      expect(result.output).toContain("className");
      expect(result.output).toContain("gap-4");
      expect(result.output).toContain("p-32px");
      expect(result.output).toContain("text-text-blue-500");
      expect(result.output).toContain("w-full");
      // No CSS props should remain as JSX attributes
      expect(result.output).not.toContain('gap="4"');
      expect(result.output).not.toContain('padding="32px"');
      expect(result.output).not.toContain('color="text-blue-500"');
      expect(result.output).not.toContain('w="full"');
    });

    test("converts ALL props without the flag (default)", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack gap="8" color="text-blue-500" justifyContent="between" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx"); // No options passed

      // All props should be converted
      expect(result.output).toContain("className");
      expect(result.output).toContain("gap-8");
      expect(result.output).toContain("text-text-blue-500");
      expect(result.output).toContain("justify-between");
    });
  });

  describe("mixed scenarios", () => {
    test("handles Stack with css prop and JSX props together", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack gap="4" css={{ marginTop: '20px' }} align="center" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // gap and align should stay (exposed)
      expect(result.output).toContain('gap="4"');
      expect(result.output).toContain('align="center"');
      // css prop should be converted
      expect(result.output).toContain("mt-20px");
    });

    test("preserves other JSX props that aren't CSS properties", () => {
      const input = `
export const MyStack = () => {
  return (
    <Stack gap="4" padding="16px" id="myStack" data-testid="stack" />
  );
};
      `.trim();

      const result = rewritePandaToTailwind(input, "test.tsx", { withJsxStack: true });

      // gap should stay (exposed)
      expect(result.output).toContain('gap="4"');
      // Non-CSS props should be preserved
      expect(result.output).toContain('id="myStack"');
      expect(result.output).toContain('data-testid="stack"');
      // Non-exposed CSS prop should convert
      expect(result.output).toContain("className");
      expect(result.output).toContain("p-16px");
    });
  });
});
