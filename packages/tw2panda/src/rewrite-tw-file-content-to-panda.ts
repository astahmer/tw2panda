import { PandaContext } from "./panda-context";
import { TailwindContext } from "./tw-types";
import { maybePretty } from "./maybe-pretty";
import { CvaNode, findTwClassCandidates } from "./find-tw-class-candidates";
import MagicString from "magic-string";
import { Node, ts } from "ts-morph";
import { StyleObject, TwResultItem } from "./types";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";
import { mapToShorthands } from "./panda-map-to-shorthands";

/**
 * Parse a file content, replace Tailwind classes with Panda styles object
 * and return the new content. (Does not write to disk)
 */
export function rewriteTwFileContentToPanda(
  content: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject,
) {
  const { sourceFile, candidates } = findTwClassCandidates(content, panda);

  if (!candidates.size) return { sourceFile, candidates, output: content };

  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);
  const resultList = [] as TwResultItem[];

  let cvaNode: undefined | (CvaNode & { secondArg: Node });
  const cvaTransforms = [] as (() => void)[];

  candidates.forEach(({ node, insideCva, cva }) => {
    const string = node.getLiteralText();
    const classList = new Set(string.split(" ").filter((t) => t.trim()));
    if (!classList.size) return;

    const { styles } = twClassListToPandaStyles(classList, tailwind, panda);
    if (!styles.length) return;

    const merged = mapToShorthands(mergeCss(...styles), panda);
    resultList.push({ classList: new Set(classList), styles: merged, node });

    const parent = node.getParent();
    const serializedStyles = JSON.stringify(merged, null);

    let replacement = insideCva === "no" ? `css(\n${serializedStyles})` : serializedStyles;

    if (insideCva !== "yes-base") {
      if (Node.isJsxAttribute(parent) || Node.isJsxExpression(parent)) {
        replacement = `{${replacement}}`;
      }

      magicStr.update(node.getStart(), node.getEnd(), replacement);
      return;
    }
    if (!cva) return;

    cvaNode = cva as any;

    const secondArg = cva.node.getArguments()[1]!;
    if (!cvaNode || !secondArg) return;

    cvaNode.secondArg = secondArg;
    if (!Node.isObjectLiteralExpression(secondArg)) return;

    cvaTransforms.push(() => {
      const prev = secondArg.getPreviousSibling();

      // rm trailing comma
      if (prev && prev.getKind() === ts.SyntaxKind.CommaToken) {
        magicStr.remove(prev.getStart(), prev.getEnd());
      }

      // merge 1st arg of `class-variance-authority` with its 2nd arg, move 1st arg inside panda's cva `base` key
      magicStr.update(
        secondArg.getStart(),
        secondArg.getEnd(),
        `{ base: ${serializedStyles}, ${magicStr.slice(secondArg.getStart() + 1, secondArg.getEnd() - 1)}}`,
      );
    });

    // rm trailing comma
    magicStr.remove(node.getStart(), node.getEnd());
  });

  // those have to be done after all other transforms
  // otherwise magic-string throws with: `Cannot split a chunk that has already been edited`
  cvaTransforms.forEach((t) => t());

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

  return { sourceFile, output, resultList };
}
