import { describe, expect, test } from "vitest";
import { initialInputList } from "../src/components/Playground/Playground.constants";
import { createTailwindContext } from "../src/converter/tw-context";

describe("tw-context", () => {
  test("createTailwindContext", () => {
    const ctx = createTailwindContext(initialInputList["theme.ts"]);
    expect(Object.keys(ctx.context)).toMatchInlineSnapshot(`
      [
        "disposables",
        "ruleCache",
        "candidateRuleCache",
        "classCache",
        "applyClassCache",
        "notClassCache",
        "postCssNodeCache",
        "candidateRuleMap",
        "tailwindConfig",
        "changedContent",
        "variantMap",
        "stylesheetCache",
        "variantOptions",
        "markInvalidUtilityCandidate",
        "markInvalidUtilityNode",
        "offsets",
        "getClassOrder",
        "getClassList",
        "getVariants",
      ]
    `);
    expect(Object.keys(ctx.config)).toMatchInlineSnapshot(
      `
      [
        "theme",
        "corePlugins",
        "plugins",
        "content",
        "presets",
        "darkMode",
        "prefix",
        "important",
        "separator",
        "safelist",
        "blocklist",
      ]
    `
    );
  });
});
