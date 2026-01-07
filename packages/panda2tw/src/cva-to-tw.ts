/**
 * Convert Panda CVA (Class Variance Authority) to Tailwind classes
 */

import { extractTailwindClassesFromPandaCss } from "./css-to-tw";
import type { PandaCvaConfig, StyleObject } from "./types";

export interface CvaVariantMapping {
  variantName: string;
  values: Record<string, string[]>; // variant value -> list of Tailwind classes
}

/**
 * Convert a Panda CVA config object back to pattern with Tailwind classes
 */
export const pandaCvaToTailwind = (cvaConfig: PandaCvaConfig): string => {
  const lines: string[] = [];

  // Handle base styles
  if (cvaConfig.base) {
    const baseClasses = extractTailwindClassesFromPandaCss(cvaConfig.base);
    if (baseClasses.length > 0) {
      lines.push(`// Base classes: ${baseClasses.join(" ")}`);
    }
  }

  // Handle variants
  if (cvaConfig.variants) {
    const variantLines: string[] = [];
    Object.entries(cvaConfig.variants).forEach(([variantName, variantValues]) => {
      variantLines.push(`\n// ${variantName} variant:`);

      Object.entries(variantValues).forEach(([valueName, styles]) => {
        const classes = extractTailwindClassesFromPandaCss(styles);
        variantLines.push(`//   ${valueName}: ${classes.join(" ")}`);
      });
    });
    lines.push(...variantLines);
  }

  return lines.join("\n");
};

/**
 * Extract Tailwind classes from nested CSS object with conditions
 */
export const extractClassesFromNestedStyles = (
  obj: StyleObject,
  prefix: string = "",
): string[] => {
  const classes: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
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
