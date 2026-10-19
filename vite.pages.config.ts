import { resolve } from "node:path";
import { defineConfig } from "vite";

/** Static bundle for GitHub Pages. Relative base so it works in a subfolder. */
export default defineConfig({
  base: "./",
  publicDir: false,
  build: {
    outDir: "pages-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve("pages-src/index.html"),
    },
  },
});
