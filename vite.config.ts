import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactClickToComponent } from "vite-plugin-react-click-to-component";

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import path from "node:path";
import * as url from "node:url";

const dirname = url.fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), reactClickToComponent()],
  ssr: {
    external: [
      "lodash.merge",
      "postcss-nested",
      "camelcase-css",
      "postcss-discard-duplicates",
      "postcss-discard-empty",
      "postcss-merge-rules",
      "postcss-normalize-whitespace",
      "postcss-selector-parser",
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ process: true })],
    },
  },
  resolve: {
    alias: {
      module: path.join(dirname, "./module.shim.ts"),
      crosspath: "path-browserify",
    },
  },
});
