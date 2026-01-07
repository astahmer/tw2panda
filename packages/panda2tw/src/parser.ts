/**
 * Parse Panda CSS and CVA calls from TypeScript files
 */

import { CallExpression, Node, SourceFile } from "ts-morph";

export interface ParsedCssCall {
  node: CallExpression;
  startPos: number;
  endPos: number;
  argument: Node;
}

export interface ParsedCvaCall {
  node: CallExpression;
  startPos: number;
  endPos: number;
  baseConfig: Node | undefined;
  variantsConfig: Node | undefined;
}

/**
 * Find all `css()` calls in a file
 */
export const findCssCalls = (sourceFile: SourceFile): ParsedCssCall[] => {
  const calls: ParsedCssCall[] = [];

  sourceFile.forEachDescendant((node) => {
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression();
      if (expression.getText() === "css") {
        const args = node.getArguments();
        if (args.length > 0) {
          calls.push({
            node,
            startPos: node.getStart(),
            endPos: node.getEnd(),
            argument: args[0]!,
          });
        }
      }
    }
  });

  return calls;
};

/**
 * Find all `cva()` calls in a file
 */
export const findCvaCalls = (sourceFile: SourceFile): ParsedCvaCall[] => {
  const calls: ParsedCvaCall[] = [];

  sourceFile.forEachDescendant((node) => {
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression();
      if (expression.getText() === "cva") {
        const args = node.getArguments();
        calls.push({
          node,
          startPos: node.getStart(),
          endPos: node.getEnd(),
          baseConfig: args[0],
          variantsConfig: args[1],
        });
      }
    }
  });

  return calls;
};

/**
 * Extract object properties from a Node as a plain object
 */
export const nodeToObject = (node: Node | undefined): Record<string, any> => {
  if (!node) return {};

  try {
    // Try to evaluate the node as JavaScript
    const text = node.getText();

    // Use Function constructor to safely evaluate object literals
    // This is a simplified approach - be careful with untrusted input
    const obj = new Function(`return (${text})`)();
    return obj;
  } catch (e) {
    // If evaluation fails, return empty object
    return {};
  }
};

/**
 * Extract string literal from a Node
 */
export const extractStringLiteral = (node: Node | undefined): string => {
  if (!node) return "";

  const text = node.getText();

  // Remove quotes
  if ((text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }

  return text;
};
