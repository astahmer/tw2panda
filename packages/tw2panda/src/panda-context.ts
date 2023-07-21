import { createGenerator } from "@pandacss/generator";
import { mergeConfigs } from "@pandacss/config";
import { createProject } from "@pandacss/parser";
import { preset as presetBase } from "@pandacss/preset-base";
import { preset as presetTheme } from "@pandacss/preset-panda";
import { createHooks } from "hookable";

import type {
  Artifact,
  Config,
  ConfigResultWithHooks,
  Dict,
  PandaHookable,
  ParserResultType,
  PatternConfig,
  PatternHelpers,
  RecipeConfig,
  RequiredBy,
  SystemStyleObject,
  TSConfig,
} from "@pandacss/types";
import type { UnwrapExtend } from "@pandacss/types/dist/shared";
import type { Conditions, Utility, Recipes, StylesheetOptions, Stylesheet } from "@pandacss/core";
import type { TokenDictionary } from "@pandacss/token-dictionary";
import type { Root } from "postcss";

const createContext = (conf: ConfigResultWithHooks) => {
  const generator = createGenerator({
    ...conf,
    config: mergeConfigs([presetBase, presetTheme as any, conf.config]),
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
    ...(generator as any as Generator),
    project: {
      ...project,
      addSourceFile: (file: string, content: string) => {
        files.set(file, content);
        return project.addSourceFile(file, content);
      },
    },
  };
};

/**
 * This is a lightweight/in-memory version of the panda context, that doesn't require filesystem access
 * For a more feature-complete version, use `loadConfigAndCreateContext` from `@pandacss/node`
 * Mostly used for testing, also used for the `convert` command in the CLI with `twClassListToPanda`
 */
export const createPandaContext = (conf?: Partial<ConfigResultWithHooks>) => {
  return createContext({
    hooks: createHooks() as any,
    dependencies: [],
    path: "",
    ...conf,
    config: {
      cwd: "",
      include: [],
      outdir: "styled-system",
      ...conf?.config,
    },
  });
};
export interface PandaContext extends ReturnType<typeof createPandaContext> {}

type Generator = {
  getArtifacts: () => Artifact[];
  getCss: (options: { files: string[]; resolve?: boolean | undefined }) => string;
  getParserCss: (result: ParserResultType) => string | undefined;
  messages: {
    artifactsGenerated: () => string;
    configExists: (cmd: string) => string;
    thankYou: () => string;
    codegenComplete: () => string;
    noExtract: () => string;
    watch: () => string;
    buildComplete: (count: number) => string;
    configWatch: () => string;
  };
  parserOptions: {
    importMap: {
      css: string;
      recipe: string;
      pattern: string;
      jsx: string;
    };
    jsx: {
      factory: string;
      isStyleProp: (key: string) => boolean;
      nodes: Array<JsxRecipeNode | JsxPatternNode>;
    };
    getRecipesByJsxName: (jsxName: string) => RecipeNode[];
  };
  patterns: {
    transform: (name: string, data: Dict) => SystemStyleObject;
    nodes: {
      type: "pattern";
      name: string;
      props: string[];
      baseName: string;
    }[];
    patterns: Record<string, PatternConfig>;
    getConfig: (name: string) => PatternConfig;
    getNames: (name: string) => {
      name: string;
      upperName: string;
      dashName: string;
      styleFnName: string;
      jsxName: string;
    };
    details: JsxPatternNode[];
    getFnName: (jsx: string) => string;
    isEmpty: () => boolean;
  };
  jsx: JsxEngine;
  paths: {
    get: (file?: string | undefined) => string[];
    root: string[];
    css: string[];
    token: string[];
    types: string[];
    recipe: string[];
    pattern: string[];
    chunk: string[];
    outCss: string[];
    jsx: string[];
  };
  file: {
    ext(file: string): string;
    import(mod: string, file: string): string;
    export(file: string): string;
  };
  isTemplateLiteralSyntax: boolean;
  studio: {
    outdir: string;
    logo?: string | undefined;
    inject?:
      | {
          head?: string | undefined;
          body?: string | undefined;
        }
      | undefined;
  };
  hash: {
    tokens: boolean | undefined;
    className: boolean | undefined;
  };
  prefix: {
    tokens: string | undefined;
    className: string | undefined;
  };
  tokens: TokenDictionary;
  utility: Utility;
  properties: string[];
  isValidProperty: (key: string) => boolean;
  recipes: Recipes;
  conditions: Conditions;
  createSheetContext: () => StylesheetContext;
  createSheet: (options?: Pick<StylesheetOptions, "content"> | undefined) => Stylesheet;
  hooks: PandaHookable;
  path: string;
  config: UnwrapExtend<RequiredBy<Config, "include" | "outdir" | "cwd">>;
  tsconfig?: TSConfig | undefined;
  tsconfigFile?: string | undefined;
  dependencies: string[];
};

type JsxEngine = {
  factoryName: string;
  upperName: string;
  typeName: string;
  componentName: string;
  framework: "react" | "solid" | "preact" | "vue" | "qwik" | undefined;
};

type JsxRecipeNode = {
  type: "recipe";
  name: string;
  props: string[];
  baseName: string;
  jsx: (string | RegExp)[];
  match: RegExp;
};

type JsxPatternNode = {
  type: "pattern";
  name: string;
  props: string[];
  baseName: string;
};

type RecipeNode = {
  /**
   * The name of the recipe
   */
  name: string;
  /**
   * The keys of the variants
   */
  variantKeys: string[];
  /**
   * The map of the variant keys to their possible values
   */
  variantKeyMap: Record<string, string[]>;
  /**
   * The jsx keys or regex to match the recipe
   */
  jsx: (string | RegExp)[];
  /**
   * The name of the recipe in upper case
   */
  upperName: string;
  /**
   * The name of the recipe in dash case
   */
  dashName: string;
  /**
   * The name of the recipe in camel case
   */
  jsxName: string;
  /**
   * The regex to match the recipe
   */
  match: RegExp;
  /**
   * The transformed recipe config
   */
  config: RecipeConfig;
  /**
   * The function to split the props
   */
  splitProps: (props: Dict) => [Dict, Dict];
};

type StylesheetContext = {
  root: Root;
  utility: Utility;
  conditions: Conditions;
  helpers: PatternHelpers;
  hash?: boolean;
  transform?: AtomicRuleTransform;
};
type AtomicRuleTransform = (prop: string, value: any) => TransformResult;
type TransformResult = {
  layer?: string;
  className: string;
  styles: Dict;
};
