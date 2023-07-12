import { describe, expect, test } from "vitest";
import { evalTheme } from "../src/tw-eval-theme";
import { initialInputList } from "../../../demo-code-sample";

describe("tw-eval-theme", () => {
  test("Playground themeCode", () => {
    expect(evalTheme(initialInputList["tailwind.config.js"])).toMatchInlineSnapshot(
      `
      {
        "theme": {
          "extend": {},
        },
      }
    `,
    );
  });
});
