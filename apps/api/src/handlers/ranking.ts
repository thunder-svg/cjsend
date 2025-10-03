// apps/api/src/handlers/ranking.ts
import type { Env } from "../worker";
import { cors } from "../utils/cors";
import { kvGetJSON, kvPut } from "../utils/cache";
import { riotFetch } from "../utils/riot";

export async function handleRanking(url: URL, env: Env, origin: string): Promise<Response> {
  const region = (url.searchParams.get("region") || "kr").toLowerCase();
  const queue = (url.searchParams.get("queue") || "RANKED_SOLO_5x5").toUpperCase();

  const key = `rank:${region}:${queue}`;
  const cached = await kvGetJSON(env.THUNDER_KV, key);
  if (cached) return new Response(JSON.stringify(cached), { status: 200, headers: cors(origin) });

  if (!env.RIOT_API_KEY || env.MOCK === "1") {
    const mock = {
      region, queue, entries: Array.from({length:100}).map((_,i)=>({ summonerId:`SUM${i}`, summonerName:`Player${i+1}`, tier:"MASTER", rank:"I", leaguePoints:100-i, wins:200-i, losses:150+i })), snapshotAt: Date.now()
    };
    await kvPut(env.THUNDER_KV, key, mock, 600);
    return new Response(JSON.stringify(mock), { status: 200, headers: cors(origin) });
  }

  const basePlat = `https://${region}.api.riotgames.com`;
  async function grab(path:string){ const r=await riotFetch(`${basePlat}${path}`, env); return r.json<any>(); }
  try {
    const [chall, gm, master] = await Promise.all([
      grab(`/lol/league/v4/challengerleagues/by-queue/${queue}`),
      grab(`/lol/league/v4/grandmasterleagues/by-queue/${queue}`),
      grab(`/lol/league/v4/masterleagues/by-queue/${queue}`),
    ]);
    const comb = [...(chall?.entries||[]), ...(gm?.entries||[]), ...(master?.entries||[])].map((e:any)=>({
      summonerId: e.summonerId, summonerName: e.summonerName, tier: e.tier, rank: e.rank, leaguePoints: e.leaguePoints, wins: e.wins, losses: e.losses,
    })).sort((a,b)=>b.leaguePoints-a.leaguePoints);
    const res = { region, queue, entries: comb, snapshotAt: Date.now() };
    await kvPut(env.THUNDER_KV, key, res, 600);
    return new Response(JSON.stringify(res), { status: 200, headers: cors(origin) });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || "ranking failed" }), { status: 500, headers: cors(origin) });
  }
}
