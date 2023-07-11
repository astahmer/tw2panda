import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/cli.ts"],
  outDir: "dist",
});
