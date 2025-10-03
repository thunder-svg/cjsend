# docs/SECURITY.md
# 보안
- CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:`.
- CORS: 화이트리스트만 허용.
- 입력검증: zod 없이도 서버측 정규화. HTML escape 렌더.
- 로깅: PII 마스킹. 키/토큰 로그 금지.
