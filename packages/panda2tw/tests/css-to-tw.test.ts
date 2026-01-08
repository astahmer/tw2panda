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
        "disabled:pointer-events-none",
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

  test("extractTailwindClassesFromPandaCss - paddingX/paddingY and marginX/marginY", () => {
    const paddingXClasses = extractTailwindClassesFromPandaCss({ paddingX: "32" });
    const paddingYClasses = extractTailwindClassesFromPandaCss({ paddingY: "32" });
    const marginXClasses = extractTailwindClassesFromPandaCss({ marginX: "16" });
    const marginYClasses = extractTailwindClassesFromPandaCss({ marginY: "8" });

    expect(paddingXClasses).toContain("px-32");
    expect(paddingYClasses).toContain("py-32");
    expect(marginXClasses).toContain("mx-16");
    expect(marginYClasses).toContain("my-8");
  });

  describe("Special property handling", () => {
    test("textDecoration - none/underline/line-through/overline", () => {
      const noneClasses = extractTailwindClassesFromPandaCss({ textDecoration: "none" });
      const underlineClasses = extractTailwindClassesFromPandaCss({ textDecoration: "underline" });
      const lineThroughClasses = extractTailwindClassesFromPandaCss({ textDecoration: "line-through" });
      const overlineClasses = extractTailwindClassesFromPandaCss({ textDecoration: "overline" });

      expect(noneClasses).toContain("no-underline");
      expect(underlineClasses).toContain("underline");
      expect(lineThroughClasses).toContain("line-through");
      expect(overlineClasses).toContain("overline");
    });

    test("textDecorationLine - same as textDecoration", () => {
      const classes = extractTailwindClassesFromPandaCss({
        textDecorationLine: "underline",
      });
      expect(classes).toContain("underline");
    });

    test("fontStyle - italic/normal/oblique", () => {
      const italicClasses = extractTailwindClassesFromPandaCss({ fontStyle: "italic" });
      const normalClasses = extractTailwindClassesFromPandaCss({ fontStyle: "normal" });
      const obliqueClasses = extractTailwindClassesFromPandaCss({ fontStyle: "oblique" });

      expect(italicClasses).toContain("italic");
      expect(normalClasses).toContain("not-italic");
      expect(obliqueClasses).toContain("italic");
    });

    test("visibility - visible/hidden/collapse", () => {
      const visibleClasses = extractTailwindClassesFromPandaCss({ visibility: "visible" });
      const hiddenClasses = extractTailwindClassesFromPandaCss({ visibility: "hidden" });

      expect(visibleClasses).toContain("visible");
      expect(hiddenClasses).toContain("invisible");
    });

    test("whiteSpace - normal/nowrap/pre/pre-wrap/pre-line/break-spaces", () => {
      const normalClasses = extractTailwindClassesFromPandaCss({ whiteSpace: "normal" });
      const nowrapClasses = extractTailwindClassesFromPandaCss({ whiteSpace: "nowrap" });
      const preClasses = extractTailwindClassesFromPandaCss({ whiteSpace: "pre" });
      const preWrapClasses = extractTailwindClassesFromPandaCss({ whiteSpace: "pre-wrap" });
      const preLineClasses = extractTailwindClassesFromPandaCss({ whiteSpace: "pre-line" });

      expect(normalClasses).toContain("whitespace-normal");
      expect(nowrapClasses).toContain("whitespace-nowrap");
      expect(preClasses).toContain("whitespace-pre");
      expect(preWrapClasses).toContain("whitespace-pre-wrap");
      expect(preLineClasses).toContain("whitespace-pre-line");
    });

    test("wordBreak - normal/break-all/keep-all/break-word", () => {
      const normalClasses = extractTailwindClassesFromPandaCss({ wordBreak: "normal" });
      const breakAllClasses = extractTailwindClassesFromPandaCss({ wordBreak: "break-all" });
      const keepAllClasses = extractTailwindClassesFromPandaCss({ wordBreak: "keep-all" });
      const breakWordClasses = extractTailwindClassesFromPandaCss({ wordBreak: "break-word" });

      expect(normalClasses).toContain("break-normal");
      expect(breakAllClasses).toContain("break-all");
      expect(keepAllClasses).toContain("break-keep");
      expect(breakWordClasses).toContain("break-word");
    });

    test("wordWrap/overflowWrap - break-word", () => {
      const classes = extractTailwindClassesFromPandaCss({ wordWrap: "break-word" });
      expect(classes).toContain("break-words");
    });

    test("boxSizing - border-box/content-box", () => {
      const borderBoxClasses = extractTailwindClassesFromPandaCss({ boxSizing: "border-box" });
      const contentBoxClasses = extractTailwindClassesFromPandaCss({ boxSizing: "content-box" });

      expect(borderBoxClasses).toContain("box-border");
      expect(contentBoxClasses).toContain("box-content");
    });

    test("display - handles none as hidden", () => {
      const noneClasses = extractTailwindClassesFromPandaCss({ display: "none" });
      expect(noneClasses).toContain("hidden");
    });

    test("textAlign - left/center/right/justify", () => {
      const leftClasses = extractTailwindClassesFromPandaCss({ textAlign: "left" });
      const centerClasses = extractTailwindClassesFromPandaCss({ textAlign: "center" });
      const rightClasses = extractTailwindClassesFromPandaCss({ textAlign: "right" });
      const justifyClasses = extractTailwindClassesFromPandaCss({ textAlign: "justify" });

      expect(leftClasses).toContain("text-left");
      expect(centerClasses).toContain("text-center");
      expect(rightClasses).toContain("text-right");
      expect(justifyClasses).toContain("text-justify");
    });

    test("textTransform - uppercase/lowercase/capitalize", () => {
      const uppercaseClasses = extractTailwindClassesFromPandaCss({ textTransform: "uppercase" });
      const lowercaseClasses = extractTailwindClassesFromPandaCss({ textTransform: "lowercase" });
      const capitalizeClasses = extractTailwindClassesFromPandaCss({ textTransform: "capitalize" });

      expect(uppercaseClasses).toContain("uppercase");
      expect(lowercaseClasses).toContain("lowercase");
      expect(capitalizeClasses).toContain("capitalize");
    });

    test("flexWrap - wrap/nowrap/wrap-reverse", () => {
      const wrapClasses = extractTailwindClassesFromPandaCss({ flexWrap: "wrap" });
      const nowrapClasses = extractTailwindClassesFromPandaCss({ flexWrap: "nowrap" });
      const wrapReverseClasses = extractTailwindClassesFromPandaCss({ flexWrap: "wrap-reverse" });

      expect(wrapClasses).toContain("flex-wrap");
      expect(nowrapClasses).toContain("flex-nowrap");
      expect(wrapReverseClasses).toContain("flex-wrap-reverse");
    });

    test("overflow properties - overflow/overflowX/overflowY", () => {
      const overflowClasses = extractTailwindClassesFromPandaCss({ overflow: "auto" });
      const overflowXClasses = extractTailwindClassesFromPandaCss({ overflowX: "hidden" });
      const overflowYClasses = extractTailwindClassesFromPandaCss({ overflowY: "scroll" });

      expect(overflowClasses).toContain("overflow-auto");
      expect(overflowXClasses).toContain("overflow-x-hidden");
      expect(overflowYClasses).toContain("overflow-y-scroll");
    });

    test("backgroundClip - text/border-box/padding-box/content-box", () => {
      const textClasses = extractTailwindClassesFromPandaCss({ backgroundClip: "text" });
      const borderClasses = extractTailwindClassesFromPandaCss({ backgroundClip: "border-box" });
      const paddingClasses = extractTailwindClassesFromPandaCss({ backgroundClip: "padding-box" });
      const contentClasses = extractTailwindClassesFromPandaCss({ backgroundClip: "content-box" });

      expect(textClasses).toContain("bg-clip-text");
      expect(borderClasses).toContain("bg-clip-border");
      expect(paddingClasses).toContain("bg-clip-padding");
      expect(contentClasses).toContain("bg-clip-content");
    });

    test("borderCollapse - collapse/separate", () => {
      const collapseClasses = extractTailwindClassesFromPandaCss({ borderCollapse: "collapse" });
      const separateClasses = extractTailwindClassesFromPandaCss({ borderCollapse: "separate" });

      expect(collapseClasses).toContain("border-collapse");
      expect(separateClasses).toContain("border-separate");
    });

    test("tableLayout - auto/fixed", () => {
      const autoClasses = extractTailwindClassesFromPandaCss({ tableLayout: "auto" });
      const fixedClasses = extractTailwindClassesFromPandaCss({ tableLayout: "fixed" });

      expect(autoClasses).toContain("table-auto");
      expect(fixedClasses).toContain("table-fixed");
    });

    test("scrollBehavior - auto/smooth", () => {
      const autoClasses = extractTailwindClassesFromPandaCss({ scrollBehavior: "auto" });
      const smoothClasses = extractTailwindClassesFromPandaCss({ scrollBehavior: "smooth" });

      expect(autoClasses).toContain("scroll-auto");
      expect(smoothClasses).toContain("scroll-smooth");
    });

    test("listStylePosition - inside/outside", () => {
      const insideClasses = extractTailwindClassesFromPandaCss({ listStylePosition: "inside" });
      const outsideClasses = extractTailwindClassesFromPandaCss({ listStylePosition: "outside" });

      expect(insideClasses).toContain("list-inside");
      expect(outsideClasses).toContain("list-outside");
    });

    test("pointerEvents - auto/none/pointer", () => {
      const autoClasses = extractTailwindClassesFromPandaCss({ pointerEvents: "auto" });
      const noneClasses = extractTailwindClassesFromPandaCss({ pointerEvents: "none" });
      const pointerClasses = extractTailwindClassesFromPandaCss({ pointerEvents: "pointer" });

      expect(autoClasses).toContain("pointer-events-auto");
      expect(noneClasses).toContain("pointer-events-none");
      expect(pointerClasses).toContain("pointer-events-pointer");
    });

    test("userSelect - auto/none/text/contain/all", () => {
      const autoClasses = extractTailwindClassesFromPandaCss({ userSelect: "auto" });
      const noneClasses = extractTailwindClassesFromPandaCss({ userSelect: "none" });
      const textClasses = extractTailwindClassesFromPandaCss({ userSelect: "text" });

      expect(autoClasses).toContain("select-auto");
      expect(noneClasses).toContain("select-none");
      expect(textClasses).toContain("select-text");
    });
  });

  describe("Standard property handling", () => {
    test("flexGrow/flexShrink/flexBasis", () => {
      const growClasses = extractTailwindClassesFromPandaCss({ flexGrow: "1" });
      const shrinkClasses = extractTailwindClassesFromPandaCss({ flexShrink: "0" });
      const basisClasses = extractTailwindClassesFromPandaCss({ flexBasis: "50%" });

      expect(growClasses).toContain("grow-1");
      expect(shrinkClasses).toContain("shrink-0");
      expect(basisClasses).toContain("basis-50%");
    });

    test("zIndex", () => {
      const classes = extractTailwindClassesFromPandaCss({ zIndex: "10" });
      expect(classes).toContain("z-10");
    });

    test("aspectRatio", () => {
      const classes = extractTailwindClassesFromPandaCss({ aspectRatio: "16/9" });
      expect(classes.some((c) => c.includes("aspect"))).toBe(true);
    });

    test("gapX/gapY", () => {
      const gapXClasses = extractTailwindClassesFromPandaCss({ gapX: "2" });
      const gapYClasses = extractTailwindClassesFromPandaCss({ gapY: "4" });

      expect(gapXClasses).toContain("gap-x-2");
      expect(gapYClasses).toContain("gap-y-4");
    });

    test("spaceX/spaceY", () => {
      const spaceXClasses = extractTailwindClassesFromPandaCss({ spaceX: "2" });
      const spaceYClasses = extractTailwindClassesFromPandaCss({ spaceY: "4" });

      expect(spaceXClasses).toContain("space-x-2");
      expect(spaceYClasses).toContain("space-y-4");
    });

    test("textDecorationColor/textUnderlineOffset", () => {
      const colorClasses = extractTailwindClassesFromPandaCss({ textDecorationColor: "red" });
      const offsetClasses = extractTailwindClassesFromPandaCss({ textUnderlineOffset: "2" });

      expect(colorClasses).toContain("decoration-red");
      expect(offsetClasses).toContain("underline-offset-2");
    });

    test("alignContent/alignSelf/justifyItems/justifySelf", () => {
      const alignContentClasses = extractTailwindClassesFromPandaCss({ alignContent: "center" });
      const alignSelfClasses = extractTailwindClassesFromPandaCss({ alignSelf: "start" });
      const justifyItemsClasses = extractTailwindClassesFromPandaCss({ justifyItems: "end" });
      const justifySelfClasses = extractTailwindClassesFromPandaCss({ justifySelf: "stretch" });

      expect(alignContentClasses).toContain("content-center");
      expect(alignSelfClasses).toContain("self-start");
      expect(justifyItemsClasses).toContain("justify-items-end");
      expect(justifySelfClasses).toContain("justify-self-stretch");
    });

    test("order property", () => {
      const classes = extractTailwindClassesFromPandaCss({ order: "1" });
      expect(classes).toContain("order-1");
    });

    test("translate properties", () => {
      const xClasses = extractTailwindClassesFromPandaCss({ translateX: "4" });
      const yClasses = extractTailwindClassesFromPandaCss({ translateY: "8" });

      expect(xClasses).toContain("translate-x-4");
      expect(yClasses).toContain("translate-y-8");
    });

    test("scale properties", () => {
      const xClasses = extractTailwindClassesFromPandaCss({ scaleX: "50" });
      const yClasses = extractTailwindClassesFromPandaCss({ scaleY: "75" });

      expect(xClasses).toContain("scale-x-50");
      expect(yClasses).toContain("scale-y-75");
    });

    test("skew properties", () => {
      const skewClasses = extractTailwindClassesFromPandaCss({ skew: "6" });
      const skewXClasses = extractTailwindClassesFromPandaCss({ skewX: "3" });
      const skewYClasses = extractTailwindClassesFromPandaCss({ skewY: "12" });

      expect(skewClasses).toContain("skew-6");
      expect(skewXClasses).toContain("skew-x-3");
      expect(skewYClasses).toContain("skew-y-12");
    });

    test("border style properties", () => {
      const styleClasses = extractTailwindClassesFromPandaCss({ borderStyle: "dashed" });
      const topStyleClasses = extractTailwindClassesFromPandaCss({ borderTopStyle: "dotted" });
      const rightStyleClasses = extractTailwindClassesFromPandaCss({ borderRightStyle: "double" });

      expect(styleClasses).toContain("border-dashed");
      expect(topStyleClasses).toContain("border-t-dotted");
      expect(rightStyleClasses).toContain("border-r-double");
    });

    test("filter properties", () => {
      const brightnessClasses = extractTailwindClassesFromPandaCss({ brightness: "150" });
      const contrastClasses = extractTailwindClassesFromPandaCss({ contrast: "200" });
      const grayscaleClasses = extractTailwindClassesFromPandaCss({ grayscale: "100" });

      expect(brightnessClasses).toContain("brightness-150");
      expect(contrastClasses).toContain("contrast-200");
      expect(grayscaleClasses).toContain("grayscale-100");
    });

    test("blur property", () => {
      const classes = extractTailwindClassesFromPandaCss({ blur: "md" });
      expect(classes).toContain("blur-md");
    });

    test("grid properties", () => {
      const gridColsClasses = extractTailwindClassesFromPandaCss({ gridTemplateColumns: "3" });
      const gridRowsClasses = extractTailwindClassesFromPandaCss({ gridTemplateRows: "4" });
      const colClasses = extractTailwindClassesFromPandaCss({ gridColumn: "span-2" });
      const rowClasses = extractTailwindClassesFromPandaCss({ gridRow: "span-3" });

      expect(gridColsClasses).toContain("grid-cols-3");
      expect(gridRowsClasses).toContain("grid-rows-4");
      expect(colClasses).toContain("col-span-2");
      expect(rowClasses).toContain("row-span-3");
    });

    test("scroll padding/margin properties", () => {
      const scrollPtClasses = extractTailwindClassesFromPandaCss({ scrollPaddingTop: "4" });
      const scrollMtClasses = extractTailwindClassesFromPandaCss({ scrollMarginTop: "8" });

      expect(scrollPtClasses).toContain("scroll-pt-4");
      expect(scrollMtClasses).toContain("scroll-mt-8");
    });

    test("mixed new properties with modifiers", () => {
      const classes = extractTailwindClassesFromPandaCss({
        display: "flex",
        flexWrap: "wrap",
        gap: "4",
        _hover: {
          backgroundColor: "blue.500",
          textTransform: "uppercase",
        },
        _dark: {
          visibility: "hidden",
        },
      });

      expect(classes).toContain("flex");
      expect(classes).toContain("flex-wrap");
      expect(classes).toContain("gap-4");
      expect(classes.some((c) => c.includes("hover:bg-blue"))).toBe(true);
      expect(classes.some((c) => c.includes("hover:uppercase"))).toBe(true);
      expect(classes.some((c) => c.includes("dark:invisible"))).toBe(true);
    });

    test("textOverflow, objectFit, outlineStyle, backgroundRepeat", () => {
      const textOverflowClasses = extractTailwindClassesFromPandaCss({ textOverflow: "ellipsis" });
      const objectFitClasses = extractTailwindClassesFromPandaCss({ objectFit: "cover" });
      const outlineStyleClasses = extractTailwindClassesFromPandaCss({ outlineStyle: "none" });
      const bgRepeatClasses = extractTailwindClassesFromPandaCss({ backgroundRepeat: "no-repeat" });

      expect(textOverflowClasses).toContain("text-ellipsis");
      expect(objectFitClasses).toContain("object-cover");
      expect(outlineStyleClasses).toContain("outline-none");
      expect(bgRepeatClasses).toContain("bg-no-repeat");
    });

    test("border and outline properties", () => {
      const borderClasses = extractTailwindClassesFromPandaCss({ border: "1px solid black" });
      const borderTopClasses = extractTailwindClassesFromPandaCss({ borderTop: "2px solid red" });
      const outlineClasses = extractTailwindClassesFromPandaCss({ outline: "2px solid blue" });
      const outlineOffsetClasses = extractTailwindClassesFromPandaCss({ outlineOffset: "2px" });

      expect(borderClasses.some((c) => c.includes("border"))).toBe(true);
      expect(borderTopClasses.some((c) => c.includes("border-t"))).toBe(true);
      expect(outlineClasses.some((c) => c.includes("outline"))).toBe(true);
      expect(outlineOffsetClasses).toContain("outline-offset-2px");
    });
  });
});
