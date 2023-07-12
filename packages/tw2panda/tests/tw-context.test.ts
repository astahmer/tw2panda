import { describe, expect, test } from "vitest";
import { createTailwindContext } from "../src/tw-context";
import { initialInputList } from "../../../demo-code-sample";

describe("tw-context", () => {
  test("createTailwindContext", () => {
    const ctx = createTailwindContext(initialInputList["tailwind.config.js"]);
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
    `,
    );
  });
});
