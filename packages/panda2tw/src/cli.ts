/**
 * CLI for panda2tw - Convert Panda CSS to Tailwind
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { cac } from "cac";
import { rewritePandaToTailwind } from "./rewrite.js";
import { extractTailwindClassesFromPandaCss } from "./css-to-tw.js";

const cli = cac("panda2tw");

cli
  .command("rewrite <file>", "Rewrite a Panda CSS file to use Tailwind classes")
  .option("-w, --write", "Write to disk instead of stdout")
  .action((file: string, options: { write?: boolean }) => {
    const filePath = resolve(file);
    const content = readFileSync(filePath, "utf-8");

    const result = rewritePandaToTailwind(content, filePath);

    if (options.write) {
      writeFileSync(filePath, result.output);
      console.log(`✅ Rewritten: ${filePath}`);
      console.log(`📊 Conversions: ${result.conversions.length}`);
    } else {
      console.log(result.output);
    }
  });

cli
  .command("convert <cssObject>", "Convert a CSS object string to Tailwind classes")
  .action((cssObjectStr: string) => {
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

cli.help();
cli.version("0.1.0");

cli.parse();
