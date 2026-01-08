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

  it("converts textStyle to simple class by default (text-style-*)", () => {
    const cssObj = {
      textStyle: "body",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Default behavior: generate text-style-* class
    expect(classes).toContain("text-style-body");
    expect(classes).toHaveLength(1);
  });

  it("resolves textStyle mixins from context theme using token references when inlineTextStyles is true", () => {
    const cssObj = {
      textStyle: "body",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    // textStyle should expand to its constituent properties
    // and resolve token values to token names instead of raw values
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
  });

  it("resolves textStyle and merges with other properties using token references when inlineTextStyles is true", () => {
    const cssObj = {
      textStyle: "heading",
      color: "blue.600",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    // heading textStyle properties - should resolve to token names
    expect(classes).toContain("text-32px");
    expect(classes).toContain("leading-40px");
    expect(classes).toContain("font-bold");
    // color property
    expect(classes).toContain("text-blue-600");
  });

  it("resolves textStyle with raw values (non-token) using arbitrary syntax when inlineTextStyles is true", () => {
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

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockContextWithRawValues, undefined, true);

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

  it("generates simple text-style-* class by default (without inlineTextStyles)", () => {
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

    expect(classes).toEqual(["text-style-custom"]);
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

  it("resolves textStyle inside pseudo-selectors when inlineTextStyles is true", () => {
    const cssObj = {
      textStyle: "body",
      _hover: {
        textStyle: "heading",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    // Base textStyle: body
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
    // Hover textStyle: heading
    expect(classes).toContain("hover:text-32px");
    expect(classes).toContain("hover:leading-40px");
    expect(classes).toContain("hover:font-bold");
  });

  it("generates text-style-* classes in pseudo-selectors by default", () => {
    const cssObj = {
      textStyle: "body",
      _hover: {
        textStyle: "heading",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toContain("text-style-body");
    expect(classes).toContain("hover:text-style-heading");
  });

  it("merges textStyle with other properties correctly when inlineTextStyles is true", () => {
    const cssObj = {
      textStyle: "body",
      color: "red.500",
      padding: "8px",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    // From textStyle
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
    // Explicit properties
    expect(classes).toContain("text-red-500");
    expect(classes).toContain("p-8px");
  });

  it("handles nested textStyle with responsive modifiers when inlineTextStyles is true", () => {
    const cssObj = {
      md: {
        textStyle: "heading",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    expect(classes).toContain("md:text-32px");
    expect(classes).toContain("md:leading-40px");
    expect(classes).toContain("md:font-bold");
  });

  it("handles nested textStyle with responsive modifiers by default", () => {
    const cssObj = {
      md: {
        textStyle: "heading",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toContain("md:text-style-heading");
  });

  it("handles non-existent textStyle gracefully", () => {
    const cssObj = {
      textStyle: "nonexistent",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Default behavior: still generate text-style-* class even if not found
    expect(classes).toEqual(["text-style-nonexistent"]);
  });

  it("handles non-existent textStyle gracefully when inlineTextStyles is true", () => {
    const cssObj = {
      textStyle: "nonexistent",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    // When trying to inline, if not found, should skip it
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

    // Default behavior: still generate text-style-* class
    expect(classes).toEqual(["text-style-body"]);
  });

  it("resolves textStyle with dotted path references when inlineTextStyles is true", () => {
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

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, contextWithDottedTextStyles, undefined, true);

    expect(classes).toContain("text-32px");
    expect(classes).toContain("leading-40px");
    expect(classes).toContain("font-700");
  });

  it("generates text-style-* class with dotted path references by default", () => {
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

    expect(classes).toEqual(["text-style-semantic.highlight"]);
  });

  it("handles textStyle that overrides properties (last wins) when inlineTextStyles is true", () => {
    const cssObj = {
      fontSize: "10px",
      textStyle: "body", // fontSize: "16px"
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    // textStyle should expand after the explicit property
    // In CSS cascade, the textStyle expansion happens after explicit properties are set
    // depending on implementation - verify current behavior
    expect(classes).toContain("text-16px");
    expect(classes).toContain("leading-24px");
    expect(classes).toContain("font-500");
  });

  it("handles textStyle that overrides properties by default", () => {
    const cssObj = {
      fontSize: "10px",
      textStyle: "body",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Default: explicit fontSize first, then text-style-body
    expect(classes).toContain("text-10px");
    expect(classes).toContain("text-style-body");
  });

  it("handles textStyle that combines with responsive modifiers and pseudo-selectors when inlineTextStyles is true", () => {
    const cssObj = {
      md: {
        _hover: {
          textStyle: "heading",
        },
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

    expect(classes).toContain("md:hover:text-32px");
    expect(classes).toContain("md:hover:leading-40px");
    expect(classes).toContain("md:hover:font-bold");
  });

  it("handles textStyle that combines with responsive modifiers and pseudo-selectors by default", () => {
    const cssObj = {
      md: {
        _hover: {
          textStyle: "heading",
        },
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toEqual(["md:hover:text-style-heading"]);
  });

  it("handles multiple textStyle references (later one should apply) when inlineTextStyles is true", () => {
    const cssObj = {
      textStyle: "body",
      _hover: {
        textStyle: "heading",
        color: "blue.600",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext, undefined, true);

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

  it("handles multiple textStyle references by default", () => {
    const cssObj = {
      textStyle: "body",
      _hover: {
        textStyle: "heading",
        color: "blue.600",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    expect(classes).toContain("text-style-body");
    expect(classes).toContain("hover:text-style-heading");
    expect(classes).toContain("hover:text-blue-600");
  });

  it("handles real-world nested textStyle with value property when inlineTextStyles is true", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            title: {
              1: {
                value: {
                  fontSize: "[32px]",
                  fontWeight: "[bold]",
                  lineHeight: "[40px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              2: {
                value: {
                  fontSize: "[24px]",
                  fontWeight: "[bold]",
                  lineHeight: "[32px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
            },
            body: {
              DEFAULT: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              bold: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[600]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "title.1",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext, undefined, true);

    expect(classes).toContain("text-[32px]");
    expect(classes).toContain("font-[bold]");
    expect(classes).toContain("leading-[40px]");
    expect(classes).toContain("tracking-[0]");
  });

  it("generates text-style-* class for real-world nested textStyle with value property by default", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            title: {
              1: {
                value: {
                  fontSize: "[32px]",
                  fontWeight: "[bold]",
                  lineHeight: "[40px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              2: {
                value: {
                  fontSize: "[24px]",
                  fontWeight: "[bold]",
                  lineHeight: "[32px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
            },
            body: {
              DEFAULT: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              bold: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[600]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "title.1",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext);

    expect(classes).toEqual(["text-style-title.1"]);
  });

  it("handles real-world nested textStyle with DEFAULT variant when inlineTextStyles is true", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            body: {
              DEFAULT: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              bold: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[600]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "body.DEFAULT",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext, undefined, true);

    expect(classes).toContain("text-[14px]");
    expect(classes).toContain("font-[400]");
    expect(classes).toContain("leading-[24px]");
  });

  it("generates text-style-* class for real-world nested textStyle with DEFAULT variant by default", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            body: {
              DEFAULT: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              bold: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[600]",
                  lineHeight: "[24px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "body.DEFAULT",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext);

    expect(classes).toEqual(["text-style-body.DEFAULT"]);
  });

  it("handles real-world nested textStyle variant lookup when inlineTextStyles is true", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            body: {
              DEFAULT: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                },
              },
              bold: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[600]",
                  lineHeight: "[24px]",
                },
              },
              link: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                  textDecoration: "underline",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "body.bold",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext, undefined, true);

    expect(classes).toContain("text-[14px]");
    expect(classes).toContain("font-[600]");
    expect(classes).toContain("leading-[24px]");
  });

  it("generates text-style-* class for real-world nested textStyle variant lookup by default", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            body: {
              DEFAULT: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                },
              },
              bold: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[600]",
                  lineHeight: "[24px]",
                },
              },
              link: {
                value: {
                  fontSize: "[14px]",
                  fontWeight: "[400]",
                  lineHeight: "[24px]",
                  textDecoration: "underline",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "body.bold",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext);

    expect(classes).toEqual(["text-style-body.bold"]);
  });

  it("handles caption textStyle variants when inlineTextStyles is true", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            caption: {
              bold: {
                value: {
                  fontSize: "[12px]",
                  fontWeight: "[600]",
                  lineHeight: "[16px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              regular: {
                value: {
                  fontSize: "[12px]",
                  fontWeight: "[400]",
                  lineHeight: "[16px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              link: {
                value: {
                  fontSize: "[12px]",
                  fontWeight: "[400]",
                  lineHeight: "[16px]",
                  letterSpacing: "[0]",
                  textDecoration: "underline",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "caption.bold",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext, undefined, true);

    expect(classes).toContain("text-[12px]");
    expect(classes).toContain("font-[600]");
    expect(classes).toContain("leading-[16px]");
  });

  it("generates text-style-* class for caption textStyle variants by default", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            caption: {
              bold: {
                value: {
                  fontSize: "[12px]",
                  fontWeight: "[600]",
                  lineHeight: "[16px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              regular: {
                value: {
                  fontSize: "[12px]",
                  fontWeight: "[400]",
                  lineHeight: "[16px]",
                  letterSpacing: "[0]",
                  textDecoration: "none",
                },
              },
              link: {
                value: {
                  fontSize: "[12px]",
                  fontWeight: "[400]",
                  lineHeight: "[16px]",
                  letterSpacing: "[0]",
                  textDecoration: "underline",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "caption.bold",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext);

    expect(classes).toEqual(["text-style-caption.bold"]);
  });

  it("handles notification textStyle without variants when inlineTextStyles is true", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            notification: {
              value: {
                fontSize: "[8px]",
                fontWeight: "[600]",
                lineHeight: "[16px]",
                letterSpacing: "[0]",
                textDecoration: "none",
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "notification",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext, undefined, true);

    expect(classes).toContain("text-[8px]");
    expect(classes).toContain("font-[600]");
    expect(classes).toContain("leading-[16px]");
  });

  it("generates text-style-* class for notification textStyle without variants by default", () => {
    const realWorldContext = {
      config: {
        theme: {
          tokens: {},
          textStyles: {
            notification: {
              value: {
                fontSize: "[8px]",
                fontWeight: "[600]",
                lineHeight: "[16px]",
                letterSpacing: "[0]",
                textDecoration: "none",
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "notification",
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext);

    expect(classes).toEqual(["text-style-notification"]);
  });

  it("handles complex real-world scenario with nested variant and other properties when inlineTextStyles is true", () => {
    const realWorldContext = {
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
            title: {
              1: {
                value: {
                  fontSize: "[32px]",
                  fontWeight: "[bold]",
                  lineHeight: "[40px]",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "title.1",
      color: "blue.600",
      _hover: {
        fontWeight: "[700]",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext, undefined, true);

    // From textStyle
    expect(classes).toContain("text-[32px]");
    expect(classes).toContain("font-[bold]");
    expect(classes).toContain("leading-[40px]");
    // From other properties
    expect(classes).toContain("text-blue-600");
    // From pseudo-selector
    expect(classes).toContain("hover:font-[700]");
  });

  it("handles complex real-world scenario with nested variant and other properties by default", () => {
    const realWorldContext = {
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
            title: {
              1: {
                value: {
                  fontSize: "[32px]",
                  fontWeight: "[bold]",
                  lineHeight: "[40px]",
                },
              },
            },
          },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      textStyle: "title.1",
      color: "blue.600",
      _hover: {
        fontWeight: "[700]",
      },
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, realWorldContext);

    // From default text-style handling
    expect(classes).toContain("text-style-title.1");
    // From other properties
    expect(classes).toContain("text-blue-600");
    // From pseudo-selector
    expect(classes).toContain("hover:font-[700]");
  });

  it("handles responsive properties like gridTemplateColumns", () => {
    const cssObj = {
      gridTemplateColumns: {
        base: "[1fr]",
        xl: "[8fr 4fr]"
      },
      padding: "16"
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Should have base grid-cols with responsive variant
    expect(classes).toContain("grid-cols-[1fr]");
    expect(classes).toContain("xl:grid-cols-[8fr 4fr]");
    // And other properties
    expect(classes).toContain("p-16");
  });

  it("handles responsive properties like overflowY", () => {
    const cssObj = {
      overflowY: {
        base: "auto",
        md: "hidden"
      },
      height: "100%"
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Should have base overflow-y with responsive variant
    expect(classes).toContain("overflow-y-auto");
    expect(classes).toContain("md:overflow-y-hidden");
    // And other properties
    expect(classes).toContain("h-100%");
  });

  it("handles multiple responsive properties together", () => {
    const cssObj = {
      gridTemplateColumns: {
        base: "[1fr]",
        xl: "[8fr 4fr]"
      },
      overflowY: {
        base: "auto"
      },
      paddingX: "24",
      paddingY: "32",
      gap: "24"
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, mockPandaContext);

    // Responsive grid columns
    expect(classes).toContain("grid-cols-[1fr]");
    expect(classes).toContain("xl:grid-cols-[8fr 4fr]");
    // Responsive overflow
    expect(classes).toContain("overflow-y-auto");
    // Other properties
    expect(classes).toContain("px-24");
    expect(classes).toContain("py-32");
    expect(classes).toContain("gap-24");
  });

  it("handles responsive properties with custom breakpoints like xlDown", () => {
    const contextWithCustomBreakpoints = {
      config: {
        theme: {
          tokens: {},
          textStyles: {},
        },
      },
      conditions: {
        breakpoints: {
          base: { value: "0px" },
          xl: { value: "1280px" },
          xlDown: { value: "max-width: 1279px" },
        },
      },
    } as any as PandaContext;

    const cssObj = {
      gridTemplateColumns: {
        base: "[1fr]",
        xl: "[8fr 4fr]"
      },
      overflowY: {
        xlDown: "auto"
      },
      width: "100%",
      height: "100%",
      paddingX: "24",
      paddingY: "32",
      gap: "24"
    };

    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj, contextWithCustomBreakpoints);

    // Responsive grid columns
    expect(classes).toContain("grid-cols-[1fr]");
    expect(classes).toContain("xl:grid-cols-[8fr 4fr]");
    // Responsive overflow with custom breakpoint
    expect(classes).toContain("xlDown:overflow-y-auto");
    // Other properties
    expect(classes).toContain("w-100%");
    expect(classes).toContain("h-100%");
    expect(classes).toContain("px-24");
    expect(classes).toContain("py-32");
    expect(classes).toContain("gap-24");
  });

  it("handles responsive properties with unknown/custom breakpoints (fallback behavior)", () => {
    // When breakpoints are not defined in context, we still want to detect responsive properties
    const cssObj = {
      gridTemplateColumns: {
        base: "[1fr]",
        xl: "[8fr 4fr]"
      },
      overflowY: {
        xlDown: "auto"
      },
      width: "100%",
      height: "100%",
      paddingX: "24",
      paddingY: "32",
      gap: "24"
    };

    // Without context - xlDown won't be recognized as a known breakpoint,
    // but our improved detection checks if all values are primitives
    const classes = extractTailwindClassesFromPandaCssWithContext(cssObj);

    // Responsive grid columns (using default breakpoints)
    expect(classes).toContain("grid-cols-[1fr]");
    expect(classes).toContain("xl:grid-cols-[8fr 4fr]");
    // Even with unknown breakpoint, we now detect it by checking if all values are primitives
    expect(classes).toContain("xlDown:overflow-y-auto");
    // Other properties
    expect(classes).toContain("w-100%");
    expect(classes).toContain("h-100%");
    expect(classes).toContain("px-24");
    expect(classes).toContain("py-32");
    expect(classes).toContain("gap-24");
  });
});


