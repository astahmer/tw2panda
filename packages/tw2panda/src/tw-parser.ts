import {
  TW_CANDIDATE_RULE_LIST,
  TW_MODIFIERS_LIST,
} from "./tw-default-constants";
import { TailwindClass } from "./types";

export const parseTwClassName = (
  className: string,
  options?: { allowedModifiers: string[]; allowedCandidates: string[] }
) => {
  const {
    allowedModifiers = TW_MODIFIERS_LIST,
    allowedCandidates = TW_CANDIDATE_RULE_LIST,
  } = options ?? {};

  const modifiers: string[] = [];
  let index = 0;
  let current = "";
  let char;
  let arbitraryStart;
  let kind;
  let utility;
  let value;
  let valueStart;
  let variantStart = 0;

  while (index < className.length) {
    char = className[index];

    // start of arbitrary value|modifier
    if (char === "[") {
      if (index === 0) {
        variantStart = index + 1;
      }

      if (className[index - 1] === "-") {
        utility = current.slice(0, -1);
      }

      arbitraryStart = index;
      current = "";
      index++;
      continue;
    }

    // end of arbitrary value|modifier
    if (char === "]") {
      // ending with closing bracket = arbitrary value
      if (index === className.length - 1) {
        kind = "arbitrary-value";
        if (utility && arbitraryStart !== undefined) {
          // 'mask-type:luminance' => value = 'luminance', utility = 'mask-type'
          // '--scroll-offset:44px' => value = '44px', utility = '--scroll-offset'
          // '1fr_500px_2fr' => value = '1fr_500px_2fr'
          value = current.includes(":")
            ? current.slice(utility.length + 1)
            : current;
        }

        break;
      }

      // meaning this is an arbitrary modifier
      if (utility && className[index] === "]") {
        modifiers.push(`${utility}-[${current}]`);
      } else {
        modifiers.push(current);
      }

      current = "";
      index++;
      variantStart = index;
      arbitraryStart = undefined;
      utility = undefined;
      continue;
    }

    if (char === ":") {
      if (!current) {
        // "group-[:nth-of-type(3)_&]"
        if (className[index - 1] === "[") {
          // put back the `:` from :nth-of-type(3)
          current = ":";
        }

        index++;
        variantStart = index;
        continue;
      }

      if (arbitraryStart !== undefined) {
        utility = current;
        current += char;
        index++;
        continue;
      }

      let isAllowed = allowedModifiers.includes(current);
      if (!isAllowed && current.includes("/")) {
        isAllowed = allowedModifiers.includes(current.split("/")[0]!);
      }

      if (isAllowed) {
        modifiers.push(current);
        current = "";
        index++;
        variantStart = index;
        continue;
      }

      index++;
      continue;
    }

    // when reaching the end -> utility=value, e.g. "flex" or "underline"
    if (
      className[index + 1] == undefined &&
      allowedCandidates.includes(current)
    ) {
      current += char;
      utility = current;
      value = current;
      continue;
    }

    // when utility contains a dash, e.g. "translate-x-0.5"
    if (
      !utility &&
      current &&
      char === "-" &&
      allowedCandidates.includes(current)
    ) {
      utility = current;
      current = "";
      index++;

      if (char === "-") {
        valueStart = index;
      }
    }

    current += char;
    index++;
  }

  if (!current) {
    // does that ever happen?
    return;
  }

  const item = {
    className,
    variant: className.slice(
      variantStart,
      className[0] === "[" && char === "]" ? -1 : undefined
    ),
    modifiers,
    utility,
    value,
  } as TailwindClass;

  // "flex!": important
  if (char === "!") {
    item.isImportant = true;
  }

  // "top-[117px]" -> kind = "arbitrary-value"
  if (kind) {
    item.kind = kind;
  }

  // "top-[117px]" -> value = "117px", utility = "top"
  // "pl-3.5" -> value = "3.5", utility = "pl"
  if (valueStart !== undefined) {
    item.value = parseArbitraryValue(className.slice(valueStart));
  } else if (!item.utility && current) {
    // "md:max-lg:flex" -> utility = "flex"
    item.utility = current;
    item.value = current;
  }

  return item;
};

const parseArbitraryValue = (value: string) => {
  if (value[0] === "[" && value[value.length - 1] === "]") {
    return value.slice(1, -1);
  }

  return value;
};
