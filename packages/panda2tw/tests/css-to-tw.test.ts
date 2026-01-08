import { describe, expect, test } from "vitest";
import { extractTailwindClassesFromPandaCss, pandaTokenToTwSuffix, camelToKebab } from "../src/css-to-tw";

describe("css-to-tw", () => {
  test("camelToKebab", () => {
    expect(camelToKebab("backgroundColor")).toMatchInlineSnapshot(`"background-color"`);
    expect(camelToKebab("paddingTop")).toMatchInlineSnapshot(`"padding-top"`);
    expect(camelToKebab("display")).toMatchInlineSnapshot(`"display"`);
  });

  test("pandaTokenToTwSuffix", () => {
    expect(pandaTokenToTwSuffix("red.500")).toMatchInlineSnapshot(`"red-500"`);
    expect(pandaTokenToTwSuffix("blue.600")).toMatchInlineSnapshot(`"blue-600"`);
    expect(pandaTokenToTwSuffix("md")).toMatchInlineSnapshot(`"md"`);
    expect(pandaTokenToTwSuffix("0.5")).toMatchInlineSnapshot(`"0-5"`);
  });

  test("extractTailwindClassesFromPandaCss - simple properties", () => {
    const cssObj = {
      display: "flex",
      color: "red.500",
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("flex");
    expect(classes.some((c) => c.includes("text-red"))).toBe(true);
    expect(classes).toMatchInlineSnapshot(`
      [
        "flex",
        "text-red-500",
      ]
    `);
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
    expect(classes).toMatchInlineSnapshot(`
      [
        "flex",
        "hover:bg-blue-600",
      ]
    `);
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
    expect(classes).toMatchInlineSnapshot(`
      [
        "block",
        "md:flex",
      ]
    `);
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

    expect(classes.some((c) => c.includes("hover:") && c.includes("md:"))).toBe(true);
    expect(classes).toMatchInlineSnapshot(`
      [
        "hover:md:text-green-500",
      ]
    `);
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
    expect(classes).toMatchInlineSnapshot(`
      [
        "inline-flex",
        "items-center",
        "justify-center",
        "rounded-md",
        "disabled:opacity-0-5",
        "hover:bg-primary/90",
      ]
    `);
  });

  test("extractTailwindClassesFromPandaCss - arbitrary tokens in brackets", () => {
    const cssObj = {
      padding: "[123px]",
      width: "[calc(100%-20px)]",
    };

    const classes = extractTailwindClassesFromPandaCss(cssObj);

    expect(classes).toContain("p-[123px]");
    expect(classes).toContain("w-[calc(100%-20px)]");
    expect(classes).toMatchInlineSnapshot(`
      [
        "p-[123px]",
        "w-[calc(100%-20px)]",
      ]
    `);
  });
});
