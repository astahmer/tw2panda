import { test, expect } from "vitest";
import { parseTwClassName } from "../src/tw-parser";

const parseTailwindClasses = (classList: string) =>
  classList.split(" ").map((className) => parseTwClassName(className));

test("variant no value", () => {
  expect(parseTailwindClasses("flex")).toMatchInlineSnapshot(`
    [
      {
        "className": "flex",
        "modifiers": [],
        "utility": "flex",
        "value": "flex",
        "variant": "flex",
      },
    ]
  `);
});

test("variant no value with breakpoint modifier", () => {
  expect(parseTailwindClasses("md:flex")).toMatchInlineSnapshot(`
    [
      {
        "className": "md:flex",
        "modifiers": [
          "md",
        ],
        "utility": "flex",
        "value": "flex",
        "variant": "flex",
      },
    ]
  `);
});

test("variant with value", () => {
  expect(parseTailwindClasses("flex-1 bg-slate-100")).toMatchInlineSnapshot(`
    [
      {
        "className": "flex-1",
        "modifiers": [],
        "utility": "flex",
        "value": "1",
        "variant": "flex-1",
      },
      {
        "className": "bg-slate-100",
        "modifiers": [],
        "utility": "bg",
        "value": "slate-100",
        "variant": "bg-slate-100",
      },
    ]
  `);
});

test("variant with arbitrary value", () => {
  expect(
    parseTailwindClasses(
      "w-[1ch] opacity-[.08] top-[117px] bg-[#bada55] text-[22px]"
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "className": "w-[1ch]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "w",
        "value": "1ch",
        "variant": "w-[1ch]",
      },
      {
        "className": "opacity-[.08]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "opacity",
        "value": ".08",
        "variant": "opacity-[.08]",
      },
      {
        "className": "top-[117px]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "top",
        "value": "117px",
        "variant": "top-[117px]",
      },
      {
        "className": "bg-[#bada55]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "bg",
        "value": "#bada55",
        "variant": "bg-[#bada55]",
      },
      {
        "className": "text-[22px]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "text",
        "value": "22px",
        "variant": "text-[22px]",
      },
    ]
  `);
});

// https://tailwindcss.com/docs/adding-custom-styles#arbitrary-properties
test("variant with arbitrary property", () => {
  expect(parseTailwindClasses("[mask-type:luminance] [--scroll-offset:56px]"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "[mask-type:luminance]",
          "kind": "arbitrary-value",
          "modifiers": [],
          "utility": "mask-type",
          "value": "luminance",
          "variant": "mask-type:luminance",
        },
        {
          "className": "[--scroll-offset:56px]",
          "kind": "arbitrary-value",
          "modifiers": [],
          "utility": "--scroll-offset",
          "value": "56px",
          "variant": "--scroll-offset:56px",
        },
      ]
    `);
});

// with modifier
test("variant no value with modifier", () => {
  expect(parseTailwindClasses("md:flex lg:dark:rounded"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "md:flex",
          "modifiers": [
            "md",
          ],
          "utility": "flex",
          "value": "flex",
          "variant": "flex",
        },
        {
          "className": "lg:dark:rounded",
          "modifiers": [
            "lg",
            "dark",
          ],
          "utility": "rounded",
          "value": "rounded",
          "variant": "rounded",
        },
      ]
    `);
});

test("variant with value with modifier", () => {
  expect(parseTailwindClasses("md:flex-1 lg:dark:bg-slate-100"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "md:flex-1",
          "modifiers": [
            "md",
          ],
          "utility": "flex",
          "value": "1",
          "variant": "flex-1",
        },
        {
          "className": "lg:dark:bg-slate-100",
          "modifiers": [
            "lg",
            "dark",
          ],
          "utility": "bg",
          "value": "slate-100",
          "variant": "bg-slate-100",
        },
      ]
    `);
});

test("variant with arbitrary value with modifier", () => {
  expect(
    parseTailwindClasses(
      "md:w-[1ch] lg:dark:opacity-[.08] focus:top-[117px] invalid:bg-[#bada55] hover:text-[22px] before:content-['Festivus']"
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "className": "md:w-[1ch]",
        "kind": "arbitrary-value",
        "modifiers": [
          "md",
        ],
        "utility": "w",
        "value": "1ch",
        "variant": "w-[1ch]",
      },
      {
        "className": "lg:dark:opacity-[.08]",
        "kind": "arbitrary-value",
        "modifiers": [
          "lg",
          "dark",
        ],
        "utility": "opacity",
        "value": ".08",
        "variant": "opacity-[.08]",
      },
      {
        "className": "focus:top-[117px]",
        "kind": "arbitrary-value",
        "modifiers": [
          "focus",
        ],
        "utility": "top",
        "value": "117px",
        "variant": "top-[117px]",
      },
      {
        "className": "invalid:bg-[#bada55]",
        "kind": "arbitrary-value",
        "modifiers": [
          "invalid",
        ],
        "utility": "bg",
        "value": "#bada55",
        "variant": "bg-[#bada55]",
      },
      {
        "className": "hover:text-[22px]",
        "kind": "arbitrary-value",
        "modifiers": [
          "hover",
        ],
        "utility": "text",
        "value": "22px",
        "variant": "text-[22px]",
      },
      {
        "className": "before:content-['Festivus']",
        "kind": "arbitrary-value",
        "modifiers": [
          "before",
        ],
        "utility": "content",
        "value": "'Festivus'",
        "variant": "content-['Festivus']",
      },
    ]
  `);
});

test("variant with arbitrary property with modifier", () => {
  expect(
    parseTailwindClasses("hover:[mask-type:alpha] lg:[--scroll-offset:44px]")
  ).toMatchInlineSnapshot(`
    [
      {
        "className": "hover:[mask-type:alpha]",
        "kind": "arbitrary-value",
        "modifiers": [
          "hover",
        ],
        "utility": "mask-type",
        "value": "alpha",
        "variant": "[mask-type:alpha]",
      },
      {
        "className": "lg:[--scroll-offset:44px]",
        "kind": "arbitrary-value",
        "modifiers": [
          "lg",
        ],
        "utility": "--scroll-offset",
        "value": "44px",
        "variant": "[--scroll-offset:44px]",
      },
    ]
  `);
});

// group/peer
// https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state
test("styling based on parent state", () => {
  expect(parseTailwindClasses("group-hover:stroke-white"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "group-hover:stroke-white",
          "modifiers": [
            "group-hover",
          ],
          "utility": "stroke",
          "value": "white",
          "variant": "stroke-white",
        },
      ]
    `);
});

// https://tailwindcss.com/docs/hover-focus-and-other-states#differentiating-nested-groups
test("differenciating nested groups", () => {
  expect(parseTailwindClasses("group-hover/edit:translate-x-0.5"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "group-hover/edit:translate-x-0.5",
          "modifiers": [
            "group-hover/edit",
          ],
          "utility": "translate-x",
          "value": "0.5",
          "variant": "translate-x-0.5",
        },
      ]
    `);
});

// https://tailwindcss.com/docs/hover-focus-and-other-states#arbitrary-groups
test("arbitrary groups", () => {
  expect(
    parseTailwindClasses(
      "group-[.is-published]:block group-[:nth-of-type(3)_&]:block"
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "className": "group-[.is-published]:block",
        "modifiers": [
          "group-[.is-published]",
        ],
        "utility": "block",
        "value": "block",
        "variant": "block",
      },
      {
        "className": "group-[:nth-of-type(3)_&]:block",
        "modifiers": [
          "group-[:nth-of-type(3)_&]",
        ],
        "utility": "block",
        "value": "block",
        "variant": "block",
      },
    ]
  `);
});

// https://tailwindcss.com/docs/hover-focus-and-other-states#arbitrary-peers
test("arbitrary peers", () => {
  expect(parseTailwindClasses("peer-[.is-dirty]:peer-required:block"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "peer-[.is-dirty]:peer-required:block",
          "modifiers": [
            "peer-[.is-dirty]",
            "peer-required",
          ],
          "utility": "block",
          "value": "block",
          "variant": "block",
        },
      ]
    `);
});

// https://tailwindcss.com/docs/hover-focus-and-other-states#before-and-after
test("before and after", () => {
  expect(
    parseTailwindClasses("after:content-['*'] after:ml-0.5 after:text-red-500")
  ).toMatchInlineSnapshot(`
    [
      {
        "className": "after:content-['*']",
        "kind": "arbitrary-value",
        "modifiers": [
          "after",
        ],
        "utility": "content",
        "value": "'*'",
        "variant": "content-['*']",
      },
      {
        "className": "after:ml-0.5",
        "modifiers": [
          "after",
        ],
        "utility": "ml",
        "value": "0.5",
        "variant": "ml-0.5",
      },
      {
        "className": "after:text-red-500",
        "modifiers": [
          "after",
        ],
        "utility": "text",
        "value": "red-500",
        "variant": "text-red-500",
      },
    ]
  `);
});

// https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants
test("arbitrary variant", () => {
  expect(parseTailwindClasses("lg:[&:nth-child(3)]:hover:underline [&_p]:mt-4"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "lg:[&:nth-child(3)]:hover:underline",
          "modifiers": [
            "lg",
            "&-[&:nth-child(3)]",
            "hover",
          ],
          "utility": "underline",
          "value": "underline",
          "variant": "underline",
        },
        {
          "className": "[&_p]:mt-4",
          "modifiers": [
            "&_p",
          ],
          "utility": "mt",
          "value": "4",
          "variant": "mt-4",
        },
      ]
    `);
});

// https://tailwindcss.com/docs/hover-focus-and-other-states#data-attributes
test("data attributes", () => {
  expect(parseTailwindClasses("data-[size=large]:p-8")).toMatchInlineSnapshot(`
    [
      {
        "className": "data-[size=large]:p-8",
        "modifiers": [
          "data-[size=large]",
        ],
        "utility": "p",
        "value": "8",
        "variant": "p-8",
      },
    ]
  `);
});

// breakpoints
// https://tailwindcss.com/docs/responsive-design#targeting-a-single-breakpoint
test("targeting a single breakpoint", () => {
  expect(parseTailwindClasses("md:max-lg:flex")).toMatchInlineSnapshot(`
    [
      {
        "className": "md:max-lg:flex",
        "modifiers": [
          "md",
          "max-lg",
        ],
        "utility": "flex",
        "value": "flex",
        "variant": "flex",
      },
    ]
  `);
});

// https://tailwindcss.com/docs/responsive-design#arbitrary-values
test("arbitrary breakpoint", () => {
  expect(parseTailwindClasses("min-[320px]:text-center max-[600px]:bg-sky-300"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "min-[320px]:text-center",
          "modifiers": [
            "min-[320px]",
          ],
          "utility": "text",
          "value": "center",
          "variant": "text-center",
        },
        {
          "className": "max-[600px]:bg-sky-300",
          "modifiers": [
            "max-[600px]",
          ],
          "utility": "bg",
          "value": "sky-300",
          "variant": "bg-sky-300",
        },
      ]
    `);
});

// https://tailwindcss.com/docs/adding-custom-styles#handling-whitespace
test("handling whitespace", () => {
  expect(parseTailwindClasses("grid grid-cols-[1fr_500px_2fr]"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "grid",
          "modifiers": [],
          "utility": "grid",
          "value": "grid",
          "variant": "grid",
        },
        {
          "className": "grid-cols-[1fr_500px_2fr]",
          "kind": "arbitrary-value",
          "modifiers": [],
          "utility": "-ols",
          "value": "cols-[1fr_500px_2fr]",
          "variant": "grid-cols-[1fr_500px_2fr]",
        },
      ]
    `);
});

test("handling url", () => {
  expect(parseTailwindClasses("bg-[url('/what_a_rush.png')]"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "bg-[url('/what_a_rush.png')]",
          "kind": "arbitrary-value",
          "modifiers": [],
          "utility": "bg",
          "value": "url('/what_a_rush.png')",
          "variant": "bg-[url('/what_a_rush.png')]",
        },
      ]
    `);
});

// https://tailwindcss.com/docs/adding-custom-styles#resolving-ambiguities
test("resolving ambiguities", () => {
  expect(
    parseTailwindClasses(
      "text-[22px] text-[#bada55] text-[var(--my-var)] text-[length:var(--my-var)] text-[color:var(--my-var)]"
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "className": "text-[22px]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "text",
        "value": "22px",
        "variant": "text-[22px]",
      },
      {
        "className": "text-[#bada55]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "text",
        "value": "#bada55",
        "variant": "text-[#bada55]",
      },
      {
        "className": "text-[var(--my-var)]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "text",
        "value": "var(--my-var)",
        "variant": "text-[var(--my-var)]",
      },
      {
        "className": "text-[length:var(--my-var)]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "text",
        "value": "length:var(--my-var)",
        "variant": "text-[length:var(--my-var)]",
      },
      {
        "className": "text-[color:var(--my-var)]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "text",
        "value": "color:var(--my-var)",
        "variant": "text-[color:var(--my-var)]",
      },
    ]
  `);
});

test("variant with rgba alpha transparent", () => {
  expect(parseTailwindClasses("text-blue-500/40")).toMatchInlineSnapshot(`
    [
      {
        "className": "text-blue-500/40",
        "modifiers": [],
        "utility": "text",
        "value": "blue-500/40",
        "variant": "text-blue-500/40",
      },
    ]
  `);
});

test("variant with forward slash", () => {
  expect(parseTailwindClasses("w-3/4")).toMatchInlineSnapshot(`
    [
      {
        "className": "w-3/4",
        "modifiers": [],
        "utility": "w",
        "value": "3/4",
        "variant": "w-3/4",
      },
    ]
  `);
});

test("variant with parenthesis", () => {
  expect(parseTailwindClasses("border-[repeat(6,1fr)]")).toMatchInlineSnapshot(`
    [
      {
        "className": "border-[repeat(6,1fr)]",
        "kind": "arbitrary-value",
        "modifiers": [],
        "utility": "border",
        "value": "repeat(6,1fr)",
        "variant": "border-[repeat(6,1fr)]",
      },
    ]
  `);
});

test("variant with dot", () => {
  expect(parseTailwindClasses("pl-3.5")).toMatchInlineSnapshot(`
    [
      {
        "className": "pl-3.5",
        "modifiers": [],
        "utility": "pl",
        "value": "3.5",
        "variant": "pl-3.5",
      },
    ]
  `);
});

test("variant with important", () => {
  expect(parseTailwindClasses("flex! underline! min-w-4! text-white/40!"))
    .toMatchInlineSnapshot(`
      [
        {
          "className": "flex!",
          "isImportant": true,
          "modifiers": [],
          "utility": "flex!",
          "value": "flex!",
          "variant": "flex!",
        },
        {
          "className": "underline!",
          "isImportant": true,
          "modifiers": [],
          "utility": "underline!",
          "value": "underline!",
          "variant": "underline!",
        },
        {
          "className": "min-w-4!",
          "isImportant": true,
          "modifiers": [],
          "utility": "min-w",
          "value": "4!",
          "variant": "min-w-4!",
        },
        {
          "className": "text-white/40!",
          "isImportant": true,
          "modifiers": [],
          "utility": "text",
          "value": "white/40!",
          "variant": "text-white/40!",
        },
      ]
    `);
});
