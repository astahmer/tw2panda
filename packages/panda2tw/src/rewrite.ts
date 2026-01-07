/**
 * Main rewrite logic: Convert Panda CSS file to Tailwind
 */

import { Project, SourceFile } from "ts-morph";
import MagicString from "magic-string";
import { globSync } from "glob";
import { readFileSync, writeFileSync } from "fs";
import type { PandaContext } from "@pandacss/node";
import { findCssCalls, findCvaCalls, nodeToObject } from "./parser.js";
import { extractTailwindClassesFromPandaCss, extractTailwindClassesFromPandaCssWithContext } from "./css-to-tw.js";
import { pandaCvaToTailwind } from "./cva-to-tw.js";
import type { RewriteOptions } from "./types.js";

export interface RewriteResult {
  output: string;
  imports: Set<string>;
  conversions: Array<{ original: string; replacement: string }>;
}

/**
 * Internal function to process a source file
 */
const processSourceFile = (
  sourceFile: SourceFile,
  pandaContext?: PandaContext,
): RewriteResult => {
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
      // Use context-aware conversion if available
      const classes = pandaContext
        ? extractTailwindClassesFromPandaCssWithContext(cssObj, pandaContext)
        : extractTailwindClassesFromPandaCss(cssObj);

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

/**
 * Rewrite a file from Panda CSS to Tailwind
 */
export const rewritePandaToTailwind = (
  content: string,
  filePath: string,
  _options: RewriteOptions = {},
  pandaContext?: PandaContext,
): RewriteResult => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    filePath,
    content,
  ) as SourceFile;

  return processSourceFile(sourceFile, pandaContext);
};

export interface BatchRewriteResult {
  totalFiles: number;
  successfulFiles: number;
  failedFiles: Array<{ file: string; error: string }>;
  totalConversions: number;
  results: Array<{ file: string; conversions: number }>;
}

/**
 * Detect if the input is a glob pattern or a file path
 */
export const isGlobPattern = (input: string): boolean => {
  // Check for glob characters: *, ?, [, {
  return /[*?\[\{]/.test(input);
};

/**
 * Unified rewrite function that handles both single files and glob patterns
 */
export const rewritePattern = async (
  pattern: string,
  options: RewriteOptions & { write?: boolean } = {},
): Promise<BatchRewriteResult | RewriteResult> => {
  const isGlob = isGlobPattern(pattern);

  if (isGlob) {
    return batchRewritePandaToTailwind(pattern, options);
  } else {
    // Single file - load context for smart conversion
    try {
      const content = readFileSync(pattern, "utf-8");

      // Load Panda context if available
      let pandaContext: PandaContext | undefined;
      try {
        const { loadPandaContext } = await import("./config/load-context.js");
        const { context } = await loadPandaContext({ cwd: process.cwd() });
        pandaContext = context;
      } catch (e) {
        // Context loading is optional - continue without it
      }

      const result = rewritePandaToTailwind(content, pattern, options, pandaContext);

      if (options.write) {
        writeFileSync(pattern, result.output);
      }

      return {
        totalFiles: 1,
        successfulFiles: 1,
        failedFiles: [],
        totalConversions: result.conversions.length,
        results: [{ file: pattern, conversions: result.conversions.length }],
      };
    } catch (e) {
      return {
        totalFiles: 1,
        successfulFiles: 0,
        failedFiles: [
          {
            file: pattern,
            error: e instanceof Error ? e.message : String(e),
          },
        ],
        totalConversions: 0,
        results: [],
      };
    }
  }
};

/**
 * Batch rewrite multiple files matching a glob pattern with a shared Project instance
 */
export const batchRewritePandaToTailwind = async (
  globPattern: string,
  options: RewriteOptions & { write?: boolean } = {},
): Promise<BatchRewriteResult> => {
  const files = globSync(globPattern, {
    ignore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  });

  const result: BatchRewriteResult = {
    totalFiles: files.length,
    successfulFiles: 0,
    failedFiles: [],
    totalConversions: 0,
    results: [],
  };

  if (files.length === 0) {
    console.warn(`⚠️  No files matched pattern: ${globPattern}`);
    return result;
  }

  // Load Panda context if available for smart token resolution
  let pandaContext: PandaContext | undefined;
  try {
    const { loadPandaContext } = await import("./config/load-context.js");
    const { context } = await loadPandaContext({ cwd: process.cwd() });
    pandaContext = context;
  } catch (e) {
    // Context loading is optional - continue without it
  }

  // Create a single Project instance for all files
  const project = new Project({ useInMemoryFileSystem: true });

  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");

      // Add file to the shared project
      const sourceFile = project.createSourceFile(file, content) as SourceFile;

      // Process the file using the shared project and loaded context
      const rewriteResult = processSourceFile(sourceFile, pandaContext);

      if (options.write) {
        writeFileSync(file, rewriteResult.output);
      }

      result.successfulFiles++;
      result.totalConversions += rewriteResult.conversions.length;
      result.results.push({
        file,
        conversions: rewriteResult.conversions.length,
      });
    } catch (e) {
      result.failedFiles.push({
        file,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return result;
};
