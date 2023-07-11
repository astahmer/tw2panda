import { createMergeCss } from "@pandacss/shared";
import { describe, expect, test } from "vitest";
import buttonRaw from "../samples/button?raw";
import { extractTwFileClassList } from "../src/converter/extract-tw-class-list";
import { createPandaContext } from "../src/converter/panda-context";
import { createTailwindContext } from "../src/converter/tw-context";
import { initialInputList } from "../src/components/Playground/Playground.constants";

describe("extract-tw-class-list", () => {
  test("samples/button.ts", () => {
    const tailwind = createTailwindContext(initialInputList["theme.ts"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const { resultList } = extractTwFileClassList(
      buttonRaw,
      tailwind.context,
      panda,
      mergeCss
    );

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
            "alignItems": "center",
            "display": "inline-flex",
            "focus-visible": {
              "ring": "none",
              "ringOffset": "none",
              "shadow": "2",
            },
            "fontSize": "sm",
            "fontWeight": "medium",
            "justifyContent": "center",
            "lineHeight": "sm",
            "rounded": "md",
            "transitionDuration": "colors",
            "transitionProperty": "colors",
            "transitionTimingFunction": "colors",
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
    const tailwind = createTailwindContext(initialInputList["theme.ts"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const { resultList } = extractTwFileClassList(
      initialInputList["tw-App.tsx"],
      tailwind.context,
      panda,
      mergeCss
    );

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
