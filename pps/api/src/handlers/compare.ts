// apps/api/src/handlers/compare.ts
import type { Env } from "../worker";
import { cors } from "../utils/cors";
import { getSummonerBundle, getRanks, getRecentMatches } from "../utils/riot";
import { summarize } from "../utils/summarize";

export async function handleCompare(url: URL, env: Env, origin: string): Promise<Response> {
  const region = (url.searchParams.get("region") || "kr").toLowerCase();
  const leftQ = (url.searchParams.get("left") || "").trim();
  const rightQ = (url.searchParams.get("right") || "").trim();
  const mockParam = url.searchParams.get("mock");
  const mock = mockParam ? mockParam === "1" : env.MOCK === "1";

  if (!leftQ || !rightQ) return new Response(JSON.stringify({ error: "left/right required" }), { status: 400, headers: cors(origin) });

  if (mock || !env.RIOT_API_KEY) {
    const mk = (name:string) => ({
      input: { query: name, region, mock: true },
      summoner: { id:"X", puuid:"Y", name, gameName:name, tagLine:"KR1", profileIconId:1, summonerLevel:200 },
      ranks: [{queueType:"RANKED_SOLO_5x5",tier:"MASTER",rank:"I",leaguePoints:100,wins:100,losses:90}],
      recentMatches: Array.from({length:10}).map((_,i)=>({id:`M${i}`,championName:["Ahri","LeeSin","Lux"][i%3],kills:6,Deaths:4,assists:7,cs:160+i,win:i%2===0} as any)),
      summary: { recent: { wins:5, losses:5, kills:60, deaths:40, assists:70, avgCs:165 } }
    });
    return new Response(JSON.stringify({ region, left: mk(leftQ), right: mk(rightQ) }), { status: 200, headers: cors(origin) });
  }

  try {
    const [L, R] = await Promise.all([getSummonerBundle(env, region, leftQ), getSummonerBundle(env, region, rightQ)]);
    const [lRanks, rRanks] = await Promise.all([getRanks(env, region, L.summoner.id), getRanks(env, region, R.summoner.id)]);
    const [lMat, rMat] = await Promise.all([getRecentMatches(env, region, L.puuid), getRecentMatches(env, region, R.puuid)]);
    const left = { input:{query:leftQ,region,mock:false}, summoner:{ id:L.summoner.id, puuid:L.puuid, name:L.summoner.name, gameName:L.account.gameName, tagLine:L.account.tagLine, profileIconId:L.summoner.profileIconId, summonerLevel:L.summoner.summonerLevel }, ranks:lRanks, recentMatches:lMat, summary:summarize(lMat) };
    const right= { input:{query:rightQ,region,mock:false}, summoner:{ id:R.summoner.id, puuid:R.puuid, name:R.summoner.name, gameName:R.account.gameName, tagLine:R.account.tagLine, profileIconId:R.summoner.profileIconId, summonerLevel:R.summoner.summonerLevel }, ranks:rRanks, recentMatches:rMat, summary:summarize(rMat) };
    return new Response(JSON.stringify({ region, left, right }), { status: 200, headers: cors(origin) });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || "compare failed" }), { status: 500, headers: cors(origin) });
  }
}
