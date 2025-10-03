// apps/api/src/handlers/health.ts
import { cors } from "../utils/cors";
export function handleHealth(origin: string) {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), { status: 200, headers: cors(origin) });
}
