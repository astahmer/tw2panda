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

    test("textDecoration - CSS-wide keywords (inherit/initial/revert/unset)", () => {
      const inheritClasses = extractTailwindClassesFromPandaCss({ textDecoration: "inherit" });
      const initialClasses = extractTailwindClassesFromPandaCss({ textDecoration: "initial" });
      const revertClasses = extractTailwindClassesFromPandaCss({ textDecoration: "revert" });
      const unsetClasses = extractTailwindClassesFromPandaCss({ textDecoration: "unset" });

      expect(inheritClasses).toContain("decoration-inherit");
      expect(initialClasses).toContain("decoration-initial");
      expect(revertClasses).toContain("decoration-revert");
      expect(unsetClasses).toContain("decoration-unset");
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

  describe("Panda shorthands", () => {
    test("margin shorthands - mt, mr, mb, ml", () => {
      const mtClasses = extractTailwindClassesFromPandaCss({ mt: "4" });
      const mrClasses = extractTailwindClassesFromPandaCss({ mr: "2" });
      const mbClasses = extractTailwindClassesFromPandaCss({ mb: "6" });
      const mlClasses = extractTailwindClassesFromPandaCss({ ml: "3" });

      expect(mtClasses).toContain("mt-4");
      expect(mrClasses).toContain("mr-2");
      expect(mbClasses).toContain("mb-6");
      expect(mlClasses).toContain("ml-3");
    });

    test("margin shorthand - mx, my", () => {
      const mxClasses = extractTailwindClassesFromPandaCss({ mx: "4" });
      const myClasses = extractTailwindClassesFromPandaCss({ my: "2" });

      expect(mxClasses).toContain("mx-4");
      expect(myClasses).toContain("my-2");
    });

    test("padding shorthands - pt, pr, pb, pl", () => {
      const ptClasses = extractTailwindClassesFromPandaCss({ pt: "4" });
      const prClasses = extractTailwindClassesFromPandaCss({ pr: "2" });
      const pbClasses = extractTailwindClassesFromPandaCss({ pb: "6" });
      const plClasses = extractTailwindClassesFromPandaCss({ pl: "3" });

      expect(ptClasses).toContain("pt-4");
      expect(prClasses).toContain("pr-2");
      expect(pbClasses).toContain("pb-6");
      expect(plClasses).toContain("pl-3");
    });

    test("padding shorthand - px, py", () => {
      const pxClasses = extractTailwindClassesFromPandaCss({ px: "4" });
      const pyClasses = extractTailwindClassesFromPandaCss({ py: "2" });

      expect(pxClasses).toContain("px-4");
      expect(pyClasses).toContain("py-2");
    });

    test("sizing shorthands - w, h", () => {
      const wClasses = extractTailwindClassesFromPandaCss({ w: "1/2" });
      const hClasses = extractTailwindClassesFromPandaCss({ h: "32" });

      expect(wClasses).toContain("w-1/2");
      expect(hClasses).toContain("h-32");
    });

    test("border radius shorthand - rounded", () => {
      const roundedClasses = extractTailwindClassesFromPandaCss({ rounded: "md" });
      const roundedTlClasses = extractTailwindClassesFromPandaCss({ roundedTl: "lg" });

      expect(roundedClasses).toContain("rounded-md");
      expect(roundedTlClasses).toContain("rounded-tl-lg");
    });

    test("text shorthands - text (fontSize), textColor", () => {
      const textClasses = extractTailwindClassesFromPandaCss({ text: "lg" });
      const textColorClasses = extractTailwindClassesFromPandaCss({ textColor: "red.500" });

      expect(textClasses).toContain("text-lg");
      expect(textColorClasses.some((c) => c.includes("text-red"))).toBe(true);
    });

    test("gap shorthands - gap, gapX, gapY", () => {
      const gapClasses = extractTailwindClassesFromPandaCss({ gap: "4" });
      const gapXClasses = extractTailwindClassesFromPandaCss({ gapX: "2" });
      const gapYClasses = extractTailwindClassesFromPandaCss({ gapY: "6" });

      expect(gapClasses).toContain("gap-4");
      expect(gapXClasses).toContain("gap-x-2");
      expect(gapYClasses).toContain("gap-y-6");
    });

    test("space shorthands - spaceX, spaceY", () => {
      const spaceXClasses = extractTailwindClassesFromPandaCss({ spaceX: "2" });
      const spaceYClasses = extractTailwindClassesFromPandaCss({ spaceY: "4" });

      expect(spaceXClasses).toContain("space-x-2");
      expect(spaceYClasses).toContain("space-y-4");
    });

    test("flex shorthands - items (alignItems), justify (justifyContent)", () => {
      const itemsClasses = extractTailwindClassesFromPandaCss({ items: "center" });
      const justifyClasses = extractTailwindClassesFromPandaCss({ justify: "between" });

      expect(itemsClasses).toContain("items-center");
      expect(justifyClasses).toContain("justify-between");
    });

    test("background shorthand - bg", () => {
      const bgClasses = extractTailwindClassesFromPandaCss({ bg: "blue.500" });

      expect(bgClasses.some((c) => c.includes("bg-blue"))).toBe(true);
    });

    test("transform shorthands - scale, rotate, translate", () => {
      const scaleClasses = extractTailwindClassesFromPandaCss({ scale: "110" });
      const rotateClasses = extractTailwindClassesFromPandaCss({ rotate: "45" });
      const translateXClasses = extractTailwindClassesFromPandaCss({ translateX: "4" });

      expect(scaleClasses).toContain("scale-110");
      expect(rotateClasses).toContain("rotate-45");
      expect(translateXClasses).toContain("translate-x-4");
    });

    test("shadow shorthand - shadow", () => {
      const shadowClasses = extractTailwindClassesFromPandaCss({ shadow: "md" });

      expect(shadowClasses).toContain("shadow-md");
    });
  });

  describe("Responsive properties with conditions", () => {
    test("responsive with base condition", () => {
      const cssObj = {
        base: {
          display: "block",
          fontSize: "sm",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("block");
      expect(classes.some((c) => c.includes("text-sm"))).toBe(true);
    });

    test("responsive with md breakpoint", () => {
      const cssObj = {
        md: {
          display: "flex",
          padding: "8",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c === "md:flex")).toBe(true);
      expect(classes.some((c) => c === "md:p-8")).toBe(true);
    });

    test("responsive with multiple breakpoints", () => {
      const cssObj = {
        base: {
          display: "block",
          padding: "4",
        },
        md: {
          display: "flex",
          padding: "6",
        },
        lg: {
          display: "grid",
          padding: "8",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("block");
      expect(classes).toContain("p-4");
      expect(classes.some((c) => c === "md:flex")).toBe(true);
      expect(classes.some((c) => c === "md:p-6")).toBe(true);
      expect(classes.some((c) => c === "lg:grid")).toBe(true);
      expect(classes.some((c) => c === "lg:p-8")).toBe(true);
    });

    test("responsive with shorthand properties", () => {
      const cssObj = {
        base: {
          pt: "4",
          pb: "4",
        },
        md: {
          pt: "8",
          pb: "8",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("pt-4");
      expect(classes).toContain("pb-4");
      expect(classes.some((c) => c === "md:pt-8")).toBe(true);
      expect(classes.some((c) => c === "md:pb-8")).toBe(true);
    });

    test("responsive with pseudo-selectors", () => {
      const cssObj = {
        base: {
          display: "block",
        },
        md: {
          display: "flex",
          _hover: {
            backgroundColor: "blue.500",
          },
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("block");
      expect(classes.some((c) => c === "md:flex")).toBe(true);
      expect(classes.some((c) => c.includes("md:hover:bg-blue"))).toBe(true);
    });

    test("responsive with multiple grid columns pattern", () => {
      const cssObj = {
        base: {
          gridTemplateColumns: "1",
        },
        xl: {
          gridTemplateColumns: "2",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("grid-cols-1");
      expect(classes.some((c) => c === "xl:grid-cols-2")).toBe(true);
    });

    test("complex responsive with shorthand and pseudo-selectors", () => {
      const cssObj = {
        display: "block",
        mt: "4",
        base: {
          padding: "2",
        },
        md: {
          padding: "4",
          px: "6",
          _hover: {
            bg: "gray.100",
          },
        },
        lg: {
          padding: "8",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("block");
      expect(classes).toContain("mt-4");
      expect(classes).toContain("p-2");
      expect(classes.some((c) => c === "md:p-4")).toBe(true);
      expect(classes.some((c) => c === "md:px-6")).toBe(true);
      expect(classes.some((c) => c.includes("md:hover:bg-gray"))).toBe(true);
      expect(classes.some((c) => c === "lg:p-8")).toBe(true);
    });
  });

  describe("CSS selector conversion", () => {
    test("converts & > :last-child to last: variant", () => {
      const cssObj = {
        "& > :last-child": {
          paddingBottom: "24",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("last:pb-24");
    });

    test("converts & > :first-child to first: variant", () => {
      const cssObj = {
        "& > :first-child": {
          paddingTop: "16",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("first:pt-16");
    });

    test("converts &:hover to hover: variant", () => {
      const cssObj = {
        "&:hover": {
          backgroundColor: "blue.500",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c.includes("hover:bg-blue"))).toBe(true);
    });

    test("converts &:focus to focus: variant", () => {
      const cssObj = {
        "&:focus": {
          borderColor: "blue.600",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c.includes("focus:border-blue"))).toBe(true);
    });

    test("converts &:first-child to first: variant", () => {
      const cssObj = {
        "&:first-child": {
          marginTop: "0",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c.includes("first:"))).toBe(true);
    });

    test("converts &:last-child to last: variant", () => {
      const cssObj = {
        "&:last-child": {
          marginBottom: "0",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c.includes("last:"))).toBe(true);
    });

    test("converts &::before to before: variant", () => {
      const cssObj = {
        "&::before": {
          display: "block",
          width: "100",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      // before: variant should apply to the CSS properties
      expect(classes.some((c) => c.includes("before:block"))).toBe(true);
      expect(classes.some((c) => c.includes("before:w-100"))).toBe(true);
    });

    test("converts &::after to after: variant", () => {
      const cssObj = {
        "&::after": {
          display: "block",
          backgroundColor: "gray.100",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      // after: variant should apply to the CSS properties
      expect(classes.some((c) => c.includes("after:block"))).toBe(true);
      expect(classes.some((c) => c.includes("after:bg-gray"))).toBe(true);
    });

    test("handles complex nested selectors with responsive conditions", () => {
      const cssObj = {
        gap: "24",
        height: "100",
        minHeight: "0",
        marginBottom: "24",
        paddingY: "0",
        paddingX: "24",
        "& > :last-child": {
          paddingBottom: "24",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("gap-24");
      expect(classes).toContain("h-100");
      expect(classes).toContain("min-h-0");
      expect(classes).toContain("mb-24");
      expect(classes).toContain("py-0");
      expect(classes).toContain("px-24");
      expect(classes).toContain("last:pb-24");
    });

    test("skips unknown selectors", () => {
      const cssObj = {
        display: "flex",
        ".some-random-class": {
          color: "red.500",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      // Should only have the display class, not process the unknown selector
      expect(classes.length).toBe(1);
      expect(classes).toContain("flex");
    });

    test("handles arbitrary selectors with pseudo-selectors", () => {
      const cssObj = {
        display: "flex",
        "& + div": {
          marginTop: "4",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      // Should convert the arbitrary "& + div" selector to Tailwind's arbitrary selector syntax
      expect(classes).toContain("flex");
      expect(classes.some((c) => c.includes("[&_+_div]"))).toBe(true);
      expect(classes.some((c) => c.includes("mt-4"))).toBe(true);
    });

    test("converts pseudo-selectors with complex combinator selectors", () => {
      const cssObj = {
        gap: "4",
        "& > :last-child": {
          paddingBottom: "8",
        },
        "& ~ div": {
          marginTop: "2",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("gap-4");
      expect(classes).toContain("last:pb-8");
      // "& ~ div" should be converted using arbitrary selector syntax
      expect(classes.some((c) => c.includes("[&_~_div]"))).toBe(true);
      expect(classes.some((c) => c.includes("mt-2"))).toBe(true);
    });

    test("handles multiple pseudo-selectors in same object", () => {
      const cssObj = {
        padding: "4",
        "&:hover": {
          backgroundColor: "blue.500",
        },
        "&:focus": {
          borderColor: "blue.600",
        },
        "&:disabled": {
          opacity: "0.5",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("p-4");
      expect(classes.some((c) => c.includes("hover:bg-blue"))).toBe(true);
      expect(classes.some((c) => c.includes("focus:border-blue"))).toBe(true);
      expect(classes.some((c) => c.includes("disabled:opacity"))).toBe(true);
    });

    test("handles pseudo-elements with various syntaxes", () => {
      const cssObj = {
        "&::before": {
          width: "100",
          height: "50",
        },
        "&::after": {
          display: "block",
        },
        "&::first-line": {
          fontWeight: "bold",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c.includes("before:w-100"))).toBe(true);
      expect(classes.some((c) => c.includes("before:h-50"))).toBe(true);
      expect(classes.some((c) => c.includes("after:block"))).toBe(true);
      // ::first-line doesn't have a Tailwind equivalent, should be skipped
      expect(classes.filter((c) => c.includes("first-line")).length).toBe(0);
    });

    test("handles nth-child selectors", () => {
      const cssObj = {
        "& > :nth-child(2n)": {
          backgroundColor: "gray.100",
        },
        "& > :nth-child(odd)": {
          backgroundColor: "white",
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes.some((c) => c.includes("even:bg-gray"))).toBe(true);
      expect(classes.some((c) => c.includes("odd:bg-white"))).toBe(true);
    });

    test("handles child element descendant selectors with underscores", () => {
      const cssObj = {
        display: "flex",
        "& ol": {
          listStyleType: "decimal",
          paddingLeft: "6",
          marginY: "2",
        },
        "& li": {
          marginBottom: "1",
        },
        "& a": {
          color: "content-emphasis",
          fontWeight: "medium",
          _hover: {
            cursor: "pointer",
          },
        },
      };

      const classes = extractTailwindClassesFromPandaCss(cssObj);

      expect(classes).toContain("flex");
      // Child element selectors should be wrapped with underscores for Tailwind's arbitrary syntax
      expect(classes.some((c) => c.includes("[&_ol]"))).toBe(true);
      expect(classes.some((c) => c.includes("[&_li]"))).toBe(true);
      expect(classes.some((c) => c.includes("[&_a]"))).toBe(true);
      // Check that properties are applied with the selector
      expect(classes.some((c) => c.includes("[&_ol]:") || c.startsWith("[&_ol]:"))).toBe(true);
    });
  });
});
