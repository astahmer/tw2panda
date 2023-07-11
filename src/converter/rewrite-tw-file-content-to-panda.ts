import { PandaContext } from "./panda-context";
import { TailwindContext } from "./tw-types";
import { maybePretty } from "./maybe-pretty";
import { extractClassCandidates } from "./extract-class-candidates";
import MagicString from "magic-string";
import { Node } from "ts-morph";
import { StyleObject, TwResultItem } from "./types";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";
import { mapToShorthands } from "./panda-map-to-shorthands";

export function rewriteTwFileContentToPanda(
  content: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject
) {
  const { sourceFile, nodes } = extractClassCandidates(content, panda);

  if (!nodes.size) return { sourceFile, nodes, output: content };

  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);
  const resultList = [] as TwResultItem[];

  nodes.forEach((node) => {
    const string = node.getLiteralText();
    const classList = new Set(string.split(" "));
    const { styles } = twClassListToPandaStyles(classList, tailwind, panda);
    if (!styles.length) return;

    const merged = mapToShorthands(mergeCss(...styles), panda);
    resultList.push({ classList: new Set(classList), styles: merged, node });

    const parent = node.getParent();
    let replacement = `css(\n${JSON.stringify(merged)})`;
    if (Node.isJsxAttribute(parent) || Node.isJsxExpression(parent)) {
      replacement = `{${replacement}}`;
    }

    magicStr.update(node.getStart(), node.getEnd(), replacement);
  });

  const output = maybePretty(magicStr.toString(), {
    singleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    jsxSingleQuote: false,
    proseWrap: "always",
    semi: false,
    tabWidth: 2,
    trailingComma: "all",
  });

  return { sourceFile, nodes, output, resultList };
}
