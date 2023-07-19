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
import { z } from "zod";
import { bundle } from "./bundle";

const cli = cac("tw2panda");

// TODO fix conditions (prefix with _, convert to camelCase, etc.)

const withTw = z.object({ tailwind: z.string() }).partial();

cli
  .command("rewrite <file>", "Output the given file converted to panda, doesn't actually write to disk")
  .option("--tw, --tailwind <file>", "Path to tailwind.config.js")
  .action(async (file, _options) => {
    const options = withTw.parse(_options);
    const cwd = process.cwd();
    const content = readFileSync(join(cwd, file), "utf-8");

    let twConfig = initialInputList["tailwind.config.js"];
    if (options.tailwind) {
      twConfig = (await bundle(join(cwd, options.tailwind), cwd)).config as any;
    }

    const tw = createTailwindContext(twConfig);
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
  .option("--tw, --tailwind <file>", "Path to tailwind.config.js")
  .action(async (file, options) => {
    console.log({ file });
    const cwd = process.cwd();
    const content = readFileSync(join(cwd, file), "utf-8");

    let twConfig = initialInputList["tailwind.config.js"];
    if (options.tailwind) {
      twConfig = (await bundle(join(cwd, options.tailwind), cwd)).config as any;
    }

    const tw = createTailwindContext(twConfig);

    const panda = createPandaContext();
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
