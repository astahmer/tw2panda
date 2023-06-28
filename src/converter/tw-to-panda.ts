import { createMergeCss } from "@pandacss/shared";

import type * as P from "postcss";
import { kebabToCamel } from "pastable";

import { resolveMatches, createTailwindContext } from "./tw-context";
import { PandaContext, createPandaContext } from "./panda-context";
import { initialInputList } from "../components/Playground/Playground.constants";
import { parseClassName } from "./tw-parser";
import { TailwindContext } from "./tw-types";
import { walkObject } from "@pandacss/shared";

type StyleObject = Record<string, any>;

export function twToPanda(classListString: string, useShorthands?: boolean) {
  const classList = new Set(classListString.split(" "));

  const tw = createTailwindContext(initialInputList["theme.ts"]);
  const tailwind = tw.context;

  const panda = createPandaContext();
  const { mergeCss } = createMergeCss({
    utility: panda.utility,
    conditions: panda.conditions,
    hash: false,
  });

  const styles = twClassListToPandaStyleObjects(classList, tailwind, panda);
  const merged = mergeCss(...styles);
  return useShorthands ? preferShorthands(merged, panda) : merged;
}

export function twClassListToPandaStyleObjects(
  classList: Set<string>,
  tailwind: TailwindContext,
  panda: PandaContext
) {
  const styles = [] as StyleObject[];

  classList.forEach((className) => {
    const classInfo = parseClassName(className);
    if (!classInfo) return;

    const maybeValue = classInfo.value;
    if (!maybeValue) return;

    const matches = Array.from(resolveMatches(className, tailwind));

    matches.forEach((match) => {
      const [_infos, rule] = match;
      const propNameList = findActualPropertyNames(rule).map(kebabToCamel);
      propNameList.forEach((propName) => {
        const prop = panda.config.utilities?.[propName];
        const propValues = prop && panda.utility["getPropertyValues"](prop);

        const value =
          !propValues || propValues[maybeValue]
            ? maybeValue
            : findMatchingValue(classInfo.permutations ?? [], propValues) ||
              maybeValue;

        if (!value) return;

        // bg-red-500 => red.500
        const tokenName = value.replace("-", ".");

        // dark:text-sky-400=-> { dark: { color: "sky.400" } }
        const nested = classInfo.modifiers?.reduce(
          (acc, modifier) => {
            const prefixed = "_" + modifier;
            const condition = panda.conditions.values[prefixed];

            const conditionValue = condition ? prefixed : modifier;

            return { [conditionValue]: acc } as any;
          },
          { [propName]: tokenName }
        );
        styles.push(nested);
      });
    });
  });

  return styles;
}

const findActualPropertyNames = (root: P.Rule | P.AtRule | P.Declaration) => {
  let rules = [root];
  let rule: P.Rule | P.AtRule | P.Declaration | undefined;

  const propNameList = [];

  while (rules.length > 0) {
    rule = rules.shift()!;

    if (rule.type === "decl") {
      if (rule.prop.startsWith("--")) continue;
      propNameList.push(rule.prop);
      continue;
    }

    if (rule.type === "atrule") {
      rules.unshift(...(rule.nodes as any));
      continue;
    }

    if (rule.type === "rule") {
      rules.unshift(...(rule.nodes as any));
      continue;
    }
  }

  return propNameList;
};

const findMatchingValue = (
  permutations: string[][],
  propValues: Record<string, string>
) => {
  return permutations.reduce((acc, parts) => {
    const matchingPart = parts.find((p) => propValues[p]);
    return matchingPart ? matchingPart : acc;
  }, "");
};

export const preferShorthands = (
  styles: StyleObject,
  context: PandaContext
) => {
  const utilities = context.config.utilities ?? {};

  return walkObject(styles, (v) => v, {
    getKey: (prop) => {
      const shorthand = utilities[prop]?.shorthand;
      return typeof shorthand === "string" ? shorthand : prop;
    },
  });
};
