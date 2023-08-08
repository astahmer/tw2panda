import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactClickToComponent } from "vite-plugin-react-click-to-component";

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

import path from "node:path";
import * as url from "node:url";

// @ts-ignore
const dirname = url.fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), reactClickToComponent()],
  optimizeDeps: {
    include: ["escalade"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ process: true })],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: "replace-process-cwd",
          transform(code, _id) {
            const transformedCode = code.replace(/process\.cwd\(\)/g, '""');
            return {
              code: transformedCode,
              map: { mappings: "" },
            };
          },
        },
      ],
    },
  },
  resolve: {
    alias: {
      module: path.join(dirname, "./module.shim.ts"),
      path: "path-browserify",
      // pathe: "path-browserify",
      esbuild: "esbuild-wasm",
      "fs/promises": path.join(dirname, "./fs.shim.ts"),
      fs: path.join(dirname, "./fs.shim.ts"),
      process: "process/browser",
      os: "os-browserify",
      util: "util",
    },
  },
});
