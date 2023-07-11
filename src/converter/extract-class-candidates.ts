import { Node, SourceFile, StringLiteral } from "ts-morph";
import { PandaContext } from "./panda-context";

export function extractClassCandidates(content: string, panda: PandaContext) {
  const nodes = new Set<StringLiteral>();
  const candidates = new Set<string>();

  const sourceFile = panda.project.addSourceFile(
    "App.tsx",
    content
  ) as any as SourceFile;

  sourceFile.forEachDescendant((node, traversal) => {
    // quick win
    if (Node.isImportDeclaration(node) || Node.isExportDeclaration(node)) {
      traversal.skip();
      return;
    }

    if (Node.isStringLiteral(node)) {
      nodes.add(node);
      candidates.add(node.getLiteralText());
    }
  });

  return { sourceFile, nodes };
}
