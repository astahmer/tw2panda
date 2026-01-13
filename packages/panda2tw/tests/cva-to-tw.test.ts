import { describe, expect, test } from "vitest";
import { pandaCvaToTailwind, extractClassesFromNestedStyles } from "../src/cva-to-tw";

describe("cva-to-tw", () => {
  test("pandaCvaToTailwind - simple config", () => {
    const cvaConfig = {
      base: {
        display: "inline-flex",
        alignItems: "center",
      },
      variants: {
        variant: {
          default: { backgroundColor: "blue.600" },
          ghost: { backgroundColor: "transparent" },
        },
      },
    };

    const result = pandaCvaToTailwind(cvaConfig);

    expect(result).toContain("inline-flex");
    expect(result).toContain("variant");
    expect(result).toContain("default");
  });

  test("extractClassesFromNestedStyles - simple", () => {
    const styles = {
      color: "red.500",
      backgroundColor: "blue.600",
    };

    const classes = extractClassesFromNestedStyles(styles);

    expect(classes.length).toBeGreaterThan(0);
    expect(classes.some((c) => c.includes("text-"))).toBe(true);
  });

  test("extractClassesFromNestedStyles - with responsive", () => {
    const styles = {
      display: "block",
      md: {
        display: "flex",
      },
    };

    const classes = extractClassesFromNestedStyles(styles);

    expect(classes).toContain("block");
    expect(classes.some((c) => c.startsWith("md:"))).toBe(true);
  });

  test("extractClassesFromNestedStyles - with textStyle", () => {
    const styles = {
      textStyle: "body",
      display: "flex",
    };

    const classes = extractClassesFromNestedStyles(styles);

    expect(classes).toContain("text-style-body");
    expect(classes).toContain("flex");
  });

  test("extractClassesFromNestedStyles - with textStyle and responsive", () => {
    const styles = {
      textStyle: "heading",
      display: "block",
      md: {
        textStyle: "body",
        display: "flex",
      },
    };

    const classes = extractClassesFromNestedStyles(styles);

    expect(classes).toContain("text-style-heading");
    expect(classes).toContain("block");
    expect(classes.some((c) => c === "md:text-style-body")).toBe(true);
    expect(classes.some((c) => c === "md:flex")).toBe(true);
  });

  test("extractClassesFromNestedStyles - with CSS selectors", () => {
    const styles = {
      display: "flex",
      position: "relative",
      "&:hover": {
        backgroundColor: "blue.600",
      },
    };

    const classes = extractClassesFromNestedStyles(styles);

    // Should extract base styles
    expect(classes).toContain("flex");
    expect(classes).toContain("relative");
    // Should extract styles from CSS selector with selector as modifier
    expect(classes.some((c) => c.includes("[&:hover]"))).toBe(true);
    expect(classes).toMatchInlineSnapshot(`
      [
        "flex",
        "relative",
        "[&:hover]:bg-blue-600",
      ]
    `);
  });

  test("extractClassesFromNestedStyles - with complex CSS selector", () => {
    const styles = {
      display: "flex",
      overflow: "hidden",
      "&:has(> .avatar__fallback)": {
        border: "1px",
        borderColor: "gray.200",
      },
    };

    const classes = extractClassesFromNestedStyles(styles);

    // Should extract base styles
    expect(classes).toContain("flex");
    expect(classes).toContain("overflow-hidden");
    // Should extract styles from the :has() selector with selector as modifier
    expect(classes.some((c) => c.includes("[&:has(>_.avatar__fallback)]"))).toBe(true);
    expect(classes.some((c) => c.includes("border"))).toBe(true);
    expect(classes).toMatchInlineSnapshot(`
      [
        "flex",
        "overflow-hidden",
        "[&:has(>_.avatar__fallback)]:border-1px",
        "[&:has(>_.avatar__fallback)]:border-gray-200",
      ]
    `);
  });
});


