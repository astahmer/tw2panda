/**
 * Main rewrite logic: Convert Panda CSS file to Tailwind
 */

import { Project, SourceFile, Node } from "ts-morph";
import MagicString from "magic-string";
import { globSync } from "glob";
import { readFileSync, writeFileSync, statSync } from "fs";
import type { PandaContext } from "@pandacss/node";
import type { Config } from "tailwindcss";
import { findCssCalls, findCvaCalls, findJsxElementsWithPandaProps, nodeToObject } from "./parser.js";
import { extractTailwindClassesFromPandaCss, extractTailwindClassesFromPandaCssWithContext } from "./css-to-tw.js";
import { pandaCvaToTailwind } from "./cva-to-tw.js";
import type { RewriteOptions } from "./types.js";

export interface RewriteResult {
  output: string;
  imports: Set<string>;
  conversions: Array<{ original: string; replacement: string }>;
}

/**
 * Exposed variant props mapping for Stack/HStack components
 * Used when --with-jsx-stack flag is enabled
 */
const STACK_EXPOSED_VARIANTS = {
  direction: ["row", "column"],
  flexDirection: ["row", "column"],
  alignItems: ["center", "start", "end"],
  alignSelf: ["auto", "start", "end", "center", "stretch"],
  justifyContent: ["center", "start", "end", "between", "around"],
  wrap: [true],
  w: ["full", "100%"],
  h: ["full", "100%"],
  gap: [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "0",
    "2",
    "4",
    "8",
    "12",
    "16",
    "24",
    "32",
    "40",
    "48",
    "56",
    "64",
    "72",
    "80",
  ],
};

/**
 * Check if a prop is an exposed variant for Stack/HStack
 */
const isExposedVariant = (propName: string): propName is keyof typeof STACK_EXPOSED_VARIANTS => {
  return propName in STACK_EXPOSED_VARIANTS;
};

/**
 * Check if a variant value is in the exposed values list
 */
const isExposedVariantValue = (variantName: string, value: string | number | boolean): boolean => {
  if (!isExposedVariant(variantName)) return false;
  const exposedValues = STACK_EXPOSED_VARIANTS[variantName];
  return (exposedValues as any[]).includes(value);
};

/**
 * Components that support selective JSX prop conversion
 * Only these components will use the --with-jsx-stack behavior
 */
const SELECTIVE_CONVERSION_COMPONENTS = new Set(["Stack", "HStack", "Flex", "Box"]);

/**
 * Check if a component should use selective JSX prop conversion
 */
const shouldUseSelectiveConversion = (tagName: string, withJsxStack: boolean): boolean => {
  if (!withJsxStack) return false;
  return SELECTIVE_CONVERSION_COMPONENTS.has(tagName);
};

/**
 * Determine if a JSX prop should be converted or kept as-is
 * When useSelectiveConversion is true, only convert props that are NOT exposed
 * or have values NOT in the exposed values list
 */
const shouldConvertJsxProp = (
  propName: string,
  propValue: string | number | boolean,
  useSelectiveConversion: boolean,
): boolean => {
  if (!useSelectiveConversion) return true; // Convert all by default

  // If it's an exposed variant with an exposed value, don't convert it
  if (isExposedVariant(propName) && isExposedVariantValue(propName, propValue)) {
    return false;
  }

  // Otherwise, convert it
  return true;
};

/**
 * Internal function to process a source file
 */
const processSourceFile = (
  sourceFile: SourceFile,
  pandaContext?: PandaContext,
  tailwindConfig?: Config,
  inlineTextStyles?: boolean,
  withJsxStack?: boolean,
): RewriteResult => {
  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);
  const imports = new Set<string>(["className"]);
  const conversions: Array<{ original: string; replacement: string }> = [];

  // Remove old Panda imports
  sourceFile.getImportDeclarations().forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (moduleSpecifier === "styled-system/css" || moduleSpecifier?.includes("styled-system")) {
      magicStr.remove(importDecl.getStart(), importDecl.getEnd() + 1); // +1 for newline
    }
  });

  // Convert css() calls
  const cssCalls = findCssCalls(sourceFile);
  cssCalls.forEach((call) => {
    try {
      const cssObj = nodeToObject(call.argument);
      // Use context-aware conversion if available, otherwise pass context for shorthand/responsive resolution
      const classes = pandaContext
        ? extractTailwindClassesFromPandaCssWithContext(cssObj, pandaContext as any, tailwindConfig, inlineTextStyles)
        : extractTailwindClassesFromPandaCss(cssObj, pandaContext as any);

      if (classes.length > 0) {
        const classString = classes.join(" ");

        // Check if css() call is inside a JSX expression (like className={css(...)})
        // by checking if parent is a JsxExpression
        let parent = call.node.getParent();
        let isInJsxExpression = false;

        while (parent) {
          if (Node.isJsxExpression(parent)) {
            isInJsxExpression = true;
            break;
          }
          if (Node.isJsxAttribute(parent) || Node.isJsxOpeningElement(parent)) {
            break;
          }
          parent = parent.getParent();
        }

        // If inside a JSX expression, just use the class string
        // Otherwise, replace with className="..."
        const replacement = isInJsxExpression ? `"${classString}"` : `className="${classString}"`;

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

  // Convert JSX props with Panda CSS
  const jsxElements = findJsxElementsWithPandaProps(sourceFile, pandaContext);
  jsxElements.forEach((element) => {
    try {
      // Determine if this component should use selective conversion
      const useSelectiveConversion = shouldUseSelectiveConversion(element.tagName, withJsxStack);

      // Check if we have a css prop
      const cssPropIndex = element.pandaProps.findIndex((p) => p.name === "css");
      const hasCssProp = cssPropIndex !== -1;

      let objectToConvert: Record<string, any> = {};

      if (hasCssProp && element.pandaProps.length === 1) {
        // Only the css prop is present
        const cssProp = element.pandaProps[cssPropIndex];
        if (cssProp) {
          const cssPropValue = cssProp.value;

          // Check if it's a ternary expression
          if (cssPropValue.includes("?") && cssPropValue.includes(":")) {
            // This is a ternary or complex expression - we can't statically convert it
            // so we'll keep it as-is for now
            objectToConvert = {};
          } else {
            try {
              objectToConvert = new Function(`return (${cssPropValue})`)();
            } catch (e) {
              console.error("Failed to parse css prop value:", cssPropValue, e);
              objectToConvert = {};
            }
          }
        }
      } else {
        // Mix of other Panda props (possibly with css prop)
        element.pandaProps.forEach(({ name, value }) => {
          if (name === "css") {
            // Skip css prop when mixed with others - it will be handled separately
            return;
          }

          // Check if this prop should be converted
          if (!shouldConvertJsxProp(name, value, useSelectiveConversion)) {
            // Skip this prop - it's an exposed variant with an exposed value
            return;
          }

          // Try to parse the value as a JS expression if needed
          try {
            // If value is a simple string, use it directly; otherwise try to eval it
            if (value.startsWith('"') || value.startsWith("'")) {
              objectToConvert[name] = value.slice(1, -1);
            } else {
              objectToConvert[name] = new Function(`return (${value})`)();
            }
          } catch {
            // Fall back to string value
            objectToConvert[name] = value;
          }
        });

        // If there's also a css prop with other props, merge them
        if (hasCssProp) {
          const cssProp = element.pandaProps[cssPropIndex];
          if (cssProp) {
            const cssPropValue = cssProp.value;

            // Check if it's a ternary expression
            if (cssPropValue.includes("?") && cssPropValue.includes(":")) {
              // Keep ternaries as-is, they can't be statically converted
              // Skip merging the css prop in this case
            } else {
              try {
                const cssPropObj = new Function(`return (${cssPropValue})`)();
                objectToConvert = { ...cssPropObj, ...objectToConvert };
              } catch (e) {
                console.error("Failed to parse css prop value:", cssPropValue, e);
              }
            }
          }
        }
      }

      // Convert CSS object to Tailwind classes
      const classes = pandaContext
        ? extractTailwindClassesFromPandaCssWithContext(
            objectToConvert,
            pandaContext as any,
            tailwindConfig,
            inlineTextStyles,
          )
        : extractTailwindClassesFromPandaCss(objectToConvert, pandaContext as any);

      if (classes.length > 0) {
        const classString = classes.join(" ");

        // Check if there's already a className prop
        const existingClassNameProp = element.otherProps.find((p) => p.name === "className");
        let finalClassString = classString;
        let classNameNode: any = null;

        if (existingClassNameProp) {
          // Get the existing className value
          const existingValue = existingClassNameProp.node.getInitializer();
          let existingClassName = "";
          let existingClasses: string[] = [];

          if (existingValue) {
            const valueText = existingValue.getText();
            // Remove quotes if it's a string literal
            if (
              (valueText.startsWith('"') && valueText.endsWith('"')) ||
              (valueText.startsWith("'") && valueText.endsWith("'"))
            ) {
              existingClassName = valueText.slice(1, -1);
            } else if (valueText.startsWith("{") && valueText.endsWith("}")) {
              // It's a JSX expression like {something}
              existingClassName = valueText.slice(1, -1);
            } else {
              existingClassName = valueText;
            }
          }

          // Check if the existing className is a css() call
          if (existingClassName.startsWith("css(")) {
            try {
              // Try to extract and convert the css() call
              const cssMatch = existingClassName.match(/css\((.*)\)$/s);
              if (cssMatch) {
                const cssArg = cssMatch[1];
                const cssObj = new Function(`return (${cssArg})`)();
                const existingTwClasses = pandaContext
                  ? extractTailwindClassesFromPandaCssWithContext(
                      cssObj,
                      pandaContext as any,
                      tailwindConfig,
                      inlineTextStyles,
                    )
                  : extractTailwindClassesFromPandaCss(cssObj, pandaContext as any);
                existingClasses = existingTwClasses;
              }
            } catch (e) {
              // If we can't parse it, keep the css() call as-is
              console.debug("Failed to convert existing css() call:", e);
            }
          } else if (existingClassName && !existingClassName.startsWith("{")) {
            // It's a plain string
            existingClasses = [existingClassName];
          } else if (existingClassName.startsWith("{")) {
            // It's a JSX expression variable, keep as-is
            if (existingClasses.length === 0) {
              existingClasses = [existingClassName];
            }
          }

          // Merge existing and new classes
          if (existingClasses.length > 0) {
            const mergedClasses = [...existingClasses, ...classes];
            finalClassString = mergedClasses.join(" ");
          }

          classNameNode = existingClassNameProp.node;
        }

        // Check if the css prop is a ternary (can't be converted)
        const cssPropIsTernary =
          hasCssProp &&
          element.pandaProps[cssPropIndex]?.value.includes("?") &&
          element.pandaProps[cssPropIndex]?.value.includes(":");

        // Remove the Panda props from the element, but skip ternary css props and exposed props when selective conversion is enabled
        element.pandaProps.forEach(({ node, name, value }) => {
          // Skip removing css props that are ternaries
          if (name === "css" && cssPropIsTernary) {
            return;
          }

          // Skip removing props that shouldn't be converted when selective conversion is enabled
          if (!shouldConvertJsxProp(name, value, useSelectiveConversion)) {
            return;
          }

          magicStr.remove(node.getStart(), node.getEnd());
          // Remove the space after the attribute if it exists
          const nextChar = code[node.getEnd()];
          if (nextChar === " ") {
            magicStr.remove(node.getEnd(), node.getEnd() + 1);
          }
        });

        // Update or add className
        if (classNameNode) {
          // Replace existing className value
          const initializer = classNameNode.getInitializer();
          if (initializer) {
            // Use JSX expression if merging with cn(), otherwise use string
            const replacement = finalClassString.startsWith("cn(") ? `{${finalClassString}}` : `"${finalClassString}"`;
            magicStr.overwrite(initializer.getStart(), initializer.getEnd(), replacement);
          }
        } else {
          // Add new className to first non-ternary panda prop position
          const firstConvertibleProp = element.pandaProps.find((p) => !(p.name === "css" && cssPropIsTernary));
          if (firstConvertibleProp) {
            // Use JSX expression if using cn(), otherwise use string
            const value = finalClassString.startsWith("cn(")
              ? `className={${finalClassString}}`
              : `className="${finalClassString}"`;
            magicStr.appendLeft(firstConvertibleProp.node.getStart(), `${value} `);
          }
        }

        conversions.push({
          original: element.pandaProps
            .filter((p) => !(p.name === "css" && cssPropIsTernary))
            .map((p) => p.node.getText())
            .join(" "),
          replacement: `className="${classString}"`,
        });
      }
    } catch (e) {
      console.error("Error converting JSX props:", e);
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
  tailwindConfig?: Config,
): RewriteResult => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, content) as SourceFile;

  return processSourceFile(sourceFile, pandaContext, tailwindConfig, _options.inlineTextStyles, _options.withJsxStack);
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
 * Batch rewrite multiple files matching a glob pattern with a shared Project instance
 */
export const rewritePattern = async (
  globPattern: string,
  options: RewriteOptions & { write?: boolean } = {},
): Promise<BatchRewriteResult> => {
  const globResults = globSync(globPattern, {
    ignore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  });

  // Filter to only include files, not directories
  const files = globResults.filter((file) => {
    try {
      return statSync(file).isFile();
    } catch {
      return false;
    }
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
  let tailwindConfig: Config | undefined;
  try {
    const { loadPandaContext, loadTailwindContext } = await import("./config/load-context.js");
    const { context } = await loadPandaContext({ cwd: process.cwd() });
    pandaContext = context;

    // Also load Tailwind config for all token types
    const tailwindResult = await loadTailwindContext({ cwd: process.cwd() });
    tailwindConfig = (tailwindResult.context?.config || (tailwindResult as any)) as any;
  } catch (e) {
    // console.log(e)
    // Context loading is optional - continue without it
  }

  // Create a single Project instance for all files
  const project = new Project({ useInMemoryFileSystem: true });

  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");

      // Add file to the shared project
      const sourceFile = project.createSourceFile(file, content) as SourceFile;

      // Process the file using the shared project and loaded contexts
      const rewriteResult = processSourceFile(
        sourceFile,
        pandaContext,
        tailwindConfig,
        options.inlineTextStyles,
        options.withJsxStack,
      );

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
