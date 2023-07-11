import { StringLiteral } from "ts-morph";
import { parseClassName } from "./tw-parser";

export type StyleObject = Record<string, any>;

export type TwResultItem = {
  classList: Set<string>;
  styles: StyleObject;
  node: StringLiteral;
};

export type MatchingToken = {
  propName: string;
  tokenName: string;
  classInfo: NonNullable<ReturnType<typeof parseClassName>>;
};
