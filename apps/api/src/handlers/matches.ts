// apps/api/src/handlers/matches.ts
import type { Env } from "../worker";
import { cors } from "../utils/cors";
import { getSummonerBundle, getRecentMatches } from "../utils/riot";

export async function handleMatches(url: URL, env: Env, origin: string): Promise<Response> {
  const region = (url.searchParams.get("region") || "kr").toLowerCase();
  const query = (url.searchParams.get("query") || "").trim();
  const puuid = (url.searchParams.get("puuid") || "").trim();
  const start = Number(url.searchParams.get("start") || "0");
  const count = Number(url.searchParams.get("count") || "10");

  if (!query && !puuid) return new Response(JSON.stringify({ error: "query or puuid required" }), { status: 400, headers: cors(origin) });

  try {
    const thePuuid = puuid || (await getSummonerBundle(env, region, query)).puuid;
    const matches = await getRecentMatches(env, region, thePuuid, start, count);
    return new Response(JSON.stringify({ region, puuid: thePuuid, start, count, matches }), { status: 200, headers: cors(origin) });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || "matches failed" }), { status: 500, headers: cors(origin) });
  }
}
