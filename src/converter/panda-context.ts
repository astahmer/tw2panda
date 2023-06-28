import { createGenerator } from "@pandacss/generator";
import { mergeConfigs } from "@pandacss/config";
import { createProject } from "@pandacss/parser";
import presetBase from "@pandacss/preset-base";
import presetTheme from "@pandacss/preset-panda";
import type { ConfigResultWithHooks } from "@pandacss/types";

import { createHooks } from "hookable";

const createContext = (conf: ConfigResultWithHooks) => {
  const generator = createGenerator({
    ...conf,
    config: mergeConfigs([presetBase, presetTheme, conf.config]),
  });
  const files = new Map<string, string>();

  const project = createProject({
    useInMemoryFileSystem: true,
    parserOptions: generator.parserOptions,
    getFiles: () => Array.from(files.keys()),
    readFile: (file: string) => files.get(file) || "",
    hooks: generator.hooks,
  });

  return {
    ...generator,
    project: {
      ...project,
      addSourceFile: (file: string, content: string) => {
        files.set(file, content);
        return project.addSourceFile(file, content);
      },
    },
  };
};

export const createPandaContext = (conf?: Partial<ConfigResultWithHooks>) => {
  return createContext({
    hooks: createHooks() as any,
    dependencies: [],
    path: "",
    config: {
      cwd: "",
      include: [],
      outdir: "styled-system",
    },
    ...conf,
  });
};
export type PandaContext = ReturnType<typeof createPandaContext>;
