import type * as P from "postcss";

export const findRuleProps = (root: P.Rule | P.AtRule | P.Declaration) => {
  let rules = [root];
  let rule: P.Rule | P.AtRule | P.Declaration | undefined;

  const propNameList = [];

  while (rules.length > 0) {
    rule = rules.shift()!;

    if (rule.type === "decl") {
      if (rule.prop.startsWith("--")) continue;
      propNameList.push({ propName: rule.prop, value: rule.value });
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
