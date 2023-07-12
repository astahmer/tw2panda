import { StringLiteral } from "ts-morph";

export type StyleObject = Record<string, any>;

export type TwResultItem = {
  classList: Set<string>;
  styles: StyleObject;
  node: StringLiteral;
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
