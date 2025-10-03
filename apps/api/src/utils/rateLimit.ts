// apps/api/src/utils/rateLimit.ts
import type { Env } from "../worker";
export async function rateLimit(env: Env, key: string, limit=60, windowSec=60): Promise<boolean> {
  const now = Math.floor(Date.now()/1000);
  const bucket = `rl:${key}:${Math.floor(now/windowSec)}`;
  const cur = Number(await env.THUNDER_KV.get(bucket)) || 0;
  if (cur >= limit) return false;
  await env.THUNDER_KV.put(bucket, String(cur+1), { expirationTtl: windowSec+5 });
  return true;
}
