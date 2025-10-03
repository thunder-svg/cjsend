-- apps/api/migrations/000_init.sql
-- 선택적 D1 초기화. 현재 사용하지 않음. 예시 스키마.
CREATE TABLE IF NOT EXISTS rankings (
  region TEXT NOT NULL,
  queue  TEXT NOT NULL,
  snapshotAt INTEGER NOT NULL,
  data TEXT NOT NULL,
  PRIMARY KEY (region, queue)
);
