// apps/api/src/worker.ts
import { handleHealth } from "./handlers/health";
import { handleSearch } from "./handlers/search";
import { handleMatches } from "./handlers/matches";
import { handleCompare } from "./handlers/compare";
import { handleRanking } from "./handlers/ranking";
import { cors, allow } from "./utils/cors";

export interface Env {
  THUNDER_KV: KVNamespace;
  RIOT_API_KEY?: string;
  API_BASE?: string;
  CORS_ORIGIN?: string;
  MOCK?: string; // "1" | "0"
  SENTRY_DSN?: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = allow(req.headers.get("Origin") || "", env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

    if (url.pathname === "/healthz") return handleHealth(origin);

    if (url.pathname === "/search" && req.method === "GET") return handleSearch(url, env, origin);
    if (url.pathname === "/matches" && req.method === "GET") return handleMatches(url, env, origin);
    if (url.pathname === "/compare" && req.method === "GET") return handleCompare(url, env, origin);
    if (url.pathname === "/ranking" && req.method === "GET") return handleRanking(url, env, origin);

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: cors(origin) });
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    // 간단 모드: 랭킹 스냅샷과 헬스 프리워밍은 개별 cron 파일에서 import 없이
    // 각 파일 자체의 fetch 기반으로 실행하도록 구성했으나, 최소 구현으로 noop.
  },
};
