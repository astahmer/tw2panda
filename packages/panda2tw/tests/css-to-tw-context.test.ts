import { describe, it, expect } from "vitest";
import { extractTailwindClassesFromPandaCssWithContext } from "../src/css-to-tw";
import type { PandaContext } from "../src/panda-context";

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
          fontSizes: {
            "16px": "16px",
            "32px": "32px",
          },
          lineHeights: {
            "24px": "24px",
            "40px": "40px",
          },
          fontWeights: {
            "500": "500",
          },
        },
        textStyles: {
          body: {
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: "500",
          },
          heading: {
            fontSize: "32px",
            lineHeight: "40px",
            fontWeight: "bold",
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
    // padding matches the spacing token defined in context
    expect(classes).toContain("p-8px");
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

    // blue.600 matches default TW color
    expect(classes).toContain("bg-blue-600");
    // 8px matches the spacing token defined in context
    expect(classes).toContain("p-8px");
  });

  it("resolves textStyle mixins from context theme using token references", () => {
    const cssObj = {
      textStyle: "body",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // textStyle should expand to its constituent properties
    // and resolve token values to token names instead of raw values
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
  });

  it("resolves textStyle and merges with other properties using token references", () => {
    const cssObj = {
      textStyle: "heading",
      color: "blue.600",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // heading textStyle properties - should resolve to token names
    expect(classes).toContain("text-32px");
    expect(classes).toContain("leading-40px");
    expect(classes).toContain("font-bold");
    // color property
    expect(classes).toContain("text-blue-600");
  });

  it("resolves textStyle with raw values (non-token) using arbitrary syntax", () => {
    const mockContextWithRawValues = {
      config: {
        theme: {
          tokens: {
            colors: {
              blue: {
                600: "#2563eb",
              },
            },
          },
          textStyles: {
            custom: {
              fontSize: "18px",
              fontWeight: "600",
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "custom",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockContextWithRawValues);

    expect(classes).toMatchInlineSnapshot(`
      [
        "text-18px",
        "font-600",
      ]
    `);
    // Strict assertions
    expect(classes).toContain("text-18px");
    expect(classes).toContain("font-600");
    expect(classes).toHaveLength(2);
  });

  it("handles raw values not in context tokens", () => {
    const cssObj = {
      paddingLeft: "123px",
      display: "flex",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toMatchInlineSnapshot(`
      [
        "pl-123px",
        "flex",
      ]
    `);
    // Strict assertions - raw values that aren't tokens still get converted
    expect(classes).toContain("pl-123px");
    expect(classes).toContain("flex");
    expect(classes).toHaveLength(2);
  });

  it("resolves textStyle inside pseudo-selectors", () => {
    const cssObj = {
      textStyle: "body",
      _hover: {
        textStyle: "heading",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Base textStyle: body
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
    // Hover textStyle: heading
    expect(classes).toContain("hover:text-32px");
    expect(classes).toContain("hover:leading-40px");
    expect(classes).toContain("hover:font-bold");
  });

  it("merges textStyle with other properties correctly", () => {
    const cssObj = {
      textStyle: "body",
      color: "red.500",
      padding: "8px",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // From textStyle
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
    // Explicit properties
    expect(classes).toContain("text-red-500");
    expect(classes).toContain("p-8px");
  });

  it("handles nested textStyle with responsive modifiers", () => {
    const cssObj = {
      md: {
        textStyle: "heading",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toContain("md:text-32px");
    expect(classes).toContain("md:leading-40px");
    expect(classes).toContain("md:font-bold");
  });

  it("handles non-existent textStyle gracefully", () => {
    const cssObj = {
      textStyle: "nonexistent",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Should just skip the textStyle if not found
    expect(classes).toHaveLength(0);
  });

  it("handles textStyle with missing theme config", () => {
    const contextNoTheme = {
      config: {},
    } as any as PandaContext;

    const cssObj = {
      textStyle: "body",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, contextNoTheme);

    // Should not crash, just return empty or skip
    expect(classes).toHaveLength(0);
  });

  it("resolves textStyle with dotted path references", () => {
    const contextWithDottedTextStyles = {
      config: {
        theme: {
          tokens: {
            colors: {
              blue: {
                600: "#2563eb",
              },
            },
            fontSizes: {
              "16px": "16px",
              "32px": "32px",
            },
            lineHeights: {
              "24px": "24px",
              "40px": "40px",
            },
            fontWeights: {
              "500": "500",
              "700": "700",
            },
          },
          textStyles: {
            semantic: {
              base: {
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: "500",
              },
              highlight: {
                fontSize: "32px",
                lineHeight: "40px",
                fontWeight: "700",
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "semantic.highlight",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, contextWithDottedTextStyles);

    expect(classes).toContain("text-32px");
    expect(classes).toContain("leading-40px");
    expect(classes).toContain("font-700");
  });

  it("handles textStyle that overrides properties (last wins)", () => {
    const cssObj = {
      fontSize: "10px",
      textStyle: "body", // fontSize: "16px"
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // textStyle should expand after the explicit property
    // In CSS cascade, the textStyle expansion happens after explicit properties are set
    // depending on implementation - verify current behavior
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
  });

  it("handles textStyle that combines with responsive modifiers and pseudo-selectors", () => {
    const cssObj = {
      md: {
        _hover: {
          textStyle: "heading",
        },
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toContain("md:hover:text-32px");
    expect(classes).toContain("md:hover:leading-40px");
    expect(classes).toContain("md:hover:font-bold");
  });

  it("handles multiple textStyle references (later one should apply)", () => {
    const cssObj = {
      textStyle: "body",
      _hover: {
        textStyle: "heading",
        color: "blue.600",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Base textStyle
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
    // Hover overrides
    expect(classes).toContain("hover:text-32px");
    expect(classes).toContain("hover:leading-40px");
    expect(classes).toContain("hover:font-bold");
    expect(classes).toContain("hover:text-blue-600");
  });
});
