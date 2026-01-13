/**
 * Detect and convert CVA configurations in code
 * Supports both define.recipe() and cva() patterns
 */

import { Project, ObjectLiteralExpression, Node, SyntaxKind } from "ts-morph";
import { pandaCvaToTailwind, extractClassesFromNestedStyles } from "./cva-to-tw.js";

/**
 * Detects CVA patterns (base + variants) in code and converts them to Tailwind
 * Handles:
 * - const xxx = define.recipe({...})
 * - const xxx = cva({...})
 * - const xxx = define.slotRecipe({...})
 * - styled.xxx({base: {...}, variants: {...}})
 */
export function detectAndConvertCvaInCode(code: string): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("temp.ts", code);

  let hasChanges = false;

  // Find all object literals and check if they're CVA configs
  // Collect them first before modifying to avoid invalidating nodes
  const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
  const cvaObjects: ObjectLiteralExpression[] = [];

  for (const obj of objectLiterals) {
    if (isCvaConfig(obj)) {
      cvaObjects.push(obj);
    }
  }

  // Now convert them (in reverse order to maintain node validity)
  for (let i = cvaObjects.length - 1; i >= 0; i--) {
    convertCvaObject(cvaObjects[i]);
    hasChanges = true;
  }

  return hasChanges ? sourceFile.getFullText() : code;
}

/**
 * Check if an object literal is a CVA configuration
 */
function isCvaConfig(obj: ObjectLiteralExpression): boolean {
  const properties = obj.getProperties();
  const propertyNames = new Set(
    properties
      .filter((p) => Node.isPropertyAssignment(p))
      .map((p) => (p as any).getName?.()),
  );

  // CVA configs must have either:
  // 1. Both 'base' and 'variants' properties
  // 2. 'slots' with 'base' or 'variants'
  const hasBase = propertyNames.has("base");
  const hasVariants = propertyNames.has("variants");
  const hasSlots = propertyNames.has("slots");

  return (hasBase && hasVariants) || (hasSlots && (hasBase || hasVariants));
}

/**
 * Convert a CVA object literal to use Tailwind classes
 */
function convertCvaObject(obj: ObjectLiteralExpression): void {
  const properties = obj.getProperties();

  for (const prop of properties) {
    if (!Node.isPropertyAssignment(prop)) continue;

    const propName = prop.getName?.();

    if (propName === "base") {
      // Convert base styles
      convertStyleProperty(prop);
    } else if (propName === "variants") {
      // Convert each variant value
      const variantValue = prop.getInitializer();
      if (Node.isObjectLiteralExpression(variantValue)) {
        const variantProps = variantValue.getProperties();

        for (const variantProp of variantProps) {
          if (!Node.isPropertyAssignment(variantProp)) continue;

          const variantValuesObj = variantProp.getInitializer();
          if (Node.isObjectLiteralExpression(variantValuesObj)) {
            const variantValues = variantValuesObj.getProperties();

            for (const variantValueProp of variantValues) {
              if (!Node.isPropertyAssignment(variantValueProp)) continue;
              convertStyleProperty(variantValueProp);
            }
          }
        }
      }
    }
  }
}

/**
 * Convert a single style property to use Tailwind classes
 */
function convertStyleProperty(prop: any): void {
  const initializer = prop.getInitializer();

  if (Node.isObjectLiteralExpression(initializer)) {
    // Check if this is a slot definition (has nested selectors like 'root', 'image', etc.)
    const slotNames = new Set(
      initializer
        .getProperties()
        .filter((p: any) => Node.isPropertyAssignment(p))
        .map((p: any) => p.getName?.()),
    );

    // Common slot names
    const commonSlots = new Set([
      "root",
      "image",
      "fallback",
      "header",
      "body",
      "footer",
      "icon",
      "label",
      "content",
    ]);
    const hasSlots = Array.from(slotNames).some((name) => commonSlots.has(name as string));

    if (hasSlots) {
      // This is a slot-based definition, convert each slot
      convertSlotStyles(initializer);
    } else {
      // This is a direct style definition
      const styleObj = evaluateObjectLiteral(initializer);
      if (styleObj) {
        const classes = extractClassesFromNestedStyles(styleObj);
        if (classes.length > 0) {
          // Replace with a string of Tailwind classes
          prop.setInitializer(`"${classes.join(" ")}"`);
        }
      }
    }
  }
}

/**
 * Convert slot-based styles (e.g., {root: {...}, image: {...}})
 */
function convertSlotStyles(obj: ObjectLiteralExpression): void {
  const properties = obj.getProperties();

  for (const prop of properties) {
    if (!Node.isPropertyAssignment(prop)) continue;

    const initializer = prop.getInitializer();
    if (Node.isObjectLiteralExpression(initializer)) {
      const styleObj = evaluateObjectLiteral(initializer);
      if (styleObj) {
        const classes = extractClassesFromNestedStyles(styleObj);
        if (classes.length > 0) {
          // Check if any classes contain arbitrary selectors (with '[' and ']')
          // If so, keep the object structure; otherwise convert to string
          const hasArbitrarySelectors = classes.some((c) => c.includes("[") && c.includes("]"));
          if (hasArbitrarySelectors) {
            // Keep as object to preserve selector context
            // Create an object with converted classes split by selector
            const classesWithoutSelectors: string[] = [];
            const selectorClasses: Record<string, string[]> = {};

            for (const cls of classes) {
              if (cls.includes("[") && cls.includes("]")) {
                // Extract selector and class
                const match = cls.match(/^(\[.*?\]):(.*)/);
                if (match) {
                  const [, selector, classOnly] = match;
                  if (!selectorClasses[selector]) {
                    selectorClasses[selector] = [];
                  }
                  selectorClasses[selector].push(classOnly);
                }
              } else {
                classesWithoutSelectors.push(cls);
              }
            }

            // Build the object representation
            if (classesWithoutSelectors.length > 0 || Object.keys(selectorClasses).length > 0) {
              const objectParts: string[] = [];
              if (classesWithoutSelectors.length > 0) {
                const escapedClasses = classesWithoutSelectors.join(" ").replace(/"/g, '\\"');
                objectParts.push(`__base: "${escapedClasses}"`);
              }
              for (const [selector, cls] of Object.entries(selectorClasses)) {
                const escapedClasses = cls.join(" ").replace(/"/g, '\\"');
                objectParts.push(`"${selector}": "${escapedClasses}"`);
              }
              prop.setInitializer(`{ ${objectParts.join(", ")} }`);
            }
          } else {
            // No arbitrary selectors, safe to convert to string
            const escapedClasses = classes.join(" ").replace(/"/g, '\\"');
            prop.setInitializer(`"${escapedClasses}"`);
          }
        }
      }
    }
  }
}

/**
 * Safely evaluate an object literal expression to get its JavaScript value
 */
function evaluateObjectLiteral(obj: ObjectLiteralExpression): any {
  try {
    const code = obj.getText();
    // eslint-disable-next-line no-new-func
    const func = new Function(`return (${code})`);
    return func();
  } catch (e) {
    // Fallback: manually extract properties from the object literal
    // This handles cases with special characters in keys like '&:has(...)'
    try {
      return extractObjectLiteralProperties(obj);
    } catch (fallbackError) {
      return null;
    }
  }
}

/**
 * Extract properties from an object literal expression by parsing the AST
 * Handles string keys with special characters that can't be evaluated with new Function
 */
function extractObjectLiteralProperties(obj: ObjectLiteralExpression): any {
  const result: any = {};

  for (const prop of obj.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) continue;

    const keyNode = prop.getChildAtIndex(0);
    let key: string;

    // Handle both identifier keys and string literal keys
    if (Node.isIdentifier(keyNode)) {
      key = keyNode.getText();
    } else if (Node.isStringLiteral(keyNode)) {
      key = keyNode.getLiteralValue();
    } else {
      continue;
    }

    const valueNode = prop.getInitializer();
    if (!valueNode) continue;

    // Recursively evaluate the value
    if (Node.isObjectLiteralExpression(valueNode)) {
      result[key] = extractObjectLiteralProperties(valueNode);
    } else if (Node.isStringLiteral(valueNode)) {
      result[key] = valueNode.getLiteralValue();
    } else if (Node.isNumericLiteral(valueNode)) {
      result[key] = Number(valueNode.getLiteralValue());
    } else {
      // For other types (computed values, etc.), try to get the text representation
      result[key] = valueNode.getText();
    }
  }

  return result;
}
