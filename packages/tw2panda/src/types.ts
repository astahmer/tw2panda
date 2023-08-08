import { TemplateHead } from "ts-morph";
import { StringLike } from "./find-tw-class-candidates";

export type StyleObject = Record<string, any>;

export type TwResultItem = {
  classList: Set<string>;
  styles: StyleObject;
  node: StringLike | TemplateHead;
};

export interface TailwindClass {
  className: string;
  variant: string;
  modifiers: string[];
  utility?: string;
  value?: string | undefined;
  permutations?: string[][];
  isImportant?: boolean;
  kind?: string;
  css: string;
}

export type MatchingToken = {
  propName: string;
  tokenName: string;
  classInfo: TailwindClass;
};

export type RewriteOptions = { shorthands?: boolean | undefined; range?: { start: number; end: number } };
