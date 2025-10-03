# docs/RUNBOOK.md
# 런북
- 429 증가: 백오프, TTL 상향, 인기 소환사 프리워밍.
- 키 만료: 401/403 발생 시 Secrets 교체.
- DDragon 변경: 버전 핀 유지, 실패 시 직전 버전 롤백.
- CORS 실패: ORIGIN 화이트리스트 재확인, OPTIONS 핸들러 점검.
