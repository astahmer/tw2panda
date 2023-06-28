import { createLogger } from "@box-extractor/logger";
import { candidatePermutations } from "./tw-candidate-permutations";

const logger = createLogger("reversewind");
const fromExternalState = ["group", "peer"];

// Taken from
// https://tailwindcss.com/docs/hover-focus-and-other-states#quick-reference
// https://github.com/arlyon/stailwc/blob/master/crates/tailwind-parse/src/expression.rs#L121
// modifier map
const MODIFIERS = [
  "hover",
  "focus",
  "focus-within",
  "focus-visible",
  "active",
  "visited",
  "target",
  "first",
  "last",
  "only",
  "odd",
  "even",
  "first-of-type",
  "last-of-type",
  "only-of-type",
  "empty",
  "disabled",
  "enabled",
  "checked",
  "indeterminate",
  "default",
  "required",
  "valid",
  "invalid",
  "in-range",
  "out-of-range",
  "placeholder-shown",
  "autofill",
  "read-only",
  "before",
  "after",
  "first-letter",
  "first-line",
  "marker",
  "selection",
  "file",
  "backdrop",
  "placeholder",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "max-sm",
  "max-md",
  "max-lg",
  "max-xl",
  "max-2xl",
  "dark",
  "portrait",
  "landscape",
  "motion-safe",
  "motion-reduce",
  "contrast-more",
  "contrast-less",
  "print",
  "aria-checked",
  "aria-disabled",
  "aria-expanded",
  "aria-hidden",
  "aria-pressed",
  "aria-readonly",
  "aria-required",
  "aria-selected",
  "rtl",
  "ltr",
  "open",
];

export const parseClassName = (className: string) => {
  logger.scoped("parser", { className });

  const modifiers: string[] = [];
  let index = 0;
  let current = "";
  let char;
  let arbitraryStart;
  let kind;
  let utility;
  let value;
  let variantStart = 0;
  let isDataAttribute = false;
  let external;

  while (index < className.length) {
    char = className[index];
    if (char === "[") {
      logger.scoped("parser", { start: true, index, current });
      if (index === 0) {
        variantStart = index + 1;
      }

      if (current === "data-") {
        isDataAttribute = true;
      }

      if (className[index - 1] === "-") {
        logger.scoped("parser", {
          openingBracket: true,
          prevDash: true,
          isDataAttribute,
          current,
          index,
        });
        utility = current.slice(0, -1);
      }

      if (className[index - 1] === ":") {
        logger.scoped("parser", {
          openingBracket: true,
          prevColon: true,
          current,
          index,
          utility,
          nextutility: current.slice(0, -1),
        });
        utility = current.slice(0, -1);
      }

      arbitraryStart = index;
      current = "";
      index++;
      continue;
    }

    if (char === "]") {
      logger.scoped("parser", {
        closingBracket: true,
        current,
        index,
        length: className.length,
        next: className[index + 1],
        isDone: index === className.length - 1,
        external,
        utility,
      });

      // reached the end = arbitrary value
      if (index === className.length - 1) {
        kind = "arbitrary-value";
        logger.scoped("parser", {
          kind,
          utility,
          value,
          arbitraryStart,
          current,
          nextvalue: current.slice((utility ?? "").length + 1),
        });
        if (utility && arbitraryStart !== undefined) {
          value = current.includes(":")
            ? current.slice(utility.length + 1)
            : current;
        }

        break;
      }

      // still got shit to do = arbitrary modifier
      logger.scoped("parser", {
        arbitraryModifier: true,
        current,
        utility,
        external,
        variant: className.slice(index),
      });
      if (isDataAttribute) {
        modifiers.push(`data-[${current}]`);
        isDataAttribute = false;
      } else if (utility === "min" || utility === "max") {
        modifiers.push(`${utility}-[${current}]`);
      } else if (fromExternalState.includes(utility as string)) {
        logger.scoped("parser", {
          current,
          prev: className[index - 1],
        });
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
      logger.scoped("parser", {
        colon: true,
        index,
        current,
        variant: className.slice(variantStart),
        utility,
        value,
        arbitraryStart,
        has: MODIFIERS.includes(current),
      });

      if (!current) {
        logger.scoped("parser", {
          empty: true,
          current,
          variant: className.slice(index),
        });
        if (className[index - 1] === "[") {
          current = ":";
        }

        index++;
        variantStart = index;
        continue;
      }

      if (arbitraryStart !== undefined) {
        logger.scoped("parser", { non: true, current });
        utility = current;
        current += char;
        index++;
        continue;
      }

      if (MODIFIERS.includes(current)) {
        modifiers.push(current);
        current = "";
        index++;
        variantStart = index;
        continue;
      } else if (external) {
        // const isNamedGroup = className[index + 1] === "/";
        const isNamedGroup = current.includes("/");
        const modifierName = isNamedGroup
          ? // TODO peer
            current.slice("group-".length).split("/")[0]
          : current.slice("group-".length);
        // logger.scoped("parser", {
        //   current,
        //   char,
        //   isGroup: isParentState,
        //   isNamedGroup,
        //   modifierName,
        // });

        if (MODIFIERS.includes(modifierName)) {
          modifiers.push(current);
          current = "";
          index++;
          variantStart = index;
          external = false;
          continue;
        }
      }
    }

    if (char === "-" && fromExternalState.includes(current)) {
      external = current;
    }

    current += char;
    index++;
  }

  logger.scoped("parser", {
    end: true,
    current,
    utility,
    value,
    variant: variantStart !== undefined ? className.slice(variantStart) : "",
    modifiers,
    char,
  });
  if (current) {
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
    if (char === "!") {
      item.isImportant = true;
    }
    if (kind) {
      item.kind = kind;
    }
    return getTailwindClass(item);
  } else {
    logger.scoped("parser", { todotodotodotodo: true, current: "empty" });
  }
};

const getTailwindClass = (
  item: Omit<TailwindClass, "utility" | "value"> &
    Pick<Partial<TailwindClass>, "utility" | "value">
) => {
  if (item.utility && item.value) {
    return item as TailwindClass;
  }

  if (item.variant.includes("-")) {
    const parts = item.variant.split("-");
    (item as TailwindClass).utility = parts[0];
    (item as TailwindClass).value = parseArbitraryValue(
      item.variant.slice(parts[0].length + 1)
    );
    (item as TailwindClass).permutations = candidatePermutations(item.variant);
  }

  return item as TailwindClass;
};

const parseArbitraryValue = (value: string) => {
  if (value[0] === "[" && value[value.length - 1] === "]") {
    return value.slice(1, -1);
  }

  return value;
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
