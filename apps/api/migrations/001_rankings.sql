-- apps/api/migrations/001_rankings.sql
-- 랭킹 스냅샷 인덱스 예시
CREATE INDEX IF NOT EXISTS idx_rankings_snapshot ON rankings(snapshotAt);
