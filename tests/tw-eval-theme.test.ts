import { describe, expect, test } from "vitest";
import { initialInputList } from "../src/components/Playground/Playground.constants";
import { evalTheme } from "../src/converter/tw-eval-theme";

describe("tw-eval-theme", () => {
  test("Playground themeCode", () => {
    expect(evalTheme(initialInputList["theme.ts"])).toMatchInlineSnapshot(
      `
      {
        "theme": {
          "extend": {},
        },
      }
    `
    );
  });
});
