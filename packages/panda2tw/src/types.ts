/**
 * Types for panda-to-tw transformation
 */

export type StyleObject = Record<string, any>;

export type PandaCssProperty = {
  propName: string;
  value: string | number | boolean;
  selector?: string; // For pseudo-selectors like _hover, _focus, etc.
  conditions?: string[]; // For responsive conditions like md:, lg:, etc.
};

export type PandaCvaVariant = {
  name: string;
  value: string;
  styles: StyleObject;
};

export type PandaCvaConfig = {
  base?: StyleObject;
  variants?: Record<string, Record<string, StyleObject>>;
  defaultVariants?: Record<string, string>;
};

export type TailwindClass = {
  className: string;
  modifiers: string[]; // responsive, hover, focus, etc.
};

export type RewriteOptions = {
  includeComments?: boolean;
  generateComments?: boolean;
  inlineTextStyles?: boolean;
};
