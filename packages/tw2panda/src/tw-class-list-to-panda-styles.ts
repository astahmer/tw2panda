import { PandaContext } from "./panda-context";
import { resolveMatches } from "./tw-context";
import { parseTwClassName } from "./tw-parser";
import { TailwindContext } from "./tw-types";
import { MatchingToken, StyleObject } from "./types";
import { findRuleProps } from "./postcss-find-rule-props";

const kebabToCamel = (str: string) => str.replace(/(-\w)/g, (group) => (group[1] ?? "").toUpperCase());

/**
 * Takes a list of Tailwind class names and convert them to a list of Panda style objects
 */
export const twClassListToPandaStyles = (classList: Set<string>, tailwind: TailwindContext, panda: PandaContext) => {
  const styles = [] as Array<{ match: MatchingToken; styles: StyleObject }>;

  classList.forEach((className) => {
    const tokens = getMatchingTwCandidates(className, tailwind, panda);

    tokens.forEach((match) => {
      const { propName, tokenName, classInfo } = match;
      // dark:text-sky-400=-> { dark: { color: "sky.400" } }
      const nested = classInfo.modifiers?.reduce(
        (acc, modifier) => {
          const prefixed = "_" + kebabToCamel(modifier);
          const condition = panda.conditions.values[prefixed];

          const conditionValue = condition ? prefixed : modifier;

          return { [conditionValue]: acc } as any;
        },
        { [propName]: tokenName },
      );
      styles.push({ match, styles: nested });
    });
  });

  return styles;
};

function getMatchingTwCandidates(className: string, tailwind: TailwindContext, panda: PandaContext) {
  const tokens = [] as MatchingToken[];
  const classInfo = parseTwClassName(className);
  if (!classInfo) return tokens;

  if (!classInfo.value && !classInfo.permutations) {
    return tokens;
  }

  const matches = Array.from(resolveMatches(className, tailwind));
  matches.forEach((match) => {
    const [_infos, rule] = match;
    const propNameList = findRuleProps(rule).map((prop) => ({
      cssPropName: prop.propName,
      propName: kebabToCamel(prop.propName),
      rawValue: prop.value,
    }));
    propNameList.forEach((ruleProp) => {
      const { propName } = ruleProp;
      const prop = panda.config.utilities?.[propName];
      const propValues = prop && panda.utility["getPropertyValues"](prop);

      let value;

      if (tailwind.candidateRuleMap.get(ruleProp.rawValue) || !propValues) {
        value = ruleProp.rawValue;
      } else {
        // bg-red-500 => red.500
        value = (classInfo.value ?? "").replace("-", ".");
      }
      if (!value) return;

      if (classInfo.isImportant) {
        value += "!";
      }

      tokens.push({ propName, tokenName: value, classInfo });
    });
  });

  return tokens;
}
