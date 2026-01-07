import { loadConfigAndCreateContext } from "@pandacss/node";
import type { Config } from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig.js";
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

/**
 * Load Tailwind config to get access to theme tokens
 * This allows matching Panda tokens against actual Tailwind tokens for all token types
 */
export async function loadTailwindContext(options: ConfigFileOptions = {}): Promise<Config> {
  try {
    // Try to dynamically import the tailwind config
    const tailwindConfigPath = require.resolve(
      options.configPath || "tailwind.config.js",
      { paths: [options.cwd || process.cwd()] }
    );

    const tailwindConfig = await import(tailwindConfigPath);
    const config = resolveConfig(tailwindConfig.default || tailwindConfig);

    return config;
  } catch (e) {
    // Return default empty config if not found
    return resolveConfig({});
  }
}
