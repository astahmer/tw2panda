import { findTwClassCandidates } from "./find-tw-class-candidates";
import { PandaContext } from "./panda-context";
import { mapToShorthands } from "./panda-map-to-shorthands";
import { TailwindContext } from "./tw-types";
import { StyleObject, TwResultItem } from "./types";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";

/**
 *  Returns a list of `TwResultItem`, which is a mapping of:
 * - `classList` - the original class list
 * - `styles` - the classList converted to a Panda style object
 * - `node` - the StringLiteral AST node that contains the class list
 */
export const extractTwFileClassList = (
  content: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject,
) => {
  const { nodes } = findTwClassCandidates(content, panda);
  const resultList = [] as TwResultItem[];
  if (!nodes.size) return resultList;

  nodes.forEach((node) => {
    const string = node.getLiteralText();
    const classList = new Set(string.split(" "));

    const styles = twClassListToPandaStyles(classList, tailwind, panda);
    if (!styles.length) return;

    const merged = mapToShorthands(mergeCss(...styles.map((s) => s.styles)), panda);
    resultList.push({ classList: new Set(classList), styles: merged, node });
  });

  return resultList;
};
