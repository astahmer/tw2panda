/**
 * Main rewrite logic: Convert Panda CSS file to Tailwind
 */

import { Project, SourceFile } from "ts-morph";
import MagicString from "magic-string";
import { findCssCalls, findCvaCalls, nodeToObject, ParsedCssCall, ParsedCvaCall } from "./parser.js";
import { extractTailwindClassesFromPandaCss } from "./css-to-tw.js";
import { pandaCvaToTailwind } from "./cva-to-tw.js";
import type { RewriteOptions } from "./types.js";

export interface RewriteResult {
  output: string;
  imports: Set<string>;
  conversions: Array<{ original: string; replacement: string }>;
}

/**
 * Rewrite a file from Panda CSS to Tailwind
 */
export const rewritePandaToTailwind = (
  content: string,
  filePath: string,
  _options: RewriteOptions = {},
): RewriteResult => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    filePath,
    content,
  ) as any as SourceFile;

  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);
  const imports = new Set<string>(["className"]);
  const conversions: Array<{ original: string; replacement: string }> = [];

  // Remove old Panda imports
  sourceFile.getImportDeclarations().forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (
      moduleSpecifier === "styled-system/css" ||
      moduleSpecifier?.includes("styled-system")
    ) {
      magicStr.remove(importDecl.getStart(), importDecl.getEnd() + 1); // +1 for newline
    }
  });

  // Convert css() calls
  const cssCalls = findCssCalls(sourceFile);
  cssCalls.forEach((call) => {
    try {
      const cssObj = nodeToObject(call.argument);
      const classes = extractTailwindClassesFromPandaCss(cssObj);

      if (classes.length > 0) {
        const classString = classes.join(" ");
        const replacement = `className="${classString}"`;

        magicStr.overwrite(call.startPos, call.endPos, replacement);
        conversions.push({
          original: call.node.getText(),
          replacement,
        });
      }
    } catch (e) {
      console.error("Error converting css() call:", e);
    }
  });

  // Convert cva() calls
  const cvaCalls = findCvaCalls(sourceFile);
  cvaCalls.forEach((call) => {
    try {
      const baseObj = nodeToObject(call.baseConfig);
      const variantsObj = nodeToObject(call.variantsConfig);

      // For now, generate a comment showing the mapping
      // A full implementation would need to handle the variant logic
      const comment = pandaCvaToTailwind({
        base: baseObj,
        variants: variantsObj,
      });

      const replacement = `// Converted CVA to Tailwind\n${comment}\nconst variantClasses = {};`;

      magicStr.overwrite(call.startPos, call.endPos, replacement);
      conversions.push({
        original: call.node.getText(),
        replacement,
      });
    } catch (e) {
      console.error("Error converting cva() call:", e);
    }
  });

  return {
    output: magicStr.toString(),
    imports,
    conversions,
  };
};
