// apps/web/src/lib/api.ts
import ky from "ky";
import type { SearchResponse, CompareResponse, RankingResponse } from "./riot";
const API_BASE = import.meta.env.VITE_API_BASE as string;

function u(path: string, params?: Record<string,string>) {
  const url = new URL(path, API_BASE);
  if (params) for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

export const api = {
  async search(q: string, region: string, mock: boolean): Promise<SearchResponse> {
    return ky.get(u("/search", { query: q, region, mock: mock ? "1":"0" }), { timeout: 15000 }).json();
  },
  async matches(qOrPuuid: string, region: string, start=0, count=10): Promise<any> {
    const params: Record<string,string> = { region, start:String(start), count:String(count) };
    if (qOrPuuid.includes("#") || /[A-Za-z가-힣]/.test(qOrPuuid)) params.query=qOrPuuid; else params.puuid=qOrPuuid;
    return ky.get(u("/matches", params), { timeout: 15000 }).json();
  },
  async compare(left: string, right: string, region: string, mock: boolean): Promise<CompareResponse> {
    return ky.get(u("/compare", { left, right, region, mock: mock ? "1":"0" })).json();
  },
  async ranking(region: string, queue: string): Promise<RankingResponse> {
    return ky.get(u("/ranking", { region, queue })).json();
  },
};
