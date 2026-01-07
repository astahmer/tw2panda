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
    // These should resolve from the context's theme tokens
    expect(classes).toContain("bg-#2563eb");
    expect(classes).toContain("text-white");
    expect(classes).toContain("hover:bg-#1d4ed8");
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

    // With context, tokens resolve to actual values (hex colors in this case)
    expect(classes).toContain("text-#ef4444"); // red.500 -> #ef4444
    expect(classes).toContain("hover:text-#b91c1c"); // red.700 -> #b91c1c
    // red.300 and red.200 are not in the context, so they use fallback
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
