/**
 * Tailwind configuration and context
 */

import type { Config } from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig";

export const getTailwindConfig = (config?: Config) => {
  return resolveConfig(config || {});
};

/**
 * Build a reverse lookup map from CSS property:value pairs to Tailwind classes
 * This maps things like { color: "red" } -> "text-red-500"
 */
export const buildTailwindClassMap = (config: Config) => {
  const classMap = new Map<string, string>();

  // This is a simplified version - in reality we'd need to traverse the actual theme config
  // and Tailwind's utility generation to build this map accurately.
  // For now we'll rely on parsing Tailwind's generated classes.

  return classMap;
};

/**
 * Get theme value with dot notation support
 * e.g., "red.500" from theme -> actual color value
 */
export const getThemeValue = (path: string, theme: any): any => {
  return path.split(".").reduce((obj, key) => obj?.[key], theme);
};

/**
 * Normalize Tailwind class name for comparison
 */
export const normalizeTwClass = (className: string): string => {
  return className.toLowerCase().trim();
};
