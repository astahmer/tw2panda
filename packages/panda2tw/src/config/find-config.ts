import findUp from "escalade/sync";

const configs = [".ts", ".js", ".mjs", ".cjs"];
const pandaConfigRegex = new RegExp(`panda.config(${configs.join("|")})$`);

const isPandaConfig = (file: string) => pandaConfigRegex.test(file);

export type ConfigFileOptions = {
  cwd?: string;
  file?: string | undefined;
  configPath?: string | undefined;
};

export function findPandaConfig({ from }: { from?: string }) {
  if (!from) return undefined;
  return findUp(from, (_dir, paths) => {
    return paths.find(isPandaConfig);
  });
}
