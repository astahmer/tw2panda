import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/cli.ts", "src/index.ts", "src/config.ts"],
  outDir: "dist",
  dts: true,
  clean: true,
  format: ["cjs", "esm"],
});
