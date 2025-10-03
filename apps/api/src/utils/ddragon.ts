// apps/api/src/utils/ddragon.ts
import type { Env } from "../worker";
import { kvGetJSON, kvPut } from "./cache";

export async function getDDragonVersion(env: Env): Promise<string> {
  const key = "dd_ver";
  const cached = await kvGetJSON<string>(env.THUNDER_KV, key);
  if (cached) return cached;
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json").then(r=>r.json<string[]>());
  const ver = res[0];
  await kvPut(env.THUNDER_KV, key, ver, 86400);
  return ver;
}
