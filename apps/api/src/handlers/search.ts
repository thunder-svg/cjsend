// apps/api/src/handlers/search.ts
import type { Env } from "../worker";
import { cors } from "../utils/cors";
import { getSummonerBundle, getRanks, getRecentMatches } from "../utils/riot";
import { summarize } from "../utils/summarize";
import { kvGetJSON, kvPut } from "../utils/cache";

export async function handleSearch(url: URL, env: Env, origin: string): Promise<Response> {
  const region = (url.searchParams.get("region") || "kr").toLowerCase();
  const query = (url.searchParams.get("query") || "").trim();
  const mockParam = url.searchParams.get("mock");
  const mock = mockParam ? mockParam === "1" : env.MOCK === "1";

  if (!query) return new Response(JSON.stringify({ error: "query required" }), { status: 400, headers: cors(origin) });

  if (mock || !env.RIOT_API_KEY) {
    const MOCK = {
      input: { query, region, mock: true },
      summoner: { id: "SUMMOCK", puuid: "PUUIDMOCK", name: "코뚱잉", gameName: "코뚱잉", tagLine: "KR1", profileIconId: 1234, summonerLevel: 300 },
      ranks: [
        { queueType: "RANKED_SOLO_5x5", tier: "MASTER", rank: "I", leaguePoints: 120, wins: 210, losses: 198 },
        { queueType: "RANKED_FLEX_SR", tier: "DIAMOND", rank: "II", leaguePoints: 56, wins: 80, losses: 70 }
      ],
      recentMatches: Array.from({length:10}).map((_,i)=>({ id:`KR_MOCK_${i}`, championName:["Ahri","LeeSin","Jinx","Aatrox","Lux"][i%5], kills:5+(i%7), deaths:3+(i%5), assists:6+(i%9), cs:150+i*3, win:i%2===0, role:["MID","JUNGLE","BOTTOM","TOP","SUPPORT"][i%5], lane:["MIDDLE","JUNGLE","BOTTOM","TOP","UTILITY"][i%5], queueId:420, gameDuration:1800+i*10, gameEndTimestamp:Date.now()-i*3600_000 })),
    };
    const res = { ...MOCK, summary: summarize(MOCK.recentMatches) };
    return new Response(JSON.stringify(res), { status: 200, headers: cors(origin) });
  }

  const key = `sum:${region}:${query.toLowerCase()}`;
  const cached = await kvGetJSON(env.THUNDER_KV, key);
  if (cached) return new Response(JSON.stringify(cached), { status: 200, headers: cors(origin) });

  try {
    const { account, summoner, puuid } = await getSummonerBundle(env, region, query);
    const ranks = await getRanks(env, region, summoner.id);
    const recentMatches = await getRecentMatches(env, region, puuid);
    const res = {
      input: { query, region, mock: false },
      summoner: { id: summoner.id, puuid, name: summoner.name, gameName: account.gameName, tagLine: account.tagLine, profileIconId: summoner.profileIconId, summonerLevel: summoner.summonerLevel },
      ranks,
      recentMatches,
      summary: summarize(recentMatches),
    };
    await kvPut(env.THUNDER_KV, key, res, 300);
    return new Response(JSON.stringify(res), { status: 200, headers: cors(origin) });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || "search failed" }), { status: 500, headers: cors(origin) });
  }
}
