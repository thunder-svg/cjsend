// apps/api/src/utils/riot.ts
import type { Env } from "../worker";

const PLAT2REG: Record<string, "asia" | "americas" | "europe"> = {
  kr: "asia", jp1: "asia",
  eun1: "europe", euw1: "europe", tr1: "europe", ru: "europe",
  na1: "americas", br1: "americas", la1: "americas", la2: "americas", oc1: "americas",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function riotFetch(u: string, env: Env, init?: RequestInit): Promise<Response> {
  const headers: HeadersInit = { "Accept": "application/json", "X-Riot-Token": env.RIOT_API_KEY || "" };
  const res = await fetch(u, { ...init, headers });
  if (res.status === 429) {
    const ra = Number(res.headers.get("Retry-After") || "1");
    await sleep(Math.min(ra, 5) * 1000);
  }
  return res;
}

function parseQuery(q: string) {
  q = q.trim();
  if (!q) throw new Error("empty query");
  if (q.includes("#")) {
    const [gameName, tagLine] = q.split("#");
    return { type: "riotId" as const, gameName: gameName.trim(), tagLine: tagLine.trim() };
  } else {
    return { type: "name" as const, name: q };
  }
}

export async function getSummonerBundle(env: Env, region: string, query: string) {
  const basePlat = `https://${region}.api.riotgames.com`;
  const reg = PLAT2REG[region] || "asia";
  const baseReg = `https://${reg}.api.riotgames.com`;
  const kind = parseQuery(query);

  if (!env.RIOT_API_KEY) throw new Error("RIOT_API_KEY not set");

  if (kind.type === "riotId") {
    const acc = await riotFetch(`${baseReg}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(kind.gameName)}/${encodeURIComponent(kind.tagLine)}`, env).then((r)=>r.json<any>());
    const sum = await riotFetch(`${basePlat}/lol/summoner/v4/summoners/by-puuid/${acc.puuid}`, env).then((r)=>r.json<any>());
    return { account: acc, summoner: sum, puuid: acc.puuid as string };
  } else {
    const sum = await riotFetch(`${basePlat}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(kind.name)}`, env).then((r)=>r.json<any>());
    const acc = await riotFetch(`${baseReg}/riot/account/v1/accounts/by-puuid/${sum.puuid}`, env).then((r)=>r.json<any>());
    return { account: acc, summoner: sum, puuid: sum.puuid as string };
  }
}

export async function getRanks(env: Env, region: string, summonerId: string) {
  const basePlat = `https://${region}.api.riotgames.com`;
  const arr = await riotFetch(`${basePlat}/lol/league/v4/entries/by-summoner/${summonerId}`, env).then((r)=>r.json<any[]>());
  return (arr || []).filter(Boolean).map((e)=>({ queueType:e.queueType, tier:e.tier, rank:e.rank, leaguePoints:e.leaguePoints, wins:e.wins, losses:e.losses }));
}

export async function getRecentMatches(env: Env, region: string, puuid: string, start=0, count=10) {
  const reg = PLAT2REG[region] || "asia";
  const baseReg = `https://${reg}.api.riotgames.com`;
  const ids: string[] = await riotFetch(`${baseReg}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`, env).then((r)=>r.json<string[]>());
  const details = await Promise.all(ids.map((id) => riotFetch(`${baseReg}/lol/match/v5/matches/${id}`, env).then((r)=>r.json<any>())));
  const out = [];
  for (const m of details) {
    const p = (m.info?.participants || []).find((p: any) => p.puuid === puuid);
    if (!p) continue;
    out.push({
      id: m.metadata?.matchId || "unknown",
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      cs: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
      win: !!p.win,
      role: p.teamPosition || p.role,
      lane: p.lane,
      queueId: m.info?.queueId,
      gameDuration: m.info?.gameDuration,
      gameEndTimestamp: m.info?.gameEndTimestamp,
    });
  }
  return out;
}
