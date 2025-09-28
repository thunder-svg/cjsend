import { defineConfig } from "vite";
export default {
  root: "src",
  base: "/cjsend/",
  publicDir: "../public",      // public/.nojekyll → docs로 복사됨
  build: { outDir: "../docs", emptyOutDir: true }
}
