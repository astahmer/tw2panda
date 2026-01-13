/**
 * Convert Panda CVA (Class Variance Authority) to Tailwind classes
 */

import { extractTailwindClassesFromPandaCss } from "./css-to-tw.js";
import type { PandaCvaConfig, StyleObject } from "./types.js";

export interface CvaVariantMapping {
  variantName: string;
  values: Record<string, string[]>; // variant value -> list of Tailwind classes
}

/**
 * Convert a Panda CVA config object back to pattern with Tailwind classes
 */
export const pandaCvaToTailwind = (cvaConfig: PandaCvaConfig): string => {
  const baseClasses = cvaConfig.base ? extractTailwindClassesFromPandaCss(cvaConfig.base) : [];
  const variants: Record<string, Record<string, string[]>> = {};

  // Handle variants
  if (cvaConfig.variants) {
    Object.entries(cvaConfig.variants).forEach(([variantName, variantValues]) => {
      variants[variantName] = {};

      Object.entries(variantValues).forEach(([valueName, styles]) => {
        const classes = extractTailwindClassesFromPandaCss(styles);
        variants[variantName][valueName] = classes;
      });
    });
  }

  // Format as CVA-style configuration
  const output: Record<string, any> = {};

  if (baseClasses.length > 0) {
    output.base = baseClasses.join(" ");
  }

  if (Object.keys(variants).length > 0) {
    output.variants = variants;
  }

  return JSON.stringify(output, null, 2);
};

/**
 * Extract Tailwind classes from nested CSS object with conditions
 */
export const extractClassesFromNestedStyles = (obj: StyleObject, prefix: string = ""): string[] => {
  const classes: string[] = [];

  Object.entries(obj).forEach(([key, value]: [string, any]) => {
    // Handle CSS selectors (keys starting with &) - use them as prefixes
    if (key.startsWith("&")) {
      // Convert the selector to Tailwind format with spaces replaced by underscores
      const selectorPrefix = key.replace(/\s+/g, "_");
      // Wrap in brackets for arbitrary selector syntax
      const prefixedModifier = prefix ? `${prefix}:[${selectorPrefix}]` : `[${selectorPrefix}]`;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        classes.push(...extractClassesFromNestedStyles(value, prefixedModifier));
      }
      return;
    }

    // Handle responsive/conditional styles (md:, dark:, etc.)
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nestedPrefix = prefix ? `${prefix}:${key}` : key;
      classes.push(...extractClassesFromNestedStyles(value, nestedPrefix));
    } else {
      // Direct style property
      const classes2 = extractTailwindClassesFromPandaCss({ [key]: value });
      if (prefix) {
        classes.push(...classes2.map((c) => `${prefix}:${c}`));
      } else {
        classes.push(...classes2);
      }
    }
  });

  return classes;
};
