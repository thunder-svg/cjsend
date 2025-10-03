# docs/ARCHITECTURE.md
# 아키텍처 개요
- Web: Vite+React. 정적 빌드. GitHub Pages 배포. Cloudflare 프록시 캐시.
- API: Cloudflare Workers. KV 캐시. 크론 스냅샷(랭킹/로테이션/DD 버전).
- 데이터 흐름: Riot ID → Account-v1 → Summoner-v4 → League-v4 → Match-v5.
- 성능: 캐시 우선, 해시 자산, JS < 200KB, 이미지 lazy.

## 모듈
- handlers: /search, /matches, /compare, /ranking, /healthz
- utils: cors, cache(coalescing), riot(backoff), rateLimit, summarize, ddragon, types
- crons: ddragon/rotation/ranking-snapshot/sanity
