/**
 * CLI for panda2tw - Convert Panda CSS to Tailwind
 */

import { resolve } from "path";
import { cac } from "cac";
import { rewritePattern } from "./rewrite.js";
import { extractTailwindClassesFromPandaCss } from "./css-to-tw.js";
import { pandaCvaToTailwind } from "./cva-to-tw.js";

const cli = cac("panda2tw");

cli
  .command(
    "rewrite <path>",
    "Rewrite Panda CSS file(s) to use Tailwind classes (supports both files and glob patterns)",
  )
  .option("-w, --write", "Write to disk instead of stdout")
  .option(
    "--inline-text-styles",
    "Inline textStyle definitions to actual CSS properties (instead of generating text-style-* classes)",
  )
  .option(
    "--with-jsx-stack",
    "Only convert JSX props that are not exposed or have values not exposed (for Stack/HStack components with CVA)",
  )
  .action(async (path: string, options: { write?: boolean; inlineTextStyles?: boolean; withJsxStack?: boolean }) => {
    const cwd = process.cwd();
    const resolvedPath = resolve(cwd, path);

    const result = await rewritePattern(resolvedPath, {
      write: options.write || false,
      inlineTextStyles: options.inlineTextStyles || false,
      withJsxStack: options.withJsxStack || false,
    });

    // Check if it's a batch result (has totalFiles property)
    if ("totalFiles" in result) {
      // Batch result
      console.log(`\n🔍 Scanning for files matching: ${path}`);
      console.log(`\n📊 Conversion Results:`);
      console.log(`   Total files: ${result.totalFiles}`);
      console.log(`   Successful: ${result.successfulFiles}`);
      console.log(`   Failed: ${result.failedFiles.length}`);
      console.log(`   Total conversions: ${result.totalConversions}`);

      if (result.results.length > 0) {
        console.log(`\n✅ Successfully processed:`);
        result.results.forEach((r) => {
          console.log(`   ${r.file} (${r.conversions} conversions)`);
        });
      }

      if (result.failedFiles.length > 0) {
        console.log(`\n❌ Failed files:`);
        result.failedFiles.forEach((f) => {
          console.log(`   ${f.file}: ${f.error}`);
        });
      }

      if (options.write && result.successfulFiles > 0) {
        console.log(`\n✨ ${result.successfulFiles} files updated!`);
      }
    }
  });

cli.command("convert <cssObject>", "Convert a CSS object string to Tailwind classes").action((cssObjectStr: string) => {
  try {
    // Parse the CSS object string
    const cssObj = new Function(`return (${cssObjectStr})`)();
    const classes = extractTailwindClassesFromPandaCss(cssObj);

    console.log("Tailwind classes:");
    console.log(classes.join(" "));
  } catch (e) {
    console.error("Error parsing CSS object:", e);
    process.exit(1);
  }
});

cli
  .command("cva <cvaConfig>", "Convert a Panda CVA config object to Tailwind classes")
  .action((cvaConfigStr: string) => {
    try {
      // Parse the CVA config string
      const cvaConfig = new Function(`return (${cvaConfigStr})`)();
      const result = pandaCvaToTailwind(cvaConfig);

      console.log("Tailwind output:");
      console.log(result);
    } catch (e) {
      console.error("Error parsing CVA config:", e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

cli.help();
cli.version("0.1.0");

cli.parse();
