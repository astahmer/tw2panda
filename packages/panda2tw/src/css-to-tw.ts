import type { StyleObject } from "./types.js";
import type { PandaContext } from "./panda-context.js";
import type { Config } from "tailwindcss";
import { createTailwindContext } from "./tw-context.js";

const buildShorthandMap = (pandaContext?: PandaContext): Record<string, string> => {
  if (!pandaContext?.config?.utilities) {
    return getDefaultShorthandMap();
  }

  const utilities = pandaContext.config.utilities;
  const map: Record<string, string> = {};

  // Build shorthand map from utilities
  Object.entries(utilities).forEach(([key, util]) => {
    if (util?.shorthand && typeof util.shorthand === "string") {
      map[util.shorthand] = key;
    }
  });

  // If no shorthands found, use defaults
  return Object.keys(map).length > 0 ? map : getDefaultShorthandMap();
};

const getDefaultShorthandMap = (): Record<string, string> => ({
  m: "margin",
  mt: "marginTop",
  mr: "marginRight",
  mb: "marginBottom",
  ml: "marginLeft",
  mx: "marginX",
  my: "marginY",
  p: "padding",
  pt: "paddingTop",
  pr: "paddingRight",
  pb: "paddingBottom",
  pl: "paddingLeft",
  px: "paddingX",
  py: "paddingY",
  w: "width",
  h: "height",
  minW: "minWidth",
  maxW: "maxWidth",
  minH: "minHeight",
  maxH: "maxHeight",
  pos: "position",
  inset: "inset",
  insetX: "insetX",
  insetY: "insetY",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  border: "border",
  borderTop: "borderTop",
  borderRight: "borderRight",
  borderBottom: "borderBottom",
  borderLeft: "borderLeft",
  borderX: "borderX",
  borderY: "borderY",
  rounded: "borderRadius",
  roundedTop: "borderTopRadius",
  roundedRight: "borderRightRadius",
  roundedBottom: "borderBottomRadius",
  roundedLeft: "borderLeftRadius",
  roundedTl: "borderTopLeftRadius",
  roundedTr: "borderTopRightRadius",
  roundedBr: "borderBottomRightRadius",
  roundedBl: "borderBottomLeftRadius",
  text: "fontSize",
  textColor: "color",
  tracking: "letterSpacing",
  leading: "lineHeight",
  gap: "gap",
  gapX: "gapX",
  gapY: "gapY",
  space: "space",
  spaceX: "spaceX",
  spaceY: "spaceY",
  items: "alignItems",
  justify: "justifyContent",
  self: "alignSelf",
  cols: "gridTemplateColumns",
  rows: "gridTemplateRows",
  col: "gridColumn",
  row: "gridRow",
  d: "display",
  hidden: "display",
  block: "display",
  inline: "display",
  flex: "display",
  grid: "display",
  shadow: "boxShadow",
  overflow: "overflow",
  overflowX: "overflowX",
  overflowY: "overflowY",
  bg: "backgroundColor",
  borderColor: "borderColor",
  borderWidth: "borderWidth",
  opacity: "opacity",
  scale: "scale",
  scaleX: "scaleX",
  scaleY: "scaleY",
  rotate: "rotate",
  skew: "skew",
  skewX: "skewX",
  skewY: "skewY",
  translate: "translate",
  translateX: "translateX",
  translateY: "translateY",
  cursor: "cursor",
  userSelect: "userSelect",
  pointerEvents: "pointerEvents",
  visibility: "visibility",
  zIndex: "zIndex",
  grow: "flexGrow",
  shrink: "flexShrink",
});

export const expandShorthand = (prop: string, pandaContext?: PandaContext, value?: any): string => {
  // Special case: 'flex' is ambiguous - it could mean display:flex or the CSS flex shorthand
  // Only expand to 'display' if the value looks like a boolean/keyword, not a flex value
  if (prop === "flex" && value !== undefined) {
    const strValue = String(value).toLowerCase();
    // These are actual CSS flex shorthand values, not display:flex shortcuts
    if (
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "auto",
        "none",
        "initial",
        "inherit",
        "revert",
        "unset",
      ].includes(strValue)
    ) {
      return prop; // Keep as flex
    }
  }

  const map = buildShorthandMap(pandaContext);
  return map[prop] ?? prop;
};

const getResponsiveConditionKeys = (pandaContext?: PandaContext): string[] => {
  if (!pandaContext?.conditions?.breakpoints) {
    // Default fallback conditions if context is not available
    return ["base", "sm", "md", "lg", "xl", "2xl", "3xl"];
  }

  const breakpoints = pandaContext.conditions.breakpoints;
  const keys = Object.keys(breakpoints);

  // Sort with 'base' first
  return keys.sort((a, b) => {
    if (a === "base") return -1;
    if (b === "base") return 1;
    return 0;
  });
};

// Mapping of CSS properties to Tailwind classes
const propertyMap: Record<string, { pattern: RegExp; classPrefix: string }> = {
  // Colors
  color: { pattern: /^.*$/, classPrefix: "text-" },
  backgroundColor: { pattern: /^.*$/, classPrefix: "bg-" },
  bgColor: { pattern: /^.*$/, classPrefix: "bg-" },
  borderColor: { pattern: /^.*$/, classPrefix: "border-" },
  borderTopColor: { pattern: /^.*$/, classPrefix: "border-t-" },
  borderRightColor: { pattern: /^.*$/, classPrefix: "border-r-" },
  borderBottomColor: { pattern: /^.*$/, classPrefix: "border-b-" },
  borderLeftColor: { pattern: /^.*$/, classPrefix: "border-l-" },
  strokeColor: { pattern: /^.*$/, classPrefix: "stroke-" },
  fillColor: { pattern: /^.*$/, classPrefix: "fill-" },

  // Sizing
  width: { pattern: /^.*$/, classPrefix: "w-" },
  height: { pattern: /^.*$/, classPrefix: "h-" },
  maxWidth: { pattern: /^.*$/, classPrefix: "max-w-" },
  maxHeight: { pattern: /^.*$/, classPrefix: "max-h-" },
  minWidth: { pattern: /^.*$/, classPrefix: "min-w-" },
  minHeight: { pattern: /^.*$/, classPrefix: "min-h-" },

  // Spacing (padding & margin)
  padding: { pattern: /^.*$/, classPrefix: "p-" },
  paddingTop: { pattern: /^.*$/, classPrefix: "pt-" },
  paddingRight: { pattern: /^.*$/, classPrefix: "pr-" },
  paddingBottom: { pattern: /^.*$/, classPrefix: "pb-" },
  paddingLeft: { pattern: /^.*$/, classPrefix: "pl-" },
  paddingX: { pattern: /^.*$/, classPrefix: "px-" },
  paddingY: { pattern: /^.*$/, classPrefix: "py-" },
  margin: { pattern: /^.*$/, classPrefix: "m-" },
  marginTop: { pattern: /^.*$/, classPrefix: "mt-" },
  marginRight: { pattern: /^.*$/, classPrefix: "mr-" },
  marginBottom: { pattern: /^.*$/, classPrefix: "mb-" },
  marginLeft: { pattern: /^.*$/, classPrefix: "ml-" },
  marginX: { pattern: /^.*$/, classPrefix: "mx-" },
  marginY: { pattern: /^.*$/, classPrefix: "my-" },

  // Borders
  borderWidth: { pattern: /^.*$/, classPrefix: "border-" },
  borderTopWidth: { pattern: /^.*$/, classPrefix: "border-t-" },
  borderRightWidth: { pattern: /^.*$/, classPrefix: "border-r-" },
  borderBottomWidth: { pattern: /^.*$/, classPrefix: "border-b-" },
  borderLeftWidth: { pattern: /^.*$/, classPrefix: "border-l-" },
  borderRadius: { pattern: /^.*$/, classPrefix: "rounded-" },
  borderTopLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-tl-" },
  borderTopRightRadius: { pattern: /^.*$/, classPrefix: "rounded-tr-" },
  borderBottomRightRadius: { pattern: /^.*$/, classPrefix: "rounded-br-" },
  borderBottomLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-bl-" },
  borderTopRadius: { pattern: /^.*$/, classPrefix: "rounded-t-" },
  borderBottomRadius: { pattern: /^.*$/, classPrefix: "rounded-b-" },
  borderLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-l-" },
  borderRightRadius: { pattern: /^.*$/, classPrefix: "rounded-r-" },

  // Typography
  fontSize: { pattern: /^.*$/, classPrefix: "text-" },
  fontWeight: { pattern: /^.*$/, classPrefix: "font-" },
  fontStyle: { pattern: /^(italic|normal|oblique)$/, classPrefix: "" }, // Special handling
  lineHeight: { pattern: /^.*$/, classPrefix: "leading-" },
  letterSpacing: { pattern: /^.*$/, classPrefix: "tracking-" },
  textAlign: { pattern: /^(left|center|right|justify)$/, classPrefix: "text-" },
  textDecoration: { pattern: /^(none|underline|line-through|overline)$/, classPrefix: "" }, // Special handling

  // Flex & Grid
  flexDirection: { pattern: /^(row|column|row-reverse|column-reverse)$/, classPrefix: "flex-" },
  alignItems: { pattern: /^.*$/, classPrefix: "items-" },
  justifyContent: { pattern: /^.*$/, classPrefix: "justify-" },
  gap: { pattern: /^.*$/, classPrefix: "gap-" },

  // Overflow
  overflow: { pattern: /^(auto|hidden|visible|scroll)$/, classPrefix: "overflow-" },
  overflowX: { pattern: /^(auto|hidden|visible|scroll)$/, classPrefix: "overflow-x-" },
  overflowY: { pattern: /^(auto|hidden|visible|scroll)$/, classPrefix: "overflow-y-" },

  // Position
  position: { pattern: /^(static|relative|absolute|fixed|sticky)$/, classPrefix: "" },
  top: { pattern: /^.*$/, classPrefix: "top-" },
  right: { pattern: /^.*$/, classPrefix: "right-" },
  bottom: { pattern: /^.*$/, classPrefix: "bottom-" },
  left: { pattern: /^.*$/, classPrefix: "left-" },
  inset: { pattern: /^.*$/, classPrefix: "inset-" },

  // Effects
  opacity: { pattern: /^.*$/, classPrefix: "opacity-" },
  boxShadow: { pattern: /^.*$/, classPrefix: "shadow-" },
  textShadow: { pattern: /^.*$/, classPrefix: "shadow-" },

  // Transforms
  transform: { pattern: /^.*$/, classPrefix: "transform" },
  transformOrigin: { pattern: /^.*$/, classPrefix: "origin-" },
  scale: { pattern: /^.*$/, classPrefix: "scale-" },
  rotate: { pattern: /^.*$/, classPrefix: "rotate-" },
  translate: { pattern: /^.*$/, classPrefix: "translate-" },

  // Transitions & Animation
  transition: { pattern: /^.*$/, classPrefix: "transition-" },
  transitionDuration: { pattern: /^.*$/, classPrefix: "duration-" },
  transitionTimingFunction: { pattern: /^.*$/, classPrefix: "ease-" },
  animation: { pattern: /^.*$/, classPrefix: "animate-" },
  animateIn: { pattern: /^.*$/, classPrefix: "" }, // Special handling
  animateOut: { pattern: /^.*$/, classPrefix: "" }, // Special handling
  fadeIn: { pattern: /^.*$/, classPrefix: "fade-in-" },
  fadeOut: { pattern: /^.*$/, classPrefix: "fade-out-" },

  // Additional Typography
  textTransform: { pattern: /^(uppercase|lowercase|capitalize|none)$/, classPrefix: "" },
  textDecorationLine: { pattern: /^.*$/, classPrefix: "" }, // Special handling needed
  textDecorationStyle: { pattern: /^.*$/, classPrefix: "" }, // Special handling needed
  textDecorationColor: { pattern: /^.*$/, classPrefix: "decoration-" },
  textUnderlineOffset: { pattern: /^.*$/, classPrefix: "underline-offset-" },
  whiteSpace: { pattern: /^(normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/, classPrefix: "whitespace-" },
  wordBreak: { pattern: /^(normal|break-all|keep-all|break-word)$/, classPrefix: "break-" },
  wordWrap: { pattern: /^(normal|break-word)$/, classPrefix: "" }, // Special handling
  hyphens: { pattern: /^(none|manual|auto)$/, classPrefix: "hyphens-" },
  textIndent: { pattern: /^.*$/, classPrefix: "indent-" },

  // Visibility & Display
  visibility: { pattern: /^(visible|hidden|collapse)$/, classPrefix: "" }, // Special handling
  display: {
    pattern: /^(flex|block|inline|grid|hidden|contents|table|table-row|table-cell|list-item)$/,
    classPrefix: "",
  },
  pointerEvents: { pattern: /^(auto|none|pointer)$/, classPrefix: "pointer-events-" },
  userSelect: { pattern: /^(auto|none|text|contain|all)$/, classPrefix: "select-" },
  cursor: { pattern: /^.*$/, classPrefix: "cursor-" },

  // Background properties
  backgroundSize: { pattern: /^.*$/, classPrefix: "bg-" },
  backgroundPosition: { pattern: /^.*$/, classPrefix: "bg-" },
  backgroundAttachment: { pattern: /^(scroll|fixed|local)$/, classPrefix: "bg-" },
  backgroundClip: { pattern: /^(border-box|padding-box|content-box|text)$/, classPrefix: "bg-clip-" },
  backgroundOrigin: { pattern: /^(padding-box|border-box|content-box)$/, classPrefix: "" }, // Special handling

  // Border properties
  borderStyle: { pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/, classPrefix: "border-" },
  borderTopStyle: {
    pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/,
    classPrefix: "border-t-",
  },
  borderRightStyle: {
    pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/,
    classPrefix: "border-r-",
  },
  borderBottomStyle: {
    pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/,
    classPrefix: "border-b-",
  },
  borderLeftStyle: {
    pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/,
    classPrefix: "border-l-",
  },
  borderCollapse: { pattern: /^(collapse|separate)$/, classPrefix: "border-" },
  borderSpacing: { pattern: /^.*$/, classPrefix: "border-spacing-" },

  // Box & Layout
  boxSizing: { pattern: /^(border-box|content-box)$/, classPrefix: "" }, // Special handling
  boxDecorationBreak: { pattern: /^(slice|clone)$/, classPrefix: "" }, // Special handling
  zIndex: { pattern: /^.*$/, classPrefix: "z-" },

  // Flexbox properties
  flex: { pattern: /^.*$/, classPrefix: "flex-" },
  flexWrap: { pattern: /^(wrap|nowrap|wrap-reverse)$/, classPrefix: "flex-" },
  flexGrow: { pattern: /^.*$/, classPrefix: "grow-" },
  flexShrink: { pattern: /^.*$/, classPrefix: "shrink-" },
  flexBasis: { pattern: /^.*$/, classPrefix: "basis-" },
  alignContent: { pattern: /^.*$/, classPrefix: "content-" },
  alignSelf: { pattern: /^.*$/, classPrefix: "self-" },
  justifyItems: { pattern: /^.*$/, classPrefix: "justify-items-" },
  justifySelf: { pattern: /^.*$/, classPrefix: "justify-self-" },
  placeContent: { pattern: /^.*$/, classPrefix: "place-content-" },
  placeItems: { pattern: /^.*$/, classPrefix: "place-items-" },
  placeSelf: { pattern: /^.*$/, classPrefix: "place-self-" },
  order: { pattern: /^.*$/, classPrefix: "order-" },

  // Grid properties
  gridTemplateColumns: { pattern: /^.*$/, classPrefix: "grid-cols-" },
  gridTemplateRows: { pattern: /^.*$/, classPrefix: "grid-rows-" },
  gridColumn: { pattern: /^.*$/, classPrefix: "col-" },
  gridRow: { pattern: /^.*$/, classPrefix: "row-" },
  gridColumnStart: { pattern: /^.*$/, classPrefix: "col-start-" },
  gridColumnEnd: { pattern: /^.*$/, classPrefix: "col-end-" },
  gridRowStart: { pattern: /^.*$/, classPrefix: "row-start-" },
  gridRowEnd: { pattern: /^.*$/, classPrefix: "row-end-" },
  gridAutoFlow: { pattern: /^(row|column|dense)$/, classPrefix: "auto-" },
  gridAutoColumns: { pattern: /^.*$/, classPrefix: "auto-cols-" },
  gridAutoRows: { pattern: /^.*$/, classPrefix: "auto-rows-" },

  // Typography - Additional
  fontFamily: { pattern: /^.*$/, classPrefix: "font-" },
  fontVariantNumeric: { pattern: /^.*$/, classPrefix: "" }, // Special handling

  // List
  listStyleType: { pattern: /^.*$/, classPrefix: "list-" },
  listStylePosition: { pattern: /^(inside|outside)$/, classPrefix: "list-" },

  // Sizing - Additional
  aspectRatio: { pattern: /^.*$/, classPrefix: "aspect-" },

  // Spacing - Additional
  gapX: { pattern: /^.*$/, classPrefix: "gap-x-" },
  gapY: { pattern: /^.*$/, classPrefix: "gap-y-" },
  spaceX: { pattern: /^.*$/, classPrefix: "space-x-" },
  spaceY: { pattern: /^.*$/, classPrefix: "space-y-" },

  // Transform
  skew: { pattern: /^.*$/, classPrefix: "skew-" },
  skewX: { pattern: /^.*$/, classPrefix: "skew-x-" },
  skewY: { pattern: /^.*$/, classPrefix: "skew-y-" },
  scaleX: { pattern: /^.*$/, classPrefix: "scale-x-" },
  scaleY: { pattern: /^.*$/, classPrefix: "scale-y-" },
  translateX: { pattern: /^.*$/, classPrefix: "translate-x-" },
  translateY: { pattern: /^.*$/, classPrefix: "translate-y-" },
  rotateX: { pattern: /^.*$/, classPrefix: "rotate-x-" },
  rotateY: { pattern: /^.*$/, classPrefix: "rotate-y-" },
  rotateZ: { pattern: /^.*$/, classPrefix: "rotate-z-" },
  perspective: { pattern: /^.*$/, classPrefix: "perspective-" },
  perspectiveOrigin: { pattern: /^.*$/, classPrefix: "" }, // Special handling

  // Transition - Additional
  transitionProperty: { pattern: /^.*$/, classPrefix: "transition-" },
  transitionDelay: { pattern: /^.*$/, classPrefix: "delay-" },

  // Filter & Backdrop
  filter: { pattern: /^.*$/, classPrefix: "filter" },
  backdropFilter: { pattern: /^.*$/, classPrefix: "backdrop-filter" },
  brightness: { pattern: /^.*$/, classPrefix: "brightness-" },
  contrast: { pattern: /^.*$/, classPrefix: "contrast-" },
  grayscale: { pattern: /^.*$/, classPrefix: "grayscale-" },
  hueRotate: { pattern: /^.*$/, classPrefix: "hue-rotate-" },
  invert: { pattern: /^.*$/, classPrefix: "invert-" },
  saturate: { pattern: /^.*$/, classPrefix: "saturate-" },
  sepia: { pattern: /^.*$/, classPrefix: "sepia-" },
  blur: { pattern: /^.*$/, classPrefix: "blur-" },
  backdropBlur: { pattern: /^.*$/, classPrefix: "backdrop-blur-" },
  backdropBrightness: { pattern: /^.*$/, classPrefix: "backdrop-brightness-" },
  backdropContrast: { pattern: /^.*$/, classPrefix: "backdrop-contrast-" },
  backdropGrayscale: { pattern: /^.*$/, classPrefix: "backdrop-grayscale-" },
  backdropHueRotate: { pattern: /^.*$/, classPrefix: "backdrop-hue-rotate-" },
  backdropInvert: { pattern: /^.*$/, classPrefix: "backdrop-invert-" },
  backdropOpacity: { pattern: /^.*$/, classPrefix: "backdrop-opacity-" },
  backdropSaturate: { pattern: /^.*$/, classPrefix: "backdrop-saturate-" },
  backdropSepia: { pattern: /^.*$/, classPrefix: "backdrop-sepia-" },

  // SVG
  strokeWidth: { pattern: /^.*$/, classPrefix: "stroke-" },
  strokeLinecap: { pattern: /^(butt|round|square)$/, classPrefix: "stroke-" },
  strokeLinejoin: { pattern: /^(arcs|bevel|miter|miter-clip|round)$/, classPrefix: "stroke-" },
  paintOrder: { pattern: /^.*$/, classPrefix: "" }, // Special handling

  // Object & Image
  objectFit: { pattern: /^(contain|cover|fill|none|scale-down)$/, classPrefix: "object-" },
  objectPosition: { pattern: /^.*$/, classPrefix: "object-" },
  textOverflow: { pattern: /^(clip|ellipsis)$/, classPrefix: "" }, // Special handling

  // Background
  backgroundRepeat: { pattern: /^(no-repeat|repeat|repeat-x|repeat-y|repeat-round|repeat-space)$/, classPrefix: "bg-" },
  backgroundBlendMode: { pattern: /^.*$/, classPrefix: "bg-blend-" },

  // Outline
  outline: { pattern: /^.*$/, classPrefix: "outline-" },
  outlineWidth: { pattern: /^.*$/, classPrefix: "outline-" },
  outlineColor: { pattern: /^.*$/, classPrefix: "outline-" },
  outlineStyle: { pattern: /^(none|solid|dashed|dotted|double)$/, classPrefix: "outline-" },
  outlineOffset: { pattern: /^.*$/, classPrefix: "outline-offset-" },

  // Border (shorthand variations)
  border: { pattern: /^.*$/, classPrefix: "border-" },
  borderTop: { pattern: /^.*$/, classPrefix: "border-t-" },
  borderRight: { pattern: /^.*$/, classPrefix: "border-r-" },
  borderBottom: { pattern: /^.*$/, classPrefix: "border-b-" },
  borderLeft: { pattern: /^.*$/, classPrefix: "border-l-" },

  // Miscellaneous
  clipPath: { pattern: /^.*$/, classPrefix: "clip-" },
  content: { pattern: /^.*$/, classPrefix: "" }, // Special handling (CSS content property)
  mixBlendMode: { pattern: /^.*$/, classPrefix: "mix-blend-" },
  willChange: { pattern: /^.*$/, classPrefix: "will-change-" },
  scrollBehavior: { pattern: /^(auto|smooth)$/, classPrefix: "scroll-" },
  scrollSnapType: { pattern: /^.*$/, classPrefix: "snap-" },
  scrollSnapAlign: { pattern: /^(start|end|center|none)$/, classPrefix: "snap-" },
  scrollSnapStop: { pattern: /^(normal|always)$/, classPrefix: "snap-" },
  scrollPaddingTop: { pattern: /^.*$/, classPrefix: "scroll-pt-" },
  scrollPaddingRight: { pattern: /^.*$/, classPrefix: "scroll-pr-" },
  scrollPaddingBottom: { pattern: /^.*$/, classPrefix: "scroll-pb-" },
  scrollPaddingLeft: { pattern: /^.*$/, classPrefix: "scroll-pl-" },
  scrollMarginTop: { pattern: /^.*$/, classPrefix: "scroll-mt-" },
  scrollMarginRight: { pattern: /^.*$/, classPrefix: "scroll-mr-" },
  scrollMarginBottom: { pattern: /^.*$/, classPrefix: "scroll-mb-" },
  scrollMarginLeft: { pattern: /^.*$/, classPrefix: "scroll-ml-" },

  // Table properties
  tableLayout: { pattern: /^(auto|fixed)$/, classPrefix: "table-" },
  captionSide: { pattern: /^(top|bottom|inline-start|inline-end)$/, classPrefix: "" }, // Special handling

  // Touch
  touchAction: { pattern: /^.*$/, classPrefix: "touch-" },

  // Containing block
  contain: { pattern: /^.*$/, classPrefix: "" }, // Special handling
};

// Map CSS properties to token categories
const tokenCategoryMap: Record<string, string> = {
  color: "colors",
  backgroundColor: "colors",
  borderColor: "colors",
  fillColor: "colors",
  strokeColor: "colors",
  padding: "spacing",
  paddingTop: "spacing",
  paddingRight: "spacing",
  paddingBottom: "spacing",
  paddingLeft: "spacing",
  margin: "spacing",
  marginTop: "spacing",
  marginRight: "spacing",
  marginBottom: "spacing",
  marginLeft: "spacing",
  gap: "spacing",
  width: "sizing",
  height: "sizing",
  maxWidth: "sizing",
  maxHeight: "sizing",
  minWidth: "sizing",
  minHeight: "sizing",
  fontSize: "fontSizes",
  fontWeight: "fontWeights",
  lineHeight: "lineHeights",
  letterSpacing: "letterSpacing",
  borderRadius: "radii",
  borderWidth: "borderWidths",
  boxShadow: "shadows",
  textShadow: "shadows",
};

export const camelToKebab = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};

/**
 * Convert Panda theme token to Tailwind class suffix
 * E.g., "red.500" -> "red-500", "md" -> "md"
 */
export const pandaTokenToTwSuffix = (token: string): string => {
  if (!token) return "";
  // Replace dots with hyphens for color tokens like "red.500" -> "red-500"
  // Replace spaces with underscores for arbitrary values in Tailwind bracket syntax
  return token.replace(/\./g, "-").replace(/\s+/g, "_");
};

export const pandaCssToTailwindClasses = (cssObj: StyleObject, modifiers: string[] = []): string[] => {
  const classes: string[] = [];

  const processProperty = (prop: string, value: any, currentModifiers: string[] = []): void => {
    // Skip special properties
    if (prop.startsWith("_") || Array.isArray(value) || (typeof value !== "string" && typeof value !== "number")) {
      return;
    }

    const mapping = propertyMap[prop];
    if (!mapping) {
      // Property not in our map, skip
      return;
    }

    let className = "";
    const prefix = mapping.classPrefix;
    let strValue = String(value);

    if (prefix) {
      const suffix = pandaTokenToTwSuffix(strValue);
      className = `${prefix}${suffix}`;
    } else {
      className = strValue;
    }

    if (className) {
      const fullClass = currentModifiers.length > 0 ? `${currentModifiers.join(":")}:${className}` : className;
      classes.push(fullClass);
    }
  };

  // Handle base properties
  Object.entries(cssObj).forEach(([prop, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // This is a pseudo-selector or condition
      const modifier = prop.startsWith("_")
        ? prop.slice(1) // Remove leading underscore: _hover -> hover
        : prop;

      processProperty(prop, value, [...modifiers, modifier]);
    } else {
      processProperty(prop, value, modifiers);
    }
  });

  return classes;
};

function getSpecialPropertyClass(key: string, strValue: string): string | null {
  // Handle percentage values for width/height
  if (
    (key === "width" ||
      key === "height" ||
      key === "maxWidth" ||
      key === "maxHeight" ||
      key === "minWidth" ||
      key === "minHeight") &&
    strValue === "100%"
  ) {
    const prefix = key === "width" || key === "maxWidth" || key === "minWidth" ? "w-" : "h-";
    return `${prefix}full`;
  }

  switch (key) {
    case "textDecoration":
    case "textDecorationLine":
      if (strValue === "none") return "no-underline";
      if (strValue === "underline") return "underline";
      if (strValue === "line-through") return "line-through";
      if (strValue === "overline") return "overline";
      if (strValue === "inherit") return "decoration-inherit";
      if (strValue === "initial") return "decoration-initial";
      if (strValue === "revert") return "decoration-revert";
      if (strValue === "unset") return "decoration-unset";
      break;

    case "fontStyle":
      if (strValue === "italic") return "italic";
      if (strValue === "normal") return "not-italic";
      if (strValue === "oblique") return "italic";
      break;

    case "visibility":
      if (strValue === "hidden") return "invisible";
      if (strValue === "visible") return "visible";
      break;

    case "textOverflow":
      if (strValue === "ellipsis") return "text-ellipsis";
      if (strValue === "clip") return "text-clip";
      break;

    case "textTransform":
      if (strValue === "uppercase") return "uppercase";
      if (strValue === "lowercase") return "lowercase";
      if (strValue === "capitalize") return "capitalize";
      break;

    case "boxSizing":
      if (strValue === "border-box") return "box-border";
      if (strValue === "content-box") return "box-content";
      break;

    case "display":
      return strValue === "none" ? "hidden" : null;

    case "position":
      const posMapping = propertyMap[key];
      if (posMapping && posMapping.pattern.test(strValue)) return strValue;
      break;

    case "textAlign":
      const alignMapping = propertyMap[key];
      if (alignMapping) return `text-${strValue}`;
      break;

    case "flexWrap":
      if (strValue === "wrap") return "flex-wrap";
      if (strValue === "nowrap") return "flex-nowrap";
      if (strValue === "wrap-reverse") return "flex-wrap-reverse";
      break;

    case "wordWrap":
    case "overflowWrap":
      if (strValue === "break-word") return "break-words";
      break;

    case "wordBreak": {
      const wordBreakMapping = propertyMap[key];
      if (wordBreakMapping) {
        let suffix = strValue;
        if (strValue === "break-all") suffix = "all";
        else if (strValue === "keep-all") suffix = "keep";
        else if (strValue === "break-word") suffix = "word";
        else suffix = "normal";
        return `${wordBreakMapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "whiteSpace": {
      const wsMapping = propertyMap[key];
      if (wsMapping) {
        let suffix = strValue;
        if (strValue === "pre-wrap") suffix = "pre-wrap";
        else if (strValue === "pre-line") suffix = "pre-line";
        else if (strValue === "pre") suffix = "pre";
        else if (strValue === "nowrap") suffix = "nowrap";
        else if (strValue === "break-spaces") suffix = "break-spaces";
        else suffix = "normal";
        return `${wsMapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "backgroundClip":
      if (strValue === "text") return "bg-clip-text";
      if (strValue === "border-box") return "bg-clip-border";
      if (strValue === "padding-box") return "bg-clip-padding";
      if (strValue === "content-box") return "bg-clip-content";
      break;

    case "borderCollapse":
      if (strValue === "collapse") return "border-collapse";
      if (strValue === "separate") return "border-separate";
      break;

    case "tableLayout":
      if (strValue === "auto") return "table-auto";
      if (strValue === "fixed") return "table-fixed";
      break;

    case "scrollBehavior":
      if (strValue === "smooth") return "scroll-smooth";
      if (strValue === "auto") return "scroll-auto";
      break;

    case "listStylePosition":
      if (strValue === "inside") return "list-inside";
      if (strValue === "outside") return "list-outside";
      break;

    case "backgroundRepeat": {
      const bgRepeatMapping = propertyMap[key];
      if (bgRepeatMapping) {
        let suffix = strValue;
        if (strValue === "no-repeat") suffix = "no-repeat";
        else if (strValue === "repeat-x") suffix = "repeat-x";
        else if (strValue === "repeat-y") suffix = "repeat-y";
        else suffix = "repeat";
        return `${bgRepeatMapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "objectFit": {
      const objFitMapping = propertyMap[key];
      if (objFitMapping) return `${objFitMapping.classPrefix}${strValue}`;
      break;
    }

    case "outlineStyle":
      if (strValue === "none") return "outline-none";
      if (strValue === "solid") return "outline";
      break;

    // Alignment and justification properties with flex-start/flex-end mapping
    case "justifyContent": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        else if (strValue === "space-between") suffix = "between";
        else if (strValue === "space-around") suffix = "around";
        else if (strValue === "space-evenly") suffix = "evenly";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "alignItems": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "alignContent": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        else if (strValue === "space-between") suffix = "between";
        else if (strValue === "space-around") suffix = "around";
        else if (strValue === "space-evenly") suffix = "evenly";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "alignSelf": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "justifyItems": {
      const mapping = propertyMap[key];
      if (mapping) {
        return `${mapping.classPrefix}${strValue}`;
      }
      break;
    }

    case "justifySelf": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "placeContent": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        else if (strValue === "space-between") suffix = "between";
        else if (strValue === "space-around") suffix = "around";
        else if (strValue === "space-evenly") suffix = "evenly";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "placeItems": {
      const mapping = propertyMap[key];
      if (mapping) {
        return `${mapping.classPrefix}${strValue}`;
      }
      break;
    }

    case "placeSelf": {
      const mapping = propertyMap[key];
      if (mapping) {
        let suffix = strValue;
        if (strValue === "flex-start") suffix = "start";
        else if (strValue === "flex-end") suffix = "end";
        return `${mapping.classPrefix}${suffix}`;
      }
      break;
    }

    case "content": {
      // Handle CSS content property - use arbitrary value syntax with proper quote escaping
      // Escape double quotes in the value for Tailwind's bracket notation
      const escapedValue = strValue.replace(/"/g, '\\"');
      return `content-[${escapedValue}]`;
    }

    case "animateIn":
      if (strValue === "true" || strValue === "1") return "animate-in";
      break;

    case "animateOut":
      if (strValue === "true" || strValue === "1") return "animate-out";
      break;
  }

  return null;
}

const pseudoSelectorMap: Record<string, string> = {
  ":hover": "hover",
  ":focus": "focus",
  ":focus-visible": "focus-visible",
  ":active": "active",
  ":disabled": "disabled",
  ":invalid": "invalid",
  ":enabled": "enabled",
  ":checked": "checked",
  ":visited": "visited",
  ":target": "target",
  ":first-child": "first",
  ":last-child": "last",
  ":first-of-type": "first",
  ":last-of-type": "last",
  ":only-child": "only",
  ":nth-child(2n)": "even",
  ":nth-child(2n + 1)": "odd",
  ":nth-child(odd)": "odd",
  ":nth-child(even)": "even",
  ":placeholder-shown": "placeholder-shown",
  "::before": "before",
  "::after": "after",
  ":not(:disabled)": "enabled",
};

/**
 * Extract pseudo-selector from a CSS selector
 * Examples:
 *   "&:hover" -> ":hover"
 *   "& > :last-child" -> ":last-child"
 *   "&::before" -> "::before"
 *   "&" -> null (no pseudo-selector)
 */
const extractPseudoSelector = (selector: string): string | null => {
  // Handle pseudo-elements and pseudo-selectors
  const pseudoMatch = selector.match(/(::[a-z-]+|:[a-z-]+(\([^)]*\))?)/);
  if (pseudoMatch) {
    return pseudoMatch[0];
  }
  return null;
};

/**
 * Convert a CSS selector to Tailwind variant(s)
 * Handles:
 * - Pseudo-selectors: &:hover, &:focus, &:first-child, etc.
 * - Pseudo-elements: &::before, &::after
 * - Compound selectors: & > :last-child
 * - Arbitrary selectors: & + div, & ~ div, & > .child, etc.
 */
const selectorToTwVariant = (selector: string): string | null => {
  const trimmed = selector.trim();

  // If it's just "&", no variant needed
  if (trimmed === "&") {
    return "";
  }

  // If selector doesn't contain "&", we can't handle it
  if (!trimmed.includes("&")) {
    return null;
  }

  // Try to extract a pseudo-selector/pseudo-element first
  const pseudoSelector = extractPseudoSelector(trimmed);
  if (pseudoSelector) {
    // Look up the pseudo-selector in our map
    const variant = pseudoSelectorMap[pseudoSelector];
    if (variant !== undefined) {
      return variant;
    }
    // If pseudo-selector is not in map but has parentheses (functional pseudo-class),
    // treat the whole selector as arbitrary instead of ignoring it
    if (!pseudoSelector.includes("(")) {
      // Simple pseudo-selector/pseudo-element not in map, skip
      return null;
    }
    // Fall through to arbitrary selector handling for functional pseudo-classes
  }

  // For arbitrary selectors, convert spaces to underscores for Tailwind's bracket notation
  // e.g., "& ol" becomes "&_ol", "& > ol" becomes "&_>_ol", "& + div" becomes "&_+_div"
  const cleanSelector = trimmed.replace(/\s+/g, "_");
  return cleanSelector;
};

/**
 * Extract important flag from a CSS value and return cleaned value
 */
const extractImportantFlag = (value: string): { cleanValue: string; isImportant: boolean } => {
  let strValue = String(value);
  let isImportant = false;

  if (strValue.toLowerCase().includes("!important")) {
    isImportant = true;
    strValue = strValue.replace(/\s*!important\s*/gi, "").trim();
  }

  return { cleanValue: strValue, isImportant };
};

/**
 * Helper to build final class name with important flag and modifiers
 */
const buildFinalClassName = (className: string, isImportant: boolean, modifiers: string[]): string => {
  let finalClass = className;
  if (isImportant) {
    finalClass = `!${finalClass}`;
  }
  if (modifiers.length > 0) {
    finalClass = `${modifiers.join(":")}:${finalClass}`;
  }
  return finalClass;
};

/**
 * Extract Tailwind classes from a Panda CSS object
 * Supports panda shorthands (mt, pt, etc.) and responsive conditions (base, md, lg, etc.)
 */
export const extractTailwindClassesFromPandaCss = (cssObj: StyleObject, pandaContext?: PandaContext): string[] => {
  const classes: string[] = [];
  const responsiveConditionKeys = getResponsiveConditionKeys(pandaContext);

  const traverse = createCommonTraverse(classes, responsiveConditionKeys, pandaContext);

  traverse(cssObj);
  return [...new Set(classes)]; // Remove duplicates
};

/**
 * Factory function to create a shared traverse function for both simple and context-aware implementations
 */
const createCommonTraverse = (
  classes: string[],
  responsiveConditionKeys: string[],
  pandaContext: PandaContext | undefined,
  contextData?: {
    inlineTextStyles?: boolean;
    findTokenByValue?: (prop: string, value: string) => string | null;
    resolveToken?: (prop: string, path: string) => string;
  },
) => {
  // Use a recursive function with proper closure
  const traverse = (obj: any, modifiers: string[] = []): void => {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      // Handle textStyle specially
      if (key === "textStyle" && typeof value === "string") {
        if (contextData?.inlineTextStyles && pandaContext) {
          // When inlineTextStyles is true, expand textStyle to its actual CSS properties
          const textStyles = pandaContext.config?.theme?.textStyles || {};
          const resolvedTextStyle = resolveDottedPath(value, textStyles);

          if (resolvedTextStyle && typeof resolvedTextStyle === "object") {
            const styleObject = resolvedTextStyle.value || resolvedTextStyle;
            traverse(styleObject, modifiers);
          }
        } else {
          // Default behavior: generate a simple class like "text-style-body"
          const className = `text-style-${value}`;
          const fullClass = buildFinalClassName(className, false, modifiers);
          classes.push(fullClass);
        }
        return;
      }

      if (key.startsWith("_")) {
        // Pseudo-selector like _hover, _focus, _focusVisible
        let modifier = key.slice(1);
        // Convert camelCase to kebab-case for Tailwind modifiers (e.g., focusVisible -> focus-visible)
        modifier = modifier.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        traverse(value, [...modifiers, modifier]);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Nested object (could be responsive condition like md:, base: or pseudo like _hover)
        if (key === "base") {
          // "base" is just the default, don't add it as a modifier
          traverse(value, modifiers);
        } else if (responsiveConditionKeys.includes(key)) {
          // Apply as responsive modifier for known breakpoints (excluding base)
          traverse(value, [...modifiers, key]);
        } else {
          // Try to convert CSS selector to Tailwind variant
          const twVariant = selectorToTwVariant(key);
          if (twVariant !== null) {
            // Valid Tailwind variant found
            let newModifiers = modifiers;
            if (twVariant) {
              // Check if it's an arbitrary selector (contains & and is not in pseudoSelectorMap)
              if (twVariant.includes("&") && !pseudoSelectorMap[key]) {
                // Wrap arbitrary selector in brackets for Tailwind's arbitrary selector syntax
                // e.g., "&+div" becomes "[&+div]"
                newModifiers = [...modifiers, `[${twVariant}]`];
              } else {
                // Regular pseudo-selector variant
                newModifiers = [...modifiers, twVariant];
              }
            }
            traverse(value, newModifiers);
          } else if (modifiers.length > 0 && !key.startsWith("_")) {
            // If we already have modifiers, treat other nested objects as additional conditions
            traverse(value, [...modifiers, key]);
          } else {
            // Otherwise skip this selector (it's not a recognized pattern)
            // Check if this is a responsive property definition
            const objectKeys = Object.keys(value);
            const allKeysAreResponsive =
              objectKeys.length > 0 && objectKeys.every((k) => responsiveConditionKeys.includes(k) || k === "base");

            const allValuesArePrimitives =
              objectKeys.length > 0 &&
              objectKeys.every((k) => typeof value[k] === "string" || typeof value[k] === "number");

            if (allKeysAreResponsive || allValuesArePrimitives) {
              Object.entries(value).forEach(([respKey, respValue]) => {
                const respModifiers = respKey === "base" ? modifiers : [...modifiers, respKey];
                const propertyObj = { [key]: respValue };
                traverse(propertyObj, respModifiers);
              });
            } else {
              traverse(value, modifiers);
            }
          }
        }
      } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        // Actual style property
        const expandedKey = expandShorthand(key, pandaContext, value);
        const originalValue = String(value);
        const strValue = originalValue.toLowerCase();

        // For context-aware version with advanced token resolution
        if (contextData?.findTokenByValue && contextData?.resolveToken) {
          const { cleanValue, isImportant } = extractImportantFlag(strValue);
          const specialClass = getSpecialPropertyClass(expandedKey, cleanValue);
          let className = specialClass ?? "";

          if (className === "") {
            const mapping = propertyMap[expandedKey];
            if (mapping) {
              const tokenPath = contextData.findTokenByValue(
                expandedKey,
                originalValue.replace(/\s*!important\s*/g, "").trim(),
              );
              const suffix = tokenPath
                ? pandaTokenToTwSuffix(tokenPath)
                : contextData.resolveToken(expandedKey, cleanValue);
              className = suffix ? `${mapping.classPrefix}${suffix}` : mapping.classPrefix;
            }
          }

          if (className) {
            const finalClass = buildFinalClassName(className, isImportant, modifiers);
            classes.push(finalClass);
          }
        } else {
          // Simple version - process property directly
          const { cleanValue: lowerCleanValue, isImportant } = extractImportantFlag(strValue);
          const { cleanValue: originalCleanValue } = extractImportantFlag(originalValue);

          // Try special handling first (uses lowercase for comparison)
          let className = getSpecialPropertyClass(expandedKey, lowerCleanValue);
          if (className === null) {
            // Default handling for all other properties (preserve original case for tokens)
            const mapping = propertyMap[expandedKey];
            if (mapping) {
              const suffix = pandaTokenToTwSuffix(originalCleanValue);
              className = `${mapping.classPrefix}${suffix}`;
            } else {
              className = "";
            }
          }

          if (className) {
            const finalClass = buildFinalClassName(className, isImportant, modifiers);
            classes.push(finalClass);
          }
        }
      }
    });
  };

  return traverse;
};

/**
 * Helper function to resolve token values using Panda's token dictionary
 * Provides more robust token resolution than manual path walking
 *
 * FUTURE OPTIMIZATION: For even more robust token resolution, we could leverage
 * Panda's built-in context methods:
 *
 * 1. pandaContext.tokens.getByName(path) - Get a token by its full path
 * 2. pandaContext.tokens.resolveReference(value) - Resolve token references like {colors.blue.600}
 * 3. pandaContext.tokens.expandReferenceInValue(value) - Expand nested references
 * 4. pandaContext.utility.transform(prop, value) - Use Panda's utility transforms
 * 5. pandaContext.encoder.processAtomic(styles) - Process styles through Panda's encoder
 *
 * Example:
 *   const token = pandaContext.tokens.getByName('colors.blue.600');
 *   const resolved = pandaContext.tokens.resolveReference('{colors.blue.600}');
 *
 * This would handle complex cases like:
 * - Token references: {colors.blue.600}
 * - Semantic tokens with conditions
 * - Color mixtures and computed values
 * - Nested token references
 */
const resolvePandaToken = (path: string, pandaContext?: PandaContext): { value: string; resolved: boolean } => {
  if (!pandaContext?.config?.theme?.tokens) {
    return { value: path, resolved: false };
  }

  const tokens = pandaContext.config.theme.tokens;
  const parts = path.split(".");

  let current = tokens;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return { value: path, resolved: false };
    }
  }

  if (typeof current === "string") {
    return { value: current, resolved: true };
  }

  return { value: path, resolved: false };
};

export const extractTailwindClassesFromPandaCssWithContext = (
  cssObj: StyleObject,
  pandaContext?: PandaContext,
  tailwindConfig?: Config,
  inlineTextStyles?: boolean,
): string[] => {
  const classes: string[] = [];

  // If no config provided, create a default one
  // This will have all the standard Tailwind theme tokens
  let effectiveConfig: Config | undefined = tailwindConfig;
  if (!effectiveConfig) {
    try {
      const { config } = createTailwindContext({} as Config);
      effectiveConfig = config as any;
    } catch (e) {
      effectiveConfig = {} as Config;
    }
  }

  const flattenTokensForMatching = (tokens: Record<string, any>, prefix = ""): Record<string, string> => {
    const flattened: Record<string, string> = {};
    for (const [key, value] of Object.entries(tokens)) {
      const tokenName = prefix ? `${prefix}-${key}` : key;
      if (typeof value === "string") {
        flattened[tokenName] = value;
      } else if (typeof value === "object" && value !== null) {
        Object.assign(flattened, flattenTokensForMatching(value, tokenName));
      }
    }
    return flattened;
  };

  // Only build tokens from known categories that are meaningful for conversion
  const tailwindTokens: Record<string, string> = {};
  const tokenCategories = [
    "colors",
    "spacing",
    "sizing",
    "fontSizes",
    "fontWeights",
    "lineHeights",
    "letterSpacing",
    "radii",
    "borderWidths",
    "shadows",
  ];

  if (effectiveConfig?.theme) {
    for (const category of tokenCategories) {
      const values = effectiveConfig.theme[category];
      if (typeof values === "object" && values !== null) {
        Object.assign(tailwindTokens, flattenTokensForMatching(values as Record<string, any>));
      }
    }
  }

  const findMatchingTailwindToken = (value: string): string | null => {
    const normalizedValue = value.toLowerCase();
    for (const [tokenName, tokenValue] of Object.entries(tailwindTokens)) {
      if (String(tokenValue).toLowerCase() === normalizedValue) {
        return tokenName;
      }
    }
    return null;
  };

  // Helper to resolve Panda token values to Tailwind-compatible format
  // This uses the Panda context's token dictionary for more robust resolution
  const resolveToken = (prop: string, path: string): string => {
    // Handle arbitrary tokens in square brackets (e.g., "[123px]")
    if (path.startsWith("[") && path.endsWith("]")) {
      return path; // Return as-is, already in Tailwind arbitrary value format
    }
    if (!pandaContext) return pandaTokenToTwSuffix(path);

    const category = tokenCategoryMap[prop];
    let resolvedResult = { value: path, resolved: false };

    if (category) {
      // First try with the category prefix: colors.blue.600
      resolvedResult = resolvePandaToken(`${category}.${path}`, pandaContext);
    }

    // If not found with category, try direct path resolution
    if (!resolvedResult.resolved) {
      resolvedResult = resolvePandaToken(path, pandaContext);
    }

    if (resolvedResult.resolved) {
      // Check if this resolved value matches a default Tailwind token
      const matchingToken = findMatchingTailwindToken(resolvedResult.value);
      if (matchingToken) {
        return matchingToken;
      }
      // Use arbitrary value syntax [value] with spaces replaced by underscores
      const escapedValue = String(resolvedResult.value).replace(/\s+/g, "_");
      return `[${escapedValue}]`;
    }

    // Fallback to original token path
    return pandaTokenToTwSuffix(path);
  };

  const findTokenByValue = (prop: string, value: string): string | null => {
    if (!pandaContext) return null;

    const tokens = pandaContext.config?.theme?.tokens || {};
    const category = tokenCategoryMap[prop];
    if (!category) return null;

    const categoryTokens = resolveDottedPath(category, tokens);
    if (!categoryTokens) return null;

    for (const [tokenName, tokenValue] of Object.entries(categoryTokens)) {
      if (String(tokenValue) === String(value)) {
        return tokenName;
      }
      if (typeof tokenValue === "object" && tokenValue !== null) {
        for (const [nestedName, nestedValue] of Object.entries(tokenValue)) {
          if (String(nestedValue) === String(value)) {
            return `${tokenName}.${nestedName}`;
          }
        }
      }
    }

    return null;
  };

  const responsiveConditionKeys = getResponsiveConditionKeys(pandaContext);

  const traverse = createCommonTraverse(classes, responsiveConditionKeys, pandaContext, {
    inlineTextStyles: inlineTextStyles ?? false,
    findTokenByValue,
    resolveToken,
  });

  traverse(cssObj);
  return [...new Set(classes)]; // Remove duplicates
};

/**
 * Helper to resolve dotted path in an object (e.g., "colors.red.500" -> actual value)
 */
function resolveDottedPath(path: string, obj: any): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
