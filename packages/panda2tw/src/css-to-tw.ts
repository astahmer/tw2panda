/**
 * CSS property to Tailwind class mapper
 * Converts Panda CSS properties to equivalent Tailwind classes
 */

import type { StyleObject } from "./types.js";
import type { PandaContext } from "./panda-context.js";
import type { Config } from "tailwindcss";
import { createTailwindContext } from "./tw-context.js";

// Comprehensive mapping of CSS properties to Tailwind prefix patterns
const propertyMap: Record<string, { pattern: RegExp; classPrefix: string }> = {
  // Colors
  color: { pattern: /^.*$/, classPrefix: "text-" },
  backgroundColor: { pattern: /^.*$/, classPrefix: "bg-" },
  borderColor: { pattern: /^.*$/, classPrefix: "border-" },
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
  borderRadius: { pattern: /^.*$/, classPrefix: "rounded-" },
  borderTopLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-tl-" },
  borderTopRightRadius: { pattern: /^.*$/, classPrefix: "rounded-tr-" },
  borderBottomRightRadius: { pattern: /^.*$/, classPrefix: "rounded-br-" },
  borderBottomLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-bl-" },

  // Typography
  fontSize: { pattern: /^.*$/, classPrefix: "text-" },
  fontWeight: { pattern: /^.*$/, classPrefix: "font-" },
  fontStyle: { pattern: /^.*$/, classPrefix: "italic" },
  lineHeight: { pattern: /^.*$/, classPrefix: "leading-" },
  letterSpacing: { pattern: /^.*$/, classPrefix: "tracking-" },
  textAlign: { pattern: /^(left|center|right|justify)$/, classPrefix: "text-" },
  textDecoration: { pattern: /^.*$/, classPrefix: "underline" },

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
  display: { pattern: /^(flex|block|inline|grid|hidden|contents|table|table-row|table-cell|list-item)$/, classPrefix: "" },
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
  borderTopStyle: { pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/, classPrefix: "border-t-" },
  borderRightStyle: { pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/, classPrefix: "border-r-" },
  borderBottomStyle: { pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/, classPrefix: "border-b-" },
  borderLeftStyle: { pattern: /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none)$/, classPrefix: "border-l-" },
  borderCollapse: { pattern: /^(collapse|separate)$/, classPrefix: "border-" },
  borderSpacing: { pattern: /^.*$/, classPrefix: "border-spacing-" },
  // borderTopLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-tl-" },
  // borderTopRightRadius: { pattern: /^.*$/, classPrefix: "rounded-tr-" },
  // borderBottomRightRadius: { pattern: /^.*$/, classPrefix: "rounded-br-" },
  // borderBottomLeftRadius: { pattern: /^.*$/, classPrefix: "rounded-bl-" },

  // Box & Layout
  boxSizing: { pattern: /^(border-box|content-box)$/, classPrefix: "" }, // Special handling
  boxDecorationBreak: { pattern: /^(slice|clone)$/, classPrefix: "" }, // Special handling
  zIndex: { pattern: /^.*$/, classPrefix: "z-" },

  // Flexbox properties
  flexWrap: { pattern: /^(wrap|nowrap|wrap-reverse)$/, classPrefix: "flex-" },
  flexGrow: { pattern: /^.*$/, classPrefix: "grow-" },
  flexShrink: { pattern: /^.*$/, classPrefix: "shrink-" },
  flexBasis: { pattern: /^.*$/, classPrefix: "basis-" },
  alignContent: { pattern: /^.*$/, classPrefix: "content-" },
  alignSelf: { pattern: /^.*$/, classPrefix: "self-" },
  justifyItems: { pattern: /^.*$/, classPrefix: "justify-items-" },
  justifySelf: { pattern: /^.*$/, classPrefix: "justify-self-" },
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

/**
 * Convert camelCase to kebab-case for CSS properties
 */
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
  return token.replace(/\./g, "-");
};

/**
 * Map Panda CSS properties to Tailwind class names
 */
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
    const strValue = String(value);

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

/**
 * Extract Tailwind classes from a Panda CSS object
 */
export const extractTailwindClassesFromPandaCss = (cssObj: StyleObject): string[] => {
  const classes: string[] = [];

  const traverse = (obj: any, modifiers: string[] = []): void => {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      if (key.startsWith("_")) {
        // Pseudo-selector like _hover, _focus
        const modifier = key.slice(1);
        traverse(value, [...modifiers, modifier]);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Nested object (conditions like md:, dark:, etc.)
        traverse(value, [...modifiers, key]);
      } else if (typeof value === "string" || typeof value === "number") {
        // Actual style property
        let className = "";
        const strValue = String(value).toLowerCase();

        // Special handling for properties with specific value mappings
        if (key === "textDecoration") {
          if (strValue === "none") {
            className = "no-underline";
          } else if (strValue === "underline") {
            className = "underline";
          } else if (strValue === "line-through") {
            className = "line-through";
          } else if (strValue === "overline") {
            className = "overline";
          }
        } else if (key === "textDecorationLine") {
          if (strValue === "none") {
            className = "no-underline";
          } else if (strValue === "underline") {
            className = "underline";
          } else if (strValue === "line-through") {
            className = "line-through";
          } else if (strValue === "overline") {
            className = "overline";
          }
        } else if (key === "fontStyle") {
          if (strValue === "italic") {
            className = "italic";
          } else if (strValue === "normal") {
            className = "not-italic";
          } else if (strValue === "oblique") {
            className = "italic";
          }
        } else if (key === "visibility") {
          if (strValue === "hidden") {
            className = "invisible";
          } else if (strValue === "visible") {
            className = "visible";
          }
        } else if (key === "whiteSpace") {
          const mapping = propertyMap[key];
          if (mapping) {
            let suffix = strValue;
            if (strValue === "pre-wrap") suffix = "pre-wrap";
            else if (strValue === "pre-line") suffix = "pre-line";
            else if (strValue === "pre") suffix = "pre";
            else if (strValue === "nowrap") suffix = "nowrap";
            else if (strValue === "break-spaces") suffix = "break-spaces";
            else suffix = "normal";
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "wordBreak") {
          const mapping = propertyMap[key];
          if (mapping) {
            let suffix = strValue;
            if (strValue === "break-all") suffix = "all";
            else if (strValue === "keep-all") suffix = "keep";
            else if (strValue === "break-word") suffix = "word";
            else suffix = "normal";
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "wordWrap" || key === "overflowWrap") {
          if (strValue === "break-word") {
            className = "break-words";
          }
        } else if (key === "boxSizing") {
          if (strValue === "border-box") {
            className = "box-border";
          } else if (strValue === "content-box") {
            className = "box-content";
          }
        } else if (key === "display") {
          className = strValue === "none" ? "hidden" : strValue;
        } else if (key === "position") {
          const mapping = propertyMap[key];
          if (mapping && mapping.pattern.test(strValue)) {
            className = strValue;
          }
        } else if (key === "textAlign") {
          const mapping = propertyMap[key];
          if (mapping) {
            className = `text-${strValue}`;
          }
        } else if (key === "textTransform") {
          if (strValue === "uppercase") {
            className = "uppercase";
          } else if (strValue === "lowercase") {
            className = "lowercase";
          } else if (strValue === "capitalize") {
            className = "capitalize";
          }
        } else if (key === "flexWrap") {
          const mapping = propertyMap[key];
          if (mapping) {
            if (strValue === "wrap") {
              className = "flex-wrap";
            } else if (strValue === "nowrap") {
              className = "flex-nowrap";
            } else if (strValue === "wrap-reverse") {
              className = "flex-wrap-reverse";
            }
          }
        } else if (key === "overflow" || key === "overflowX" || key === "overflowY") {
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "backgroundClip") {
          if (strValue === "text") {
            className = "bg-clip-text";
          } else if (strValue === "border-box") {
            className = "bg-clip-border";
          } else if (strValue === "padding-box") {
            className = "bg-clip-padding";
          } else if (strValue === "content-box") {
            className = "bg-clip-content";
          }
        } else if (key === "borderCollapse") {
          if (strValue === "collapse") {
            className = "border-collapse";
          } else if (strValue === "separate") {
            className = "border-separate";
          }
        } else if (key === "tableLayout") {
          if (strValue === "auto") {
            className = "table-auto";
          } else if (strValue === "fixed") {
            className = "table-fixed";
          }
        } else if (key === "scrollBehavior") {
          if (strValue === "smooth") {
            className = "scroll-smooth";
          } else if (strValue === "auto") {
            className = "scroll-auto";
          }
        } else if (key === "listStylePosition") {
          if (strValue === "inside") {
            className = "list-inside";
          } else if (strValue === "outside") {
            className = "list-outside";
          }
        } else if (key === "pointerEvents") {
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "userSelect") {
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else {
          // Default handling for all other properties
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        }

        if (className) {
          if (modifiers.length > 0) {
            className = `${modifiers.join(":")}:${className}`;
          }
          classes.push(className);
        }
      }
    });
  };

  traverse(cssObj);
  return [...new Set(classes)]; // Remove duplicates
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
const resolvePandaToken = (
  path: string,
  pandaContext?: PandaContext,
): { value: string; resolved: boolean } => {
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

/**
 * Convert Panda CSS to Tailwind classes using Panda and Tailwind contexts
 * Uses actual theme tokens from both Panda and Tailwind for smart token resolution
 */
export const extractTailwindClassesFromPandaCssWithContext = (
  cssObj: StyleObject,
  pandaContext?: PandaContext,
  tailwindConfig?: Config,
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
      // Fallback: use empty config if creation fails
      effectiveConfig = {} as Config;
    }
  }

  // Build a flat map of Tailwind tokens from nested structure
  // { blue: { 600: "#2563eb", 700: "#1d4ed8" } } -> { "blue-600": "#2563eb", "blue-700": "#1d4ed8" }
  const flattenTokens = (tokens: Record<string, any>, prefix = ""): Record<string, string> => {
    const flattened: Record<string, string> = {};

    for (const [key, value] of Object.entries(tokens)) {
      const tokenName = prefix ? `${prefix}-${key}` : key;

      if (typeof value === "string") {
        flattened[tokenName] = value;
      } else if (typeof value === "object" && value !== null) {
        // Recursively flatten nested token objects
        Object.assign(flattened, flattenTokens(value, tokenName));
      }
    }

    return flattened;
  };

  // Build complete Tailwind token map from config theme
  // Only use specific token categories, not all theme keys
  const tailwindTokens: Record<string, string> = {};

  // Helper to flatten tokens without category prefix
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
        // Don't include category prefix for these tokens
        Object.assign(tailwindTokens, flattenTokensForMatching(values as Record<string, any>));
      }
    }
  }

  // Helper to check if a resolved value matches a Tailwind token
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
      // Otherwise, use arbitrary value syntax [value]
      return `[${resolvedResult.value}]`;
    }

    // Fallback to original token path
    return pandaTokenToTwSuffix(path);
  };

  // Helper to find a token by its value
  const findTokenByValue = (prop: string, value: string): string | null => {
    if (!pandaContext) return null;

    const tokens = pandaContext.config?.theme?.tokens || {};
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

    const category = tokenCategoryMap[prop];
    if (!category) return null;

    const categoryTokens = resolveDottedPath(category, tokens);
    if (!categoryTokens) return null;

    // Search for the token by value
    for (const [tokenName, tokenValue] of Object.entries(categoryTokens)) {
      if (String(tokenValue) === String(value)) {
        return tokenName;
      }
      // Also check nested tokens
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

  const traverse = (obj: any, modifiers: string[] = []): void => {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      // Handle textStyle specially - it's like a mixin
      if (key === "textStyle" && typeof value === "string" && pandaContext) {
        // Resolve textStyle from context
        const textStyles = pandaContext.config?.theme?.textStyles || {};
        const resolvedTextStyle = resolveDottedPath(value, textStyles);

        if (resolvedTextStyle && typeof resolvedTextStyle === "object") {
          // If the resolved textStyle has a 'value' property (real-world Panda format),
          // unwrap it and use that instead
          const styleObject = resolvedTextStyle.value || resolvedTextStyle;
          // Recursively process the resolved text style object
          traverse(styleObject, modifiers);
        }
        return;
      }

      if (key.startsWith("_")) {
        // Pseudo-selector like _hover, _focus, _active
        const modifier = key.slice(1);
        traverse(value, [...modifiers, modifier]);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Nested object (conditions like md:, dark:, etc.)
        traverse(value, [...modifiers, key]);
      } else if (typeof value === "string" || typeof value === "number") {
        // Actual style property with value
        let className = "";
        const strValue = String(value).toLowerCase();

        // Special handling for properties that need custom value mapping
        if (key === "textDecoration") {
          // textDecoration: values map to specific classes
          if (strValue === "none") {
            className = "no-underline";
          } else if (strValue === "underline") {
            className = "underline";
          } else if (strValue === "line-through" || strValue === "line through") {
            className = "line-through";
          } else if (strValue === "overline") {
            className = "overline";
          }
        } else if (key === "textDecorationLine") {
          // textDecorationLine: similar to textDecoration
          if (strValue === "none") {
            className = "no-underline";
          } else if (strValue === "underline") {
            className = "underline";
          } else if (strValue === "line-through") {
            className = "line-through";
          } else if (strValue === "overline") {
            className = "overline";
          }
        } else if (key === "fontStyle") {
          // fontStyle: italic, normal, oblique
          if (strValue === "italic") {
            className = "italic";
          } else if (strValue === "normal") {
            className = "not-italic";
          } else if (strValue === "oblique") {
            className = "italic"; // Tailwind uses italic for oblique
          }
        } else if (key === "visibility") {
          // visibility: visible, hidden, collapse
          if (strValue === "hidden") {
            className = "invisible";
          } else if (strValue === "visible") {
            className = "visible";
          }
        } else if (key === "pointerEvents") {
          // pointerEvents: auto, none
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "userSelect") {
          // userSelect: auto, none, text, contain, all
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "whiteSpace") {
          // whiteSpace: normal, nowrap, pre, pre-wrap, pre-line, break-spaces
          const mapping = propertyMap[key];
          if (mapping) {
            let suffix = strValue;
            if (strValue === "pre-wrap") suffix = "pre-wrap";
            else if (strValue === "pre-line") suffix = "pre-line";
            else if (strValue === "pre") suffix = "pre";
            else if (strValue === "nowrap") suffix = "nowrap";
            else if (strValue === "break-spaces") suffix = "break-spaces";
            else suffix = "normal";
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "wordBreak") {
          // wordBreak: normal, break-all, keep-all, break-word
          const mapping = propertyMap[key];
          if (mapping) {
            let suffix = strValue;
            if (strValue === "break-all") suffix = "all";
            else if (strValue === "keep-all") suffix = "keep";
            else if (strValue === "break-word") suffix = "word";
            else suffix = "normal";
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "wordWrap" || key === "overflowWrap") {
          // wordWrap/overflowWrap: normal, break-word
          if (strValue === "break-word") {
            className = "break-words";
          }
        } else if (key === "boxSizing") {
          // boxSizing: border-box, content-box
          if (strValue === "border-box") {
            className = "box-border";
          } else if (strValue === "content-box") {
            className = "box-content";
          }
        } else if (key === "display") {
          // display: handle special cases
          const mapping = propertyMap[key];
          if (mapping) {
            // Direct mapping for display values
            className = strValue === "none" ? "hidden" : strValue;
          }
        } else if (key === "position") {
          // position: static, relative, absolute, fixed, sticky
          const mapping = propertyMap[key];
          if (mapping && mapping.pattern.test(strValue)) {
            className = strValue;
          }
        } else if (key === "textAlign") {
          // textAlign: left, center, right, justify
          const mapping = propertyMap[key];
          if (mapping) {
            className = `text-${strValue}`;
          }
        } else if (key === "textTransform") {
          // textTransform: uppercase, lowercase, capitalize, none
          if (strValue === "uppercase") {
            className = "uppercase";
          } else if (strValue === "lowercase") {
            className = "lowercase";
          } else if (strValue === "capitalize") {
            className = "capitalize";
          }
        } else if (key === "flexWrap") {
          // flexWrap: wrap, nowrap, wrap-reverse
          const mapping = propertyMap[key];
          if (mapping) {
            if (strValue === "wrap") {
              className = "flex-wrap";
            } else if (strValue === "nowrap") {
              className = "flex-nowrap";
            } else if (strValue === "wrap-reverse") {
              className = "flex-wrap-reverse";
            }
          }
        } else if (key === "overflow" || key === "overflowX" || key === "overflowY") {
          // overflow properties
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else if (key === "backgroundClip") {
          // backgroundClip: border-box, padding-box, content-box, text
          if (strValue === "text") {
            className = "bg-clip-text";
          } else if (strValue === "border-box") {
            className = "bg-clip-border";
          } else if (strValue === "padding-box") {
            className = "bg-clip-padding";
          } else if (strValue === "content-box") {
            className = "bg-clip-content";
          }
        } else if (key === "borderCollapse") {
          // borderCollapse: collapse, separate
          if (strValue === "collapse") {
            className = "border-collapse";
          } else if (strValue === "separate") {
            className = "border-separate";
          }
        } else if (key === "tableLayout") {
          // tableLayout: auto, fixed
          if (strValue === "auto") {
            className = "table-auto";
          } else if (strValue === "fixed") {
            className = "table-fixed";
          }
        } else if (key === "scrollBehavior") {
          // scrollBehavior: auto, smooth
          if (strValue === "smooth") {
            className = "scroll-smooth";
          } else if (strValue === "auto") {
            className = "scroll-auto";
          }
        } else if (key === "listStylePosition") {
          // listStylePosition: inside, outside
          if (strValue === "inside") {
            className = "list-inside";
          } else if (strValue === "outside") {
            className = "list-outside";
          }
        } else if (key === "cursor") {
          // cursor values
          const mapping = propertyMap[key];
          if (mapping) {
            const suffix = pandaTokenToTwSuffix(strValue);
            className = `${mapping.classPrefix}${suffix}`;
          }
        } else {
          // Default handling for all other properties
          const mapping = propertyMap[key];
          if (mapping) {
            // First try to find this value as a token in the context
            let suffix: string;
            const tokenPath = findTokenByValue(key, String(value));

            if (tokenPath) {
              // Found a matching token, use the token name
              suffix = pandaTokenToTwSuffix(tokenPath);
            } else {
              // Fallback to resolveToken for standard resolution
              suffix = resolveToken(key, String(value));
            }

            className = suffix ? `${mapping.classPrefix}${suffix}` : mapping.classPrefix;
          }
        }

        if (className) {
          if (modifiers.length > 0) {
            className = `${modifiers.join(":")}:${className}`;
          }
          classes.push(className);
        }
      }
    });
  };

  traverse(cssObj);
  return [...new Set(classes)]; // Remove duplicates
};

/**
 * Helper to resolve dotted path in an object (e.g., "colors.red.500" -> actual value)
 */
function resolveDottedPath(path: string, obj: any): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
