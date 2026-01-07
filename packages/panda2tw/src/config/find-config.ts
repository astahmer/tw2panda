import findUp from "escalade/sync";

// Adapted from https://github.com/chakra-ui/panda/blob/b58daf4276e47aaad536b8327c7a27f48a4cdc2e/packages/config/src/find-config.ts#L4

const configs = [".ts", ".js", ".mjs", ".cjs"];
const pandaConfigRegex = new RegExp(`panda.config(${configs.join("|")})$`);
const tailwindConfigRegex = new RegExp(`tailwind.config(${configs.join("|")})$`);

const isPandaConfig = (file: string) => pandaConfigRegex.test(file);
const isTailwindConfig = (file: string) => tailwindConfigRegex.test(file);

export type ConfigFileOptions = {
  cwd: string;
  file?: string | undefined;
  configPath?: string | undefined;
};

export function findPandaConfig({ from }: { from: string }) {
  return findUp(from, (_dir, paths) => {
    return paths.find(isPandaConfig);
  });
}

export function findTailwindConfig({ from }: { from: string }) {
  return findUp(from, (_dir, paths) => {
    return paths.find(isTailwindConfig);
  });
}
