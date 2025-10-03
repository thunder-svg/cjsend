# docs/CACHE_POLICY.md
# 캐시 정책
- KV TTL: 기본 300s(요약/검색), 5~30분(랭킹 스냅샷), 1일(DDragon 메타).
- 헤더: `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`.
- 키: `sum:<region>:<query>`, `match_ids:<region>:<puuid>`, `match:<id>`, `rank:<region>:<queue>`, `dd_ver`, `meta:*`.
- 요청 합치기: 동일 키 동시 요청은 전역 Promise 공유.
