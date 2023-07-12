import { createMergeCss } from "@pandacss/shared";
import { cac } from "cac";
import { readFileSync } from "fs";
import { join } from "path";
import { initialInputList } from "../../../demo-code-sample";
import { extractTwFileClassList } from "./extract-tw-class-list";
import { createPandaContext } from "./panda-context";
import { rewriteTwFileContentToPanda } from "./rewrite-tw-file-content-to-panda";
import { createTailwindContext } from "./tw-context";
import { twClassListToPanda } from "./tw-to-panda";

const cli = cac("tw2panda");

cli
  .command("rewrite <file>", "Output the given file converted to panda, doesn't actually write to disk")
  .action((file) => {
    const content = readFileSync(join(process.cwd(), file), "utf-8");

    const tw = createTailwindContext(initialInputList["tailwind.config.js"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss(Object.assign(panda, { hash: false }));

    const result = rewriteTwFileContentToPanda(content, tw.context, panda, mergeCss);
    console.log(result.output);
  });

cli
  .command(
    "extract <file>",
    "Extract each tailwind candidate and show its converted output, doesn't actually write to disk",
  )
  .action((file) => {
    console.log({ file });
    const content = readFileSync(join(process.cwd(), file), "utf-8");
    const panda = createPandaContext();
    const tw = createTailwindContext(initialInputList["tailwind.config.js"]);
    const { mergeCss } = createMergeCss(Object.assign(panda, { hash: false }));

    const list = extractTwFileClassList(content, tw.context, panda, mergeCss);
    console.log(list.map(({ node, ...item }) => item));
  });

cli
  .command("convert <classList>", "Example: inline-flex disabled:pointer-events-none underline-offset-4")
  .action((classList) => {
    const result = twClassListToPanda(classList);
    console.log("input:", classList);
    console.log("output:\n");
    console.log(JSON.stringify(result, null, 2));
  });

cli.help();
cli.parse();
