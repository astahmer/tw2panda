import { PandaContext } from "./panda-context";
import { TailwindContext } from "./tw-types";
import { maybePretty } from "./maybe-pretty";
import MagicString from "magic-string";
import { CallExpression, Node, SourceFile, ts } from "ts-morph";
import { RewriteOptions, StyleObject, TwResultItem } from "./types";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";
import { mapToShorthands } from "./panda-map-to-shorthands";

type CvaNode = { node: CallExpression; start: number; end: number; base: Node | undefined; variantsConfig: Node };

/**
 * Parse a file content, replace Tailwind classes with Panda styles object
 * and return the new content. (Does not write to disk)
 */
export function rewriteTwFileContentToPanda(
  content: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject,
  options: RewriteOptions = { shorthands: true },
) {
  const sourceFile = panda.project.addSourceFile("App.tsx", content) as any as SourceFile;

  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);
  const resultList = [] as TwResultItem[];

  let cvaNode: undefined | CvaNode;
  const cvaTransforms = [] as (() => void)[];

  sourceFile.forEachDescendant((node, traversal) => {
    // quick win
    if (Node.isExportDeclaration(node)) {
      traversal.skip();
      return;
    }

    if (Node.isImportDeclaration(node)) {
      const moduleSpecifier = node.getModuleSpecifierValue();
      if (moduleSpecifier === "class-variance-authority") {
        const moduleSpecifierNode = node.getModuleSpecifier();
        magicStr.update(moduleSpecifierNode.getStart(), moduleSpecifierNode.getEnd(), "'styled-system/css'");

        const importClause = node.getImportClause();
        if (importClause) {
          const namedBindings = importClause.getNamedBindings();
          if (Node.isNamedImports(namedBindings)) {
            const elements = namedBindings.getElements();
            const VariantPropsNode = elements.find((e) => e.getName() === "VariantProps");
            if (VariantPropsNode) {
              magicStr.update(VariantPropsNode.getStart(), VariantPropsNode.getEnd(), "type RecipeVariantProps");
            }
          }
        }
      }
    }

    if (Node.isCallExpression(node)) {
      const name = node.getExpression().getText();
      if (name === "cva") {
        const args = node.getArguments();
        cvaNode = { node, start: node.getStart(), end: node.getEnd(), base: args[0], variantsConfig: args[1]! };
      }

      return;
    }

    if (Node.isStringLiteral(node)) {
      const string = (node.getLiteralText() ?? "").trim();
      if (!string) return;

      const classList = new Set(string.split(" ").filter((t) => t.trim()));
      if (!classList.size) return;

      const styles = twClassListToPandaStyles(classList, tailwind, panda);
      if (!styles.length) return;

      const merged = mergeCss(...styles.map((s) => s.styles));
      const styleObject = options?.shorthands ? mapToShorthands(merged, panda) : merged;
      resultList.push({ classList: new Set(classList), styles: styleObject, node });

      const parent = node.getParent();
      const serializedStyles = JSON.stringify(styleObject, null);

      const isInsideCva = cvaNode && node.getStart() > cvaNode.start && node.getEnd() < cvaNode.end;

      // if the string is inside a cva call, omit the `css()` call
      let replacement = !isInsideCva ? `css(\n${serializedStyles})` : serializedStyles;

      // if the string is inside a JSX attribute or expression, wrap it in {}
      if (Node.isJsxAttribute(parent) || Node.isJsxExpression(parent)) {
        replacement = `{${replacement}}`;
      }

      // easy way, just replace the string
      if (cvaNode?.base !== node) {
        magicStr.update(node.getStart(), node.getEnd(), replacement);
        return;
      }

      // if the string is the 1st arg (cvaNode.base) of a cva call, move it to a new `base` key inside the 2nd arg (cvaNode.variantsConfig)
      const variantsConfig = cvaNode.variantsConfig;
      if (!Node.isObjectLiteralExpression(variantsConfig)) return;

      cvaTransforms.push(() => {
        const prev = variantsConfig.getPreviousSibling();

        // rm trailing comma
        if (prev && prev.getKind() === ts.SyntaxKind.CommaToken) {
          magicStr.remove(prev.getStart(), prev.getEnd());
        }

        // merge 1st arg of `class-variance-authority` with its 2nd arg, move 1st arg inside panda's cva `base` key
        magicStr.update(
          variantsConfig.getStart(),
          variantsConfig.getEnd(),
          `{ base: ${serializedStyles}, ${magicStr.slice(variantsConfig.getStart() + 1, variantsConfig.getEnd() - 1)}}`,
        );
      });

      // rm trailing comma
      magicStr.remove(node.getStart(), node.getEnd());
    }
  });

  // those have to be done after all other transforms
  // otherwise magic-string throws with: `Cannot split a chunk that has already been edited`
  cvaTransforms.forEach((t) => t());

  const output = maybePretty(magicStr.toString(), {
    singleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    jsxSingleQuote: false,
    proseWrap: "always",
    semi: false,
    tabWidth: 2,
    trailingComma: "all",
  });

  return { sourceFile, output, resultList };
}
