# README.md
# Thunder • LoL 전적검색 (v1.0)
메이저 전적사이트 기준 필수 기능(검색·프로필 요약·최근 전적·비교·랭킹 스냅샷)을 Vite+React(Web)와 Cloudflare Workers(API+KV)로 구현.

## 모놀리포 구조
- apps/web: 정적 프런트. GitHub Pages 배포. `VITE_API_BASE`로 API 도메인 지정.
- apps/api: Cloudflare Workers. KV 캐시, 크론 스냅샷. `RIOT_API_KEY` 필수(실데이터).
- docs: 아키텍처, 캐시정책, 런북, 보안정책.
- tests: Vitest+Playwright 기본.

## 빠른 시작
```sh
pnpm i
pnpm -r dev
# Web: http://localhost:5173
# API: http://127.0.0.1:8787
