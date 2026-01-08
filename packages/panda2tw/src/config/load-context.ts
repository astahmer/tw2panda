import { loadConfigAndCreateContext } from "@pandacss/node";
import { createContext } from "../panda-context.js";
import { createTailwindContext } from "../tw-context.js";
import { bundle } from "../bundle.js";
import { ConfigFileOptions, findPandaConfig, findTailwindConfig } from "./find-config.js";

/**
 * Load tailwind context from:
 * - configPath when provided
 * - find tailwind.config.js from file or cwd, when provided
 * - create in-memory tailwind context as fallback when no config file is found
 */
export async function loadTailwindContext(options: ConfigFileOptions) {
  const filePath = options.configPath ?? findTailwindConfig({ from: options.file ?? options.cwd });

  if (!filePath) {
    const tw = createTailwindContext({} as any);
    return { context: Object.assign(tw.context, { config: tw.config }), filePath };
  }

  const result = await bundle(filePath, options.cwd);
  const tw = createTailwindContext(result.config as any);
  return { context: Object.assign(tw.context, { config: tw.config }), filePath };
}

/**
 * Load panda context from:
 * - configPath when provided
 * - find panda.config.js from file or cwd, when provided
 * - create in-memory panda context as fallback when no config file is found
 */
export async function loadPandaContext(options: ConfigFileOptions) {
  const filePath = options.configPath ?? findPandaConfig({ from: options.file ?? options.cwd });

  if (!filePath) {
    return { context: createContext() as ReturnType<typeof createContext>, filePath };
  }

  return {
    context: (await loadConfigAndCreateContext({ configPath: filePath, cwd: options.cwd })) as any,
    filePath,
  };
}
