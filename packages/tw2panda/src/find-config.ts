import findUp from "escalade/sync";
import { resolve } from "path";

// Adapted from https://github.com/chakra-ui/panda/blob/b58daf4276e47aaad536b8327c7a27f48a4cdc2e/packages/config/src/find-config.ts#L4

const configs = [".ts", ".js", ".mjs", ".cjs"];
const pandaConfigRegex = new RegExp(`panda.config(${configs.join("|")})$`);
const tailwindConfigRegex = new RegExp(`tailwind.config(${configs.join("|")})$`);

const isPandaConfig = (file: string) => pandaConfigRegex.test(file);
const isTailwindConfig = (file: string) => tailwindConfigRegex.test(file);

export type ConfigFileOptions = {
  cwd: string;
  file?: string;
};

export function findPandaConfig({ cwd, file }: ConfigFileOptions) {
  if (file) return resolve(cwd, file);
  return findUp(cwd, (_dir, paths) => {
    return paths.find(isPandaConfig);
  });
}

export function findTailwindConfig({ cwd, file }: ConfigFileOptions) {
  if (file) return resolve(cwd, file);
  return findUp(cwd, (_dir, paths) => {
    return paths.find(isTailwindConfig);
  });
}
