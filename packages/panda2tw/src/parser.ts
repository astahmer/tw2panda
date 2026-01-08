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
 * Get all Panda component imports from the source file
 * Returns a Set of component names imported from styled-system packages
 */
const getPandaComponentImports = (sourceFile: SourceFile): Set<string> => {
  const pandaComponents = new Set<string>();

  sourceFile.getImportDeclarations().forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    // Match imports from Panda styled-system packages
    if (moduleSpecifier?.includes("styled-system")) {
      importDecl.getNamedImports().forEach((namedImport) => {
        const name = namedImport.getNameNode().getText();
        pandaComponents.add(name);
      });
    }
  });

  return pandaComponents;
};

/**
 * Common CSS property names that are valid Panda CSS properties
 * Used only for Panda-imported components
 */
const COMMON_CSS_PROPERTIES = new Set([
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
  "boxShadow",
  "scale",
  "rotate",
  "translate",
]);

/**
 * Props that should never be converted to CSS/Tailwind classes
 * These are reserved for non-styling purposes
 */
const EXCLUDED_PROPS = new Set([
  "content", // Content prop used for text/display, not CSS
  "children", // React children
  "key", // React key prop
  "ref", // React ref prop
]);

/**
 * Check if an initializer is a simple literal value (string or number)
 * Returns true only for direct string/number literals, not complex expressions
 */
const isSimpleLiteral = (initializer: any): boolean => {
  if (!initializer) return false;

  // Allow string literals
  if (Node.isStringLiteral(initializer)) return true;

  // Allow number literals
  if (Node.isNumericLiteral(initializer)) return true;

  // For JSX expressions, only allow simple identifiers or string/number literals inside
  if (Node.isJsxExpression(initializer)) {
    const expr = initializer.getExpression();
    if (!expr) return false;

    // Allow simple string/number literals inside expressions
    if (Node.isStringLiteral(expr) || Node.isNumericLiteral(expr)) {
      return true;
    }

    // Don't allow complex expressions like ternaries, function calls, etc.
    return false;
  }

  return false;
};

/**
 * Extract Panda CSS props from JSX element attributes
 */
const extractPandaPropsFromAttributes = (
  attributes: any[],
  pandaContext?: any,
  isPandaComponent?: boolean,
): {
  pandaProps: Array<{ name: string; value: string; node: any }>;
  otherProps: Array<{ name: string; node: any }>;
} => {
  const pandaProps: Array<{ name: string; value: string; node: any }> = [];
  const otherProps: Array<{ name: string; node: any }> = [];

  attributes.forEach((attr) => {
    if (Node.isJsxAttribute(attr)) {
      const nameNode = attr.getNameNode();
      const propName = nameNode?.getText() || "";
      const initializer = attr.getInitializer();

      // Skip excluded props (content, children, key, ref)
      if (EXCLUDED_PROPS.has(propName)) {
        otherProps.push({ name: propName, node: attr });
        return;
      }

      // Special handling for the "css" prop - it's always a Panda CSS prop
      const isCssProp = propName === "css";

      // Determine if this is a valid Panda CSS prop:
      // 1. Always: "css" prop
      // 2. If we have Panda context: validate with context
      // 3. If prop is a known CSS property (on any element): allow it
      // 4. Otherwise: it's not a CSS property
      //
      // Note: We allow known CSS properties on any element (not just Panda imports)
      // because CSS properties are universally recognized and safe to convert.
      // The "css" prop is specific to Panda, but "display", "padding", etc. are standard CSS.
      const isContextProp = pandaContext?.isValidProperty?.(propName);
      const isCssProperty = COMMON_CSS_PROPERTIES.has(propName);
      const isValidProp = isCssProp || isContextProp || isCssProperty;

      if (isValidProp) {
        // For CSS props (not "css" object), only process simple literal values
        // Complex expressions like ternaries should not be converted
        if (!isCssProp && !isSimpleLiteral(initializer)) {
          otherProps.push({ name: propName, node: attr });
          return;
        }

        // Extract the value
        let value = "";
        if (initializer) {
          if (Node.isStringLiteral(initializer)) {
            value = initializer.getLiteralValue();
          } else if (Node.isNumericLiteral(initializer)) {
            value = initializer.getText();
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
  const pandaImports = getPandaComponentImports(sourceFile);

  sourceFile.forEachDescendant((node) => {
    // Handle both JsxOpeningElement (from <Tag>...</Tag>) and JsxSelfClosingElement (from <Tag ... />)
    const isJsxElement = Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node);

    if (isJsxElement) {
      const tagName = node.getTagNameNode().getText();
      const isPandaComponent = pandaImports.has(tagName);
      const attributes = node.getAttributes();
      const { pandaProps, otherProps } = extractPandaPropsFromAttributes(attributes, pandaContext, isPandaComponent);

      if (pandaProps.length > 0) {
        elements.push({
          node: node as any,
          startPos: node.getStart(),
          endPos: node.getEnd(),
          tagName,
          pandaProps,
          otherProps,
        });
      }
    }
  });

  return elements;
};
