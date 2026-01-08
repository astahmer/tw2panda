import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import { stack } from "./layout.styles";

/**
 * Exposed component props - only these can be passed as JSX attributes
 * Other CSS properties should be converted to className
 */
export type ExposedComponentProps<T extends keyof JSX.IntrinsicElements = "div"> = Omit<
  JSX.IntrinsicElements[T],
  "ref" | "key"
>;

/**
 * Stack/HStack exposed variants from CVA definition
 * Used to determine which JSX props can be safely kept as attributes
 */
export type StackVariants = VariantProps<typeof stack>;

/**
 * Mapping of exposed variant properties to their accepted values
 * This is used by the --with-jsx-stack flag to determine which props/values
 * should remain as JSX attributes vs being converted to Tailwind classes
 *
 * These values are extracted from layout.styles.ts CVA definition
 */
export const STACK_EXPOSED_VARIANTS = {
  direction: ["row", "col"] as const,
  align: ["center", "start", "end", "selfStart", "selfCenter", "selfEnd"] as const,
  justifyContent: ["center", "start", "end", "between", "around"] as const,
  wrap: [true] as const,
  w: ["full"] as const,
  h: ["full"] as const,
  gap: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const,
} as const;

/**
 * Helper to check if a prop is an exposed variant
 */
export const isExposedVariant = (propName: string): propName is keyof typeof STACK_EXPOSED_VARIANTS => {
  return propName in STACK_EXPOSED_VARIANTS;
};

/**
 * Helper to check if a variant value is exposed
 */
export const isExposedVariantValue = (variantName: string, value: string | number | boolean): boolean => {
  if (!isExposedVariant(variantName)) return false;
  const exposedValues = STACK_EXPOSED_VARIANTS[variantName] as readonly (string | number | boolean)[];
  return exposedValues.includes(value);
};

