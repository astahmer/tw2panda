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
  // Display properties
  display: { pattern: /^(flex|block|inline|grid|hidden|contents)$/, classPrefix: "" },

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
  margin: { pattern: /^.*$/, classPrefix: "m-" },
  marginTop: { pattern: /^.*$/, classPrefix: "mt-" },
  marginRight: { pattern: /^.*$/, classPrefix: "mr-" },
  marginBottom: { pattern: /^.*$/, classPrefix: "mb-" },
  marginLeft: { pattern: /^.*$/, classPrefix: "ml-" },

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
export const pandaCssToTailwindClasses = (
  cssObj: StyleObject,
  modifiers: string[] = [],
): string[] => {
  const classes: string[] = [];

  const processProperty = (
    prop: string,
    value: any,
    currentModifiers: string[] = [],
  ): void => {
    // Skip special properties
    if (prop.startsWith("_") || Array.isArray(value) || typeof value !== "string" && typeof value !== "number") {
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
      const fullClass = currentModifiers.length > 0
        ? `${currentModifiers.join(":")}:${className}`
        : className;
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
export const extractTailwindClassesFromPandaCss = (
  cssObj: StyleObject,
): string[] => {
  const classes: string[] = [];

  const traverse = (obj: any, modifiers: string[] = []): void => {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      if (key.startsWith("_")) {
        // Pseudo-selector like _hover, _focus
        const modifier = key.slice(1);
        traverse(value, [...modifiers, modifier]);
      } else if (typeof value === "object") {
        // Nested object (conditions like md:, dark:, etc.)
        traverse(value, [...modifiers, key]);
      } else {
        // Actual style property
        const mapping = propertyMap[key];
        if (mapping) {
          const suffix = pandaTokenToTwSuffix(String(value));
          let className = `${mapping.classPrefix}${suffix}`;

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
  const flattenTokens = (
    tokens: Record<string, any>,
    prefix = "",
  ): Record<string, string> => {
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
  const flattenTokensForMatching = (
    tokens: Record<string, any>,
    prefix = "",
  ): Record<string, string> => {
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
  const tokenCategories = ["colors", "spacing", "sizing", "fontSizes", "fontWeights", "lineHeights", "letterSpacing", "radii", "borderWidths", "shadows"];

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
  const resolveToken = (prop: string, path: string): string => {
    // Handle arbitrary tokens in square brackets (e.g., "[123px]")
    if (path.startsWith("[") && path.endsWith("]")) {
      return path; // Return as-is, already in Tailwind arbitrary value format
    }

    if (!pandaContext) return pandaTokenToTwSuffix(path);

    // Try to resolve from Panda theme tokens
    const tokens = pandaContext.config?.theme?.tokens || {};

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

    const category = tokenCategoryMap[prop];
    let resolved;

    if (category) {
      // First try with the category: colors.blue.600
      resolved = resolveDottedPath(`${category}.${path}`, tokens);
    }

    // If not found with category, try direct path
    if (!resolved) {
      resolved = resolveDottedPath(path, tokens);
    }

    if (resolved && typeof resolved === "string") {
      // Check if this resolved value matches a default Tailwind token
      const matchingToken = findMatchingTailwindToken(resolved);
      if (matchingToken) {
        return matchingToken;
      }
      // Otherwise, use arbitrary value syntax [value]
      return `[${resolved}]`;
    }

    // Fallback to original token path
    return pandaTokenToTwSuffix(path);
  };

  const traverse = (obj: any, modifiers: string[] = []): void => {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      if (key.startsWith("_")) {
        // Pseudo-selector like _hover, _focus, _active
        const modifier = key.slice(1);
        traverse(value, [...modifiers, modifier]);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Nested object (conditions like md:, dark:, etc.)
        traverse(value, [...modifiers, key]);
      } else if (typeof value === "string" || typeof value === "number") {
        // Actual style property with value
        const mapping = propertyMap[key];
        if (mapping) {
          const suffix = resolveToken(key, String(value));
          let className = suffix ? `${mapping.classPrefix}${suffix}` : mapping.classPrefix;

          if (modifiers.length > 0) {
            className = `${modifiers.join(":")}:${className}`;
          }

          if (className) {
            classes.push(className);
          }
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
