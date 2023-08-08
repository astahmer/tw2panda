import { createMergeCss } from "@pandacss/shared";
import { describe, expect, test } from "vitest";
import { extractTwFileClassList } from "../src/extract-tw-class-list";
import { createPandaContext } from "../src/panda-context";
import { createTailwindContext } from "../src/tw-context";
import { initialInputList } from "../../../demo-code-sample";

// @ts-expect-error
import buttonRaw from "../samples/button?raw";
import tailwindConfigRaw from "../samples/tailwind.config.cjs";
import { twClassListToPandaStyles } from "../src/tw-class-list-to-panda-styles";

describe("extract-tw-class-list", () => {
  test("minimal", () => {
    const classList = new Set([
      "inline-flex",
      "items-center",
      "justify-center",
      "rounded-md",
      "text-sm",
      "font-medium",
      "ring-offset-background",
      "transition-colors",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
      "disabled:pointer-events-none",
      "disabled:opacity-50",
    ]);

    const tailwind = createTailwindContext(initialInputList["tailwind.config.js"]);
    const panda = createPandaContext();

    const stylesList = twClassListToPandaStyles(classList, tailwind.context, panda);
    expect(stylesList).toMatchInlineSnapshot(`
      [
        {
          "match": {
            "classInfo": {
              "className": "inline-flex",
              "modifiers": [],
              "utility": "inline",
              "value": "flex",
              "variant": "inline-flex",
            },
            "propName": "display",
            "tokenName": "inline-flex",
          },
          "styles": {
            "display": "inline-flex",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "items-center",
              "modifiers": [],
              "utility": "items-center",
              "value": "items-center",
              "variant": "items-center",
            },
            "propName": "alignItems",
            "tokenName": "center",
          },
          "styles": {
            "alignItems": "center",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "justify-center",
              "modifiers": [],
              "utility": "justify-center",
              "value": "justify-center",
              "variant": "justify-center",
            },
            "propName": "justifyContent",
            "tokenName": "center",
          },
          "styles": {
            "justifyContent": "center",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "rounded-md",
              "modifiers": [],
              "utility": "rounded",
              "value": "md",
              "variant": "rounded-md",
            },
            "propName": "borderRadius",
            "tokenName": "md",
          },
          "styles": {
            "borderRadius": "md",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "text-sm",
              "modifiers": [],
              "utility": "text",
              "value": "sm",
              "variant": "text-sm",
            },
            "propName": "fontSize",
            "tokenName": "sm",
          },
          "styles": {
            "fontSize": "sm",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "text-sm",
              "modifiers": [],
              "utility": "text",
              "value": "sm",
              "variant": "text-sm",
            },
            "propName": "lineHeight",
            "tokenName": "sm",
          },
          "styles": {
            "lineHeight": "sm",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "font-medium",
              "modifiers": [],
              "utility": "font",
              "value": "medium",
              "variant": "font-medium",
            },
            "propName": "fontWeight",
            "tokenName": "medium",
          },
          "styles": {
            "fontWeight": "medium",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "transition-colors",
              "modifiers": [],
              "utility": "transition",
              "value": "colors",
              "variant": "transition-colors",
            },
            "propName": "transitionProperty",
            "tokenName": "color, background-color, border-color, text-decoration-color, fill, stroke",
          },
          "styles": {
            "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "transition-colors",
              "modifiers": [],
              "utility": "transition",
              "value": "colors",
              "variant": "transition-colors",
            },
            "propName": "transitionTimingFunction",
            "tokenName": "colors",
          },
          "styles": {
            "transitionTimingFunction": "colors",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "transition-colors",
              "modifiers": [],
              "utility": "transition",
              "value": "colors",
              "variant": "transition-colors",
            },
            "propName": "transitionDuration",
            "tokenName": "colors",
          },
          "styles": {
            "transitionDuration": "colors",
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "focus-visible:outline-none",
              "modifiers": [
                "focus-visible",
              ],
              "utility": "outline",
              "value": "none",
              "variant": "outline-none",
            },
            "propName": "outline",
            "tokenName": "none",
          },
          "styles": {
            "_focusVisible": {
              "outline": "none",
            },
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "focus-visible:outline-none",
              "modifiers": [
                "focus-visible",
              ],
              "utility": "outline",
              "value": "none",
              "variant": "outline-none",
            },
            "propName": "outlineOffset",
            "tokenName": "none",
          },
          "styles": {
            "_focusVisible": {
              "outlineOffset": "none",
            },
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "focus-visible:ring-2",
              "modifiers": [
                "focus-visible",
              ],
              "utility": "ring",
              "value": "2",
              "variant": "ring-2",
            },
            "propName": "boxShadow",
            "tokenName": "2",
          },
          "styles": {
            "_focusVisible": {
              "boxShadow": "2",
            },
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "disabled:pointer-events-none",
              "modifiers": [
                "disabled",
              ],
              "utility": "pointer-events-none",
              "value": "pointer-events-none",
              "variant": "pointer-events-none",
            },
            "propName": "pointerEvents",
            "tokenName": "none",
          },
          "styles": {
            "_disabled": {
              "pointerEvents": "none",
            },
          },
        },
        {
          "match": {
            "classInfo": {
              "className": "disabled:opacity-50",
              "modifiers": [
                "disabled",
              ],
              "utility": "opacity",
              "value": "50",
              "variant": "opacity-50",
            },
            "propName": "opacity",
            "tokenName": "0.5",
          },
          "styles": {
            "_disabled": {
              "opacity": "0.5",
            },
          },
        },
      ]
    `);
  });

  test("samples/button.ts", () => {
    const tailwind = createTailwindContext(initialInputList["tailwind.config.js"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const resultList = extractTwFileClassList(buttonRaw, tailwind.context, panda, mergeCss);

    expect(resultList).toMatchInlineSnapshot(`
      [
        {
          "classList": Set {
            "inline-flex",
            "items-center",
            "justify-center",
            "rounded-md",
            "text-sm",
            "font-medium",
            "ring-offset-background",
            "transition-colors",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-ring",
            "focus-visible:ring-offset-2",
            "disabled:pointer-events-none",
            "disabled:opacity-50",
          },
          "node": StringLiteral,
          "styles": {
            "_disabled": {
              "opacity": "0.5",
              "pointerEvents": "none",
            },
            "_focusVisible": {
              "ring": "none",
              "ringOffset": "none",
              "shadow": "2",
            },
            "alignItems": "center",
            "display": "inline-flex",
            "fontSize": "sm",
            "fontWeight": "medium",
            "justifyContent": "center",
            "lineHeight": "sm",
            "rounded": "md",
            "transitionDuration": "colors",
            "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke",
            "transitionTimingFunction": "colors",
          },
        },
        {
          "classList": Set {
            "border",
            "border-input",
            "bg-background",
            "hover:bg-accent",
            "hover:text-accent-foreground",
          },
          "node": StringLiteral,
          "styles": {
            "borderWidth": "1px",
          },
        },
        {
          "classList": Set {
            "text-primary",
            "underline-offset-4",
            "hover:underline",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "textDecorationLine": "underline",
            },
            "textUnderlineOffset": "4px",
          },
        },
        {
          "classList": Set {
            "h-10",
            "px-4",
            "py-2",
          },
          "node": StringLiteral,
          "styles": {
            "h": "10",
            "pb": "2",
            "pl": "4",
            "pr": "4",
            "pt": "2",
          },
        },
        {
          "classList": Set {
            "h-9",
            "rounded-md",
            "px-3",
          },
          "node": StringLiteral,
          "styles": {
            "h": "9",
            "pl": "3",
            "pr": "3",
            "rounded": "md",
          },
        },
        {
          "classList": Set {
            "h-11",
            "rounded-md",
            "px-8",
          },
          "node": StringLiteral,
          "styles": {
            "h": "11",
            "pl": "8",
            "pr": "8",
            "rounded": "md",
          },
        },
        {
          "classList": Set {
            "h-10",
            "w-10",
          },
          "node": StringLiteral,
          "styles": {
            "h": "10",
            "w": "10",
          },
        },
      ]
    `);
  });

  test("!important modifiers (with custom tailwind.config)", () => {
    const tailwind = createTailwindContext(tailwindConfigRaw);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const resultList = extractTwFileClassList(
      `
    const buttonVariants = cva(
      "flex !inline-flex !text-destructive-foreground !text-primary-foreground bg-secondary-foreground focus-visible:!outline-none disabled:!opacity-50 dark:!bg-primary",
      {
        variants: {}
      }
    )
    `,
      tailwind.context,
      panda,
      mergeCss,
    );

    expect(resultList).toMatchInlineSnapshot(`
      [
        {
          "classList": Set {
            "flex",
            "!inline-flex",
            "!text-destructive-foreground",
            "!text-primary-foreground",
            "bg-secondary-foreground",
            "focus-visible:!outline-none",
            "disabled:!opacity-50",
            "dark:!bg-primary",
          },
          "node": StringLiteral,
          "styles": {
            "_dark": {
              "bgColor": "primary!",
            },
            "_disabled": {
              "opacity": "0.5!",
            },
            "_focusVisible": {
              "ring": "none!",
              "ringOffset": "none!",
            },
            "bgColor": "secondary.foreground",
            "color": "primary.foreground!",
            "display": "inline-flex!",
          },
        },
      ]
    `);
  });

  test("samples/button.ts with custom tailwind.config", () => {
    const tailwind = createTailwindContext(tailwindConfigRaw);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const resultList = extractTwFileClassList(buttonRaw, tailwind.context, panda, mergeCss);

    expect(resultList).toMatchInlineSnapshot(`
      [
        {
          "classList": Set {
            "inline-flex",
            "items-center",
            "justify-center",
            "rounded-md",
            "text-sm",
            "font-medium",
            "ring-offset-background",
            "transition-colors",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-ring",
            "focus-visible:ring-offset-2",
            "disabled:pointer-events-none",
            "disabled:opacity-50",
          },
          "node": StringLiteral,
          "styles": {
            "_disabled": {
              "opacity": "0.5",
              "pointerEvents": "none",
            },
            "_focusVisible": {
              "ring": "none",
              "ringOffset": "none",
              "shadow": "2",
            },
            "alignItems": "center",
            "display": "inline-flex",
            "fontSize": "sm",
            "fontWeight": "medium",
            "justifyContent": "center",
            "lineHeight": "sm",
            "rounded": "md",
            "transitionDuration": "colors",
            "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke",
            "transitionTimingFunction": "colors",
          },
        },
        {
          "classList": Set {
            "bg-primary",
            "text-primary-foreground",
            "hover:bg-primary/90",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "bgColor": "primary/90",
            },
            "bgColor": "primary",
            "color": "primary.foreground",
          },
        },
        {
          "classList": Set {
            "bg-destructive",
            "text-destructive-foreground",
            "hover:bg-destructive/90",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "bgColor": "destructive/90",
            },
            "bgColor": "destructive",
            "color": "destructive.foreground",
          },
        },
        {
          "classList": Set {
            "border",
            "border-input",
            "bg-background",
            "hover:bg-accent",
            "hover:text-accent-foreground",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "bgColor": "accent",
              "color": "accent.foreground",
            },
            "bgColor": "background",
            "borderColor": "input",
            "borderWidth": "1px",
          },
        },
        {
          "classList": Set {
            "bg-secondary",
            "text-secondary-foreground",
            "hover:bg-secondary/80",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "bgColor": "secondary/80",
            },
            "bgColor": "secondary",
            "color": "secondary.foreground",
          },
        },
        {
          "classList": Set {
            "hover:bg-accent",
            "hover:text-accent-foreground",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "bgColor": "accent",
              "color": "accent.foreground",
            },
          },
        },
        {
          "classList": Set {
            "text-primary",
            "underline-offset-4",
            "hover:underline",
          },
          "node": StringLiteral,
          "styles": {
            "_hover": {
              "textDecorationLine": "underline",
            },
            "color": "primary",
            "textUnderlineOffset": "4px",
          },
        },
        {
          "classList": Set {
            "h-10",
            "px-4",
            "py-2",
          },
          "node": StringLiteral,
          "styles": {
            "h": "10",
            "pb": "2",
            "pl": "4",
            "pr": "4",
            "pt": "2",
          },
        },
        {
          "classList": Set {
            "h-9",
            "rounded-md",
            "px-3",
          },
          "node": StringLiteral,
          "styles": {
            "h": "9",
            "pl": "3",
            "pr": "3",
            "rounded": "md",
          },
        },
        {
          "classList": Set {
            "h-11",
            "rounded-md",
            "px-8",
          },
          "node": StringLiteral,
          "styles": {
            "h": "11",
            "pl": "8",
            "pr": "8",
            "rounded": "md",
          },
        },
        {
          "classList": Set {
            "h-10",
            "w-10",
          },
          "node": StringLiteral,
          "styles": {
            "h": "10",
            "w": "10",
          },
        },
      ]
    `);
  });

  test("Playground defaultCode", () => {
    const tailwind = createTailwindContext(initialInputList["tailwind.config.js"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const resultList = extractTwFileClassList(initialInputList["tw-App.tsx"], tailwind.context, panda, mergeCss);

    expect(resultList).toMatchInlineSnapshot(`
      [
        {
          "classList": Set {
            "md:flex",
            "bg-slate-100",
            "rounded-xl",
            "p-8",
            "md:p-0",
            "dark:bg-slate-800",
          },
          "node": StringLiteral,
          "styles": {
            "_dark": {
              "bgColor": "slate.800",
            },
            "bgColor": "slate.100",
            "md": {
              "display": "flex",
              "p": "0",
            },
            "p": "8",
            "rounded": "xl",
          },
        },
        {
          "classList": Set {
            "w-24",
            "h-24",
            "md:w-48",
            "md:h-auto",
            "md:rounded-none",
            "rounded-full",
            "mx-auto",
          },
          "node": StringLiteral,
          "styles": {
            "h": "24",
            "md": {
              "h": "auto",
              "rounded": "none",
              "w": "48",
            },
            "ml": "auto",
            "mr": "auto",
            "rounded": "full",
            "w": "24",
          },
        },
        {
          "classList": Set {
            "pt-6",
            "md:p-8",
            "text-center",
            "md:text-left",
            "space-y-4",
          },
          "node": StringLiteral,
          "styles": {
            "mb": "4",
            "md": {
              "p": "8",
              "textAlign": "left",
            },
            "mt": "4",
            "pt": "6",
            "textAlign": "center",
          },
        },
        {
          "classList": Set {
            "text-lg",
            "font-medium",
          },
          "node": StringLiteral,
          "styles": {
            "fontSize": "lg",
            "fontWeight": "medium",
            "lineHeight": "lg",
          },
        },
        {
          "classList": Set {
            "font-medium",
          },
          "node": StringLiteral,
          "styles": {
            "fontWeight": "medium",
          },
        },
        {
          "classList": Set {
            "text-sky-500",
            "dark:text-sky-400",
          },
          "node": StringLiteral,
          "styles": {
            "_dark": {
              "color": "sky.400",
            },
            "color": "sky.500",
          },
        },
        {
          "classList": Set {
            "text-slate-700",
            "dark:text-slate-500",
          },
          "node": StringLiteral,
          "styles": {
            "_dark": {
              "color": "slate.500",
            },
            "color": "slate.700",
          },
        },
      ]
    `);
  });
});
