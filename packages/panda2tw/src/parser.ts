/**
 * Parse Panda CSS and CVA calls from TypeScript files
 */

import { CallExpression, JsxOpeningElement, Node, SourceFile, JsxAttribute } from "ts-morph";

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

export interface ParsedJsxElement {
  node: JsxOpeningElement;
  startPos: number;
  endPos: number;
  tagName: string;
  pandaProps: Array<{
    name: string;
    value: string;
    node: JsxAttribute;
  }>;
  otherProps: Array<{
    name: string;
    node: JsxAttribute;
  }>;
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
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }

  return text;
};

/**
 * Fallback set of common Panda CSS properties when context is not available
 */
const DEFAULT_PANDA_PROPERTIES = new Set([
  "css", // Special Panda CSS prop
  "display",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "gap",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "width",
  "height",
  "maxWidth",
  "maxHeight",
  "minWidth",
  "minHeight",
  "color",
  "backgroundColor",
  "borderColor",
  "borderRadius",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "textAlign",
  "flex",
  "flexWrap",
  "flexGrow",
  "flexShrink",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "opacity",
  "overflow",
  "whiteSpace",
  "textStyle",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "w",
  "h",
  "minW",
  "minH",
  "maxW",
  "maxH",
  "bg",
  "textColor",
  "rounded",
  "border",
  "shadow",
  "cursor",
  "pointerEvents",
  "userSelect",
  "transform",
  "transition",
  "duration",
  "ease",
  "delay",
  "hover",
  "_hover",
  "_focus",
  "_active",
  "_disabled",
  "md",
  "lg",
  "xl",
  "2xl",
  "sm",
]);

/**
 * Check if a property is a valid Panda CSS property
 */
const isPandaDefaultProperty = (prop: string): boolean => {
  return DEFAULT_PANDA_PROPERTIES.has(prop);
};

/**
 * Extract Panda CSS props from JSX element attributes
 */
const extractPandaPropsFromAttributes = (
  attributes: any[],
  pandaContext?: any,
): { pandaProps: Array<{ name: string; value: string; node: any }>; otherProps: Array<{ name: string; node: any }> } => {
  const pandaProps: Array<{ name: string; value: string; node: any }> = [];
  const otherProps: Array<{ name: string; node: any }> = [];

  attributes.forEach((attr) => {
    if (Node.isJsxAttribute(attr)) {
      const nameNode = attr.getNameNode();
      const propName = nameNode?.getText() || "";
      const initializer = attr.getInitializer();

      // Special handling for the "css" prop - it's always a Panda CSS prop
      const isCssProp = propName === "css";
      const isDefaultProp = isPandaDefaultProperty(propName);
      const isContextProp = pandaContext?.isValidProperty?.(propName);
      const isValidProp = isCssProp || isContextProp || isDefaultProp;

      if (isValidProp) {
        // Extract the value
        let value = "";
        if (initializer) {
          if (Node.isStringLiteral(initializer)) {
            value = initializer.getLiteralValue();
          } else if (Node.isJsxExpression(initializer)) {
            const expr = initializer.getExpression();
            if (expr) {
              value = expr.getText();
            }
          } else {
            value = initializer.getText();
          }
        }

        if (value) {
          pandaProps.push({ name: propName, value, node: attr });
        }
      } else if (propName) {
        otherProps.push({ name: propName, node: attr });
      }
    }
  });

  return { pandaProps, otherProps };
};

/**
 * Find all JSX elements with Panda CSS props
 */
export const findJsxElementsWithPandaProps = (sourceFile: SourceFile, pandaContext?: any): ParsedJsxElement[] => {
  const elements: ParsedJsxElement[] = [];

  sourceFile.forEachDescendant((node) => {
    // Handle both JsxOpeningElement (from <Tag>...</Tag>) and JsxSelfClosingElement (from <Tag ... />)
    const isJsxElement = Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node);

    if (isJsxElement) {
      const attributes = node.getAttributes();
      const { pandaProps, otherProps } = extractPandaPropsFromAttributes(attributes, pandaContext);

      if (pandaProps.length > 0) {
        elements.push({
          node: node as any,
          startPos: node.getStart(),
          endPos: node.getEnd(),
          tagName: node.getTagNameNode().getText(),
          pandaProps,
          otherProps,
        });
      }
    }
  });

  return elements;
};
