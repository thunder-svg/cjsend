// apps/web/src/routes/ranking.tsx
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { RankingResponse } from "../lib/riot";
import { RankingTable } from "../components/RankingTable";
import { ErrorBadge } from "../components/ErrorBadge";
import { Layout } from "./_layout";

export function RankingRoute() {
  const [region, setRegion] = useState("kr");
  const [queue, setQueue] = useState("RANKED_SOL0_5x5".replace("0","O")); // guard typo
  const [data, setData] = useState<RankingResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null); setData(null);
    try { setData(await api.ranking(region, queue)); } catch (e:any) { setErr(e?.message||"오류"); }
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div>
      <Layout title="랭킹">
        <div className="row">
          <select aria-label="지역" value={region} onChange={(e)=>setRegion(e.target.value)}>
            <option value="kr">KR</option><option value="na1">NA</option><option value="euw1">EUW</option>
          </select>
          <select aria-label="큐" value={queue} onChange={(e)=>setQueue(e.target.value)}>
            <option value="RANKED_SOL0_5x5".replace("0","O")>솔로랭크</option>
            <option value="RANKED_FLEX_SR">자유랭크</option>
          </select>
          <button type="button" onClick={load}>새로고침</button>
        </div>
        {err && <ErrorBadge message={err} />}
      </Layout>
      {data && <RankingTable data={data} />}
    </div>
  );
}
