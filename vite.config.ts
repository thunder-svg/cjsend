import { defineConfig } from "vite";
export default defineConfig({
  root: "src",
  base: "/cjsend/",
  publicDir: "../public",
  build: { outDir: "../docs", emptyOutDir: true }
});
