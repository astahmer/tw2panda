import { describe, it, expect } from "vitest";
import type { PandaContext } from "@pandacss/node";
import { extractTailwindClassesFromPandaCssWithContext } from "../src/css-to-tw";

describe("extractTailwindClassesFromPandaCssWithContext", () => {
  // Mock Panda context with custom theme tokens
  const mockPandaContext = {
    config: {
      theme: {
        tokens: {
          colors: {
            blue: {
              600: "#2563eb",
              700: "#1d4ed8",
            },
            red: {
              500: "#ef4444",
              700: "#b91c1c",
            },
          },
          spacing: {
            "8px": "8px",
          },
        },
      },
    },
  } as any as PandaContext;

  it("converts Panda CSS to Tailwind without context (fallback)", () => {
    const cssObj = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
      backgroundColor: "blue.600",
      color: "white",
      _hover: {
        backgroundColor: "blue.700",
      },
    };

    // Without context - fallback to basic conversion
    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj);

    expect(classes).toContain("flex");
    expect(classes).toContain("items-center");
    expect(classes).toContain("justify-center");
    expect(classes).toContain("bg-blue-600");
    expect(classes).toContain("text-white");
    expect(classes).toContain("hover:bg-blue-700");
  });

  it("converts Panda CSS to Tailwind WITH custom Panda context", () => {
    const cssObj = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
      backgroundColor: "blue.600",
      color: "white",
      _hover: {
        backgroundColor: "blue.700",
      },
    };

    // With context - uses actual theme token resolution
    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toContain("flex");
    expect(classes).toContain("items-center");
    expect(classes).toContain("justify-center");
    // These match default Tailwind colors, so should use TW token names
    expect(classes).toContain("bg-blue-600");
    expect(classes).toContain("text-white");
    expect(classes).toContain("hover:bg-blue-700");
    // padding doesn't match any default TW token, so uses arbitrary syntax
    expect(classes).toContain("p-[8px]");
  });

  it("handles nested pseudo-selectors with context", () => {
    const cssObj = {
      color: "red.500",
      _hover: {
        color: "red.700",
      },
      _dark: {
        color: "red.300",
        _hover: {
          color: "red.200",
        },
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // With context, tokens resolve to actual values
    // red.500 and red.700 match default TW colors
    expect(classes).toContain("text-red-500");
    expect(classes).toContain("hover:text-red-700");
    // red.300 and red.200 are not in the context, so they use fallback token name
    expect(classes).toContain("dark:text-red-300");
    expect(classes).toContain("dark:hover:text-red-200");
  });

  it("resolves custom tokens from context theme", () => {
    const cssObj = {
      padding: "8px",
      backgroundColor: "blue.600",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Should resolve to actual hex color from context
    expect(classes).toContain("bg-#2563eb");
    // Padding should resolve to actual value
    expect(classes).toContain("p-8px");
  });
});
