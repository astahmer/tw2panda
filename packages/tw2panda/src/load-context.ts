import { loadConfigAndCreateContext } from "@pandacss/node";
import { ConfigFileOptions, findPandaConfig, findTailwindConfig } from "./find-config";
import { PandaContext, createPandaContext } from "./panda-context";
import { createTailwindContext } from "./tw-context";
import { bundle } from "./bundle";

export async function loadTailwindContext(options: ConfigFileOptions) {
  const filePath = findTailwindConfig(options);

  if (!filePath) {
    const tw = createTailwindContext({} as any);
    return { context: Object.assign(tw.context, { config: tw.config }), filePath };
  }

  const result = await bundle(filePath, options.cwd);
  const tw = createTailwindContext(result.config as any);
  return { context: Object.assign(tw.context, { config: tw.config }), filePath };
}

export async function loadPandaContext(options: ConfigFileOptions) {
  const filePath = findPandaConfig(options);

  if (!filePath) {
    return { context: createPandaContext() as PandaContext, filePath };
  }

  return {
    context: (await loadConfigAndCreateContext({ configPath: filePath, cwd: options.cwd })) as any as PandaContext,
    filePath,
  };
}
