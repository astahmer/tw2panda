import { extract, ExtractedComponentInstance } from "@box-extractor/core";
import { Node, SourceFile } from "ts-morph";

import MagicString from "magic-string";
import { maybePretty } from "./maybe-pretty";
import { PandaContext } from "./panda-context";
import {
  preferShorthands,
  twClassListToPandaStyleObjects,
} from "./tw-to-panda";
import { TailwindContext } from "./types";

type StyleObject = Record<string, any>;
export type TwResultItem = {
  classList: Set<string>;
  query: ExtractedComponentInstance;
  styles: StyleObject;
};

export const extractClassList = (
  fileContent: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject
) => {
  const sourceFile = panda.project.addSourceFile(
    "App.tsx",
    fileContent
  ) as any as SourceFile;

  console.time("extract");
  const extracted = extract({
    ast: sourceFile,
    components: {
      matchTag: () => true,
      matchProp: ({ propName }) => ["class", "className"].includes(propName),
    },
  });
  console.timeEnd("extract");

  const classListByInstance = new Map<
    ExtractedComponentInstance,
    { classList: Set<string>; node: Node }
  >();

  extracted.forEach((entry) => {
    (entry.queryList as ExtractedComponentInstance[]).forEach((query) => {
      const classList = new Set<string>();
      const classLiteral =
        query.box.value.get("className") ?? query.box.value.get("class");
      if (!classLiteral) return;
      if (!classLiteral.isLiteral()) return;
      if (typeof classLiteral.value !== "string") return;

      const classes = classLiteral.value.split(" ");
      classes.forEach((c) => classList.add(c));

      classListByInstance.set(query, {
        classList,
        node: classLiteral.getNode(),
      });
    });
  });

  const resultList = [] as TwResultItem[];
  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);

  console.time("tw parsing");
  classListByInstance.forEach(({ classList, node }, query) => {
    const styles = twClassListToPandaStyleObjects(classList, tailwind, panda);
    const merged = preferShorthands(mergeCss(...styles), panda);

    resultList.push({ classList, query, styles: merged });
    magicStr.update(
      node.getStart(),
      node.getEnd(),
      `{css(\n${JSON.stringify(merged)})}`
    );
  });
  console.timeEnd("tw parsing");

  const output = maybePretty(magicStr.toString(), {
    singleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    jsxSingleQuote: false,
    proseWrap: "always",
    semi: false,
    tabWidth: 2,
    trailingComma: "all",
  }).replace("Tailwind", "🐼 Panda");
  const outputList = {
    ["App.tsx"]: output,
    "transformed.md": resultList
      .map((result) => {
        return `// ${Array.from(result.classList).join(
          " "
        )}\n\`\`\`json\n${JSON.stringify(result.styles, null, 2)}\n\`\`\``;
      })
      .join("\n\n//------------------------------------\n"),
  };

  return {
    sourceFile,
    extracted,
    resultList,
    output,
    outputList,
  };
};
