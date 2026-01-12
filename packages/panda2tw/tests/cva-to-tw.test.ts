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
});
