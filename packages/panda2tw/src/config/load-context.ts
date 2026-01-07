import { loadConfigAndCreateContext } from "@pandacss/node";
import { findPandaConfig } from "./find-config";

export interface ConfigFileOptions {
  cwd?: string;
  file?: string;
  configPath?: string;
}

/**
 * Load Panda context from:
 * - configPath when provided
 * - find panda.config.ts from file or cwd, when provided
 * - create in-memory panda context as fallback when no config file is found
 */
export async function loadPandaContext(options: ConfigFileOptions = {}) {
  const filePath = options.configPath ?? findPandaConfig({ from: options.file ?? options.cwd });

  if (!filePath) {
    // Return default context if no config found
    const { loadConfigAndCreateContext: loadDefault } = await import("@pandacss/node");
    return {
      context: await loadDefault({ cwd: options.cwd }),
      filePath: undefined,
    };
  }

  const context = await loadConfigAndCreateContext({
    configPath: filePath,
    cwd: options.cwd,
  });

  return { context, filePath };
}
