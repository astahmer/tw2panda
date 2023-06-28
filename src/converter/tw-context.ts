import type { Config } from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig";
// @ts-expect-error Types added below
import { createContext as createContextRaw } from "tailwindcss/lib/lib/setupContextUtils";
// @ts-expect-error Types added below
import { resolveMatches as resolveMatchesRaw } from "tailwindcss/lib/lib/generateRules";

import { evalTheme } from "./tw-eval-theme";
import type { TailwindContext, TailwindMatch } from "./tw-types";

const createContext = createContextRaw as (config: Config) => TailwindContext;

export const createTailwindContext = (themeContent: string) => {
  console.time("resolveConfig");
  const evaluatedTheme = evalTheme(themeContent) ?? {};
  const userTheme = {
    ...evaluatedTheme,
    corePlugins: {
      ...evaluatedTheme.corePlugins,
      preflight: false,
    },
  };

  const config = resolveConfig(userTheme);
  console.timeEnd("resolveConfig");

  const context = createContext(config as Config);

  return { config, context };
};

export const resolveMatches = resolveMatchesRaw as (
  candidate: string,
  context: TailwindContext
) => Iterable<TailwindMatch>;
