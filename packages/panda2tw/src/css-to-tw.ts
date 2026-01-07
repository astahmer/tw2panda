/**
 * CSS property to Tailwind class mapper
 * Converts Panda CSS properties to equivalent Tailwind classes
 */

import type { StyleObject } from "./types.js";
import type { PandaContext } from "@pandacss/node";

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
 * Convert Panda CSS to Tailwind classes using the Panda context for smart token resolution
 * This uses the actual Panda theme tokens to generate accurate Tailwind equivalents
 */
export const extractTailwindClassesFromPandaCssWithContext = (
  cssObj: StyleObject,
  pandaContext?: PandaContext,
): string[] => {
  const classes: string[] = [];

  // Default Tailwind color palette (common colors)
  const defaultTailwindColors: Record<string, string> = {
    "blue-600": "#2563eb",
    "blue-700": "#1d4ed8",
    "red-500": "#ef4444",
    "red-700": "#b91c1c",
    "gray-100": "#f3f4f6",
    "gray-200": "#e5e7eb",
    "gray-300": "#d1d5db",
    "gray-400": "#9ca3af",
    "gray-500": "#6b7280",
    "gray-600": "#4b5563",
    "gray-700": "#374151",
    "gray-800": "#1f2937",
    "gray-900": "#111827",
    white: "#ffffff",
    black: "#000000",
  };

  // Helper to check if a resolved value matches a default Tailwind token
  const findMatchingTailwindToken = (value: string): string | null => {
    const normalizedValue = value.toLowerCase();
    for (const [tokenName, tokenValue] of Object.entries(defaultTailwindColors)) {
      if (tokenValue.toLowerCase() === normalizedValue) {
        return tokenName;
      }
    }
    return null;
  };

  // Helper to resolve Panda token values to Tailwind-compatible format
  const resolveToken = (prop: string, path: string): string => {
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
