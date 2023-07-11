import { extractClassCandidates } from "./extract-class-candidates";
import { PandaContext } from "./panda-context";
import { mapToShorthands } from "./panda-map-to-shorthands";
import { TailwindContext } from "./tw-types";
import { StyleObject, TwResultItem } from "./types";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";

export const extractTwFileClassList = (
  content: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject
) => {
  const { sourceFile, nodes } = extractClassCandidates(content, panda);
  const resultList = [] as TwResultItem[];
  if (!nodes.size) return { sourceFile, nodes, resultList };

  nodes.forEach((node) => {
    const string = node.getLiteralText();
    const classList = new Set(string.split(" "));

    const { styles } = twClassListToPandaStyles(classList, tailwind, panda);
    if (!styles.length) return;

    const merged = mapToShorthands(mergeCss(...styles), panda);
    resultList.push({ classList: new Set(classList), styles: merged, node });
  });

  return { sourceFile, nodes, resultList };
};
