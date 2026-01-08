import { describe, test, expect } from "vitest";
import { expandShorthand, extractTailwindClassesFromPandaCss } from "../src/css-to-tw";

describe("Context-aware shorthand and responsive handling", () => {
  test("expandShorthand works without context (defaults)", () => {
    expect(expandShorthand("mt")).toBe("marginTop");
    expect(expandShorthand("px")).toBe("paddingX");
    expect(expandShorthand("unknownShorthand")).toBe("unknownShorthand");
  });

  test("expandShorthand works with undefined context (still uses defaults)", () => {
    // When context is undefined, it falls back to defaults
    expect(expandShorthand("mt", undefined)).toBe("marginTop");
    expect(expandShorthand("px", undefined)).toBe("paddingX");
  });

  test("extractTailwindClassesFromPandaCss detects responsive conditions correctly", () => {
    const cssObj = {
      display: "flex",
      base: {
        padding: "2",
      },
      md: {
        padding: "4",
      },
    };

    // Without context, it uses the default responsive condition keys
    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("flex");
    expect(classes).toContain("p-2"); // base padding without prefix
    expect(classes.some((c) => c === "md:p-4")).toBe(true);
  });

  test("extractTailwindClassesFromPandaCss works with shorthand properties", () => {
    const cssObj = {
      mt: "4", // margin-top shorthand
      px: "2", // padding-x shorthand
      base: {
        p: "2", // padding shorthand
      },
      md: {
        p: "4",
      },
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("mt-4");
    expect(classes).toContain("px-2");
    expect(classes).toContain("p-2");
    expect(classes.some((c) => c === "md:p-4")).toBe(true);
  });
});
