import { defineConfig } from "vite";

export default defineConfig({
  root: "src",                // 엔트리를 src로
  base: "/cjsend/",           // GH Pages 하위 경로
  publicDir: "../public",     // public은 저장소 루트에 유지
  build: { outDir: "../docs", emptyOutDir: true } // 산출물은 docs/
});
