import { defineConfig } from "vite";
export default defineConfig({
  base: "/cjsend/",     // 저장소 경로
  build: { outDir: "docs" } // Pages 배포 폴더
});
