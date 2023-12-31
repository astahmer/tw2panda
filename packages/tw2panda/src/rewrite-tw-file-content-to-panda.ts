import { PandaContext } from "./panda-context";
import { TailwindContext } from "./tw-types";
import { prettify } from "./maybe-pretty";
import MagicString from "magic-string";
import { CallExpression, Node, SourceFile, ts } from "ts-morph";
import { RewriteOptions, StyleObject, TwResultItem } from "./types";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";
import { mapToShorthands } from "./panda-map-to-shorthands";
import { getStringLiteralText, isStringLike } from "./find-tw-class-candidates";
import { join, relative } from "pathe";

type CvaNode = { node: CallExpression; start: number; end: number; base: Node | undefined; variantsConfig: Node };

const importFrom = (values: string[], mod: string) => `import { ${values.join(", ")} } from '${mod}';`;

/**
 * Parse a file content, replace Tailwind classes with Panda styles object
 * and return the new content. (Does not write to disk)
 */
export function rewriteTwFileContentToPanda(
  content: string,
  filePath: string,
  tailwind: TailwindContext,
  panda: PandaContext,
  mergeCss: (...styles: StyleObject[]) => StyleObject,
  options: RewriteOptions = { shorthands: true },
) {
  const sourceFile = panda.project.addSourceFile(filePath, content) as any as SourceFile;

  const code = sourceFile.getFullText();
  const magicStr = new MagicString(code);
  const resultList = [] as TwResultItem[];

  let cvaNode: undefined | CvaNode;
  let isInsideCx = false;

  const imports = new Set(["css"]);

  sourceFile.forEachDescendant((node, traversal) => {
    // out of selection range, ignore
    if (options.range) {
      if (options.range.start > node.getStart() && node.getEnd() > options.range.end) {
        return;
      }
    }

    // quick win
    if (Node.isExportDeclaration(node)) {
      traversal.skip();
      return;
    }

    // Replace `import { VariantProps } from "class-variance-authority"` with `import { RecipeVariantProps } from "styled-system/css"`
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

    if (Node.isTemplateHead(node)) {
      const string = getStringLiteralText(node);
      if (!string) return;

      const classList = new Set(string.split(" "));
      if (!classList.size) return;

      const styles = twClassListToPandaStyles(classList, tailwind, panda);
      if (!styles.length) return;

      const merged = mergeCss(...styles.map((s) => s.styles));
      const styleObject = options?.shorthands ? mapToShorthands(merged, panda) : merged;
      resultList.push({ classList: new Set(classList), styles: styleObject, node });

      const serializedStyles = JSON.stringify(styleObject, null);

      magicStr.update(node.getStart(), node.getEnd(), `cx(css(${serializedStyles}),`);
      isInsideCx = true;
      imports.add("cx");
    }

    if (isInsideCx && Node.isTemplateTail(node)) {
      magicStr.update(node.getStart(), node.getEnd(), ")");
      isInsideCx = false;
    }

    if (isStringLike(node)) {
      const string = getStringLiteralText(node);
      if (!string) return;

      const classList = new Set(string.split(" "));
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
      let replacement = !isInsideCva ? `css(${serializedStyles})` : serializedStyles;

      // if the string is inside a JSX attribute or expression, wrap it in {}
      if (!isInsideCx && Node.isJsxAttribute(parent)) {
        replacement = `{${replacement}}`;
      }

      // easy way, just replace the string
      // <div class="text-slate-700 dark:text-slate-500" /> => <div css={css({ color: "slate.700", dark: { color: "slate.500" } })} />
      if (cvaNode?.base !== node) {
        magicStr.update(node.getStart(), node.getEnd(), replacement);
        return;
      }

      // if the string is the 1st arg (cvaNode.base) of a cva call, move it to a new `base` key inside the 2nd arg (cvaNode.variantsConfig)
      const variantsConfig = cvaNode.variantsConfig;
      if (!Node.isObjectLiteralExpression(variantsConfig)) return;

      const prev = variantsConfig.getPreviousSibling();

      // rm trailing comma
      if (prev && prev.getKind() === ts.SyntaxKind.CommaToken) {
        magicStr.remove(prev.getStart(), prev.getEnd());
      }

      // merge 1st arg of `class-variance-authority` with its 2nd arg, move 1st arg inside panda's cva `base` key
      magicStr.appendLeft(variantsConfig.getStart() + 1, `base: ${serializedStyles}, `);

      // rm trailing comma
      magicStr.remove(node.getStart(), node.getEnd());
    }
  });

  if (imports.size) {
    const relativeFile = relative(panda.config.cwd, filePath);
    const outdirCssPath = join(panda.config.cwd, `${panda.config.outdir}/css`);
    const from = relative(relativeFile, outdirCssPath);
    magicStr.prepend(importFrom(Array.from(imports), from) + "\n\n");
  }

  return { sourceFile, output: prettify(magicStr.toString()), resultList, magicStr };
}
