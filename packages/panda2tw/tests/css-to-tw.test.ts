import { describe, expect, test } from "vitest";
import {
  extractTailwindClassesFromPandaCss,
  pandaTokenToTwSuffix,
  camelToKebab,
} from "../src/css-to-tw";

describe("css-to-tw", () => {
  test("camelToKebab", () => {
    expect(camelToKebab("backgroundColor")).toBe("background-color");
    expect(camelToKebab("paddingTop")).toBe("padding-top");
    expect(camelToKebab("display")).toBe("display");
  });

  test("pandaTokenToTwSuffix", () => {
    expect(pandaTokenToTwSuffix("red.500")).toBe("red-500");
    expect(pandaTokenToTwSuffix("blue.600")).toBe("blue-600");
    expect(pandaTokenToTwSuffix("md")).toBe("md");
    expect(pandaTokenToTwSuffix("0.5")).toBe("0-5");
  });

  test("extractTailwindClassesFromPandaCss - simple properties", () => {
    const cssObj = {
      display: "flex",
      color: "red.500",
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("flex");
    expect(classes.some((c) => c.includes("text-red"))).toBe(true);
  });

  test("extractTailwindClassesFromPandaCss - with pseudo-selectors", () => {
    const cssObj = {
      display: "flex",
      _hover: {
        backgroundColor: "blue.600",
      },
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("flex");
    expect(classes.some((c) => c.includes("hover:"))).toBe(true);
  });

  test("extractTailwindClassesFromPandaCss - responsive", () => {
    const cssObj = {
      display: "block",
      md: {
        display: "flex",
      },
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("block");
    expect(classes.some((c) => c.startsWith("md:"))).toBe(true);
  });

  test("extractTailwindClassesFromPandaCss - combined modifiers", () => {
    const cssObj = {
      _hover: {
        md: {
          color: "green.500",
        },
      },
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes.some((c) => c.includes("hover:") && c.includes("md:"))).toBe(
      true,
    );
  });

  test("extractTailwindClassesFromPandaCss - button-like example", () => {
    const cssObj = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "md",
      _disabled: {
        pointerEvents: "none",
        opacity: "0.5",
      },
      _hover: {
        backgroundColor: "primary/90",
      },
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("inline-flex");
    expect(classes).toContain("items-center");
    expect(classes).toContain("justify-center");
    expect(classes).toContain("rounded-md");
    expect(classes.some((c) => c.includes("disabled:"))).toBe(true);
    expect(classes.some((c) => c.includes("hover:"))).toBe(true);
  });
});
