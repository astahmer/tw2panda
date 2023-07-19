import { CallExpression, Node, SourceFile, StringLiteral } from "ts-morph";
import { PandaContext } from "./panda-context";

type CandidateResult = {
  candidate: string;
  node: StringLiteral;
  insideCva: "no" | "yes" | "yes-base";
  cva: CvaNode | undefined;
};
export type CvaNode = { node: CallExpression; start: number; end: number; base: Node | undefined };

/** Finds all tailwind class candidates in a file
 * -> returns the list of all StringLiteral AST nodes */
export function findTwClassCandidates(content: string, panda: PandaContext) {
  const sourceFile = panda.project.addSourceFile("App.tsx", content) as any as SourceFile;
  const candidates = new Set<CandidateResult>();

  let cva: CvaNode | undefined;

  sourceFile.forEachDescendant((node, traversal) => {
    // quick win
    if (Node.isImportDeclaration(node) || Node.isExportDeclaration(node)) {
      traversal.skip();
      return;
    }

    if (Node.isCallExpression(node)) {
      // node.isInStringAtPos()
      const name = node.getExpression().getText();
      if (name === "cva") {
        cva = { node, start: node.getStart(), end: node.getEnd(), base: node.getArguments()[0] };
      }

      return;
    }

    if (Node.isStringLiteral(node)) {
      const string = (node.getLiteralText() ?? "").trim();
      if (!string) return;

      let insideCva: CandidateResult["insideCva"] = "no";
      if (cva) {
        const isInsideCva = node.getStart() > cva.start && node.getEnd() < cva.end;
        if (isInsideCva) {
          insideCva = node === cva.base ? "yes-base" : "yes";
        }
      }

      candidates.add({ candidate: string, node, insideCva, cva });
    }
  });

  return { sourceFile, candidates };
}
