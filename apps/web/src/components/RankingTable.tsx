// apps/web/src/components/RankingTable.tsx
import React from "react";
import type { RankingResponse } from "../lib/riot";
import { fmt } from "../lib/fmt";

export function RankingTable({ data }: { data: RankingResponse }) {
  return (
    <div className="card">
      <h3>{data.region.toUpperCase()} • {data.queue}</h3>
      <ul className="list">
        {data.entries.slice(0,100).map((e,i)=>(
          <li key={`${e.summonerId}-${i}`}>
            <div className="flex">
              <strong>#{i+1} {e.summonerName}</strong>
              <span className="badge">{e.tier} {e.rank} {fmt(e.leaguePoints)}LP</span>
              <span className="badge">{e.wins}W {e.losses}L</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="muted">스냅샷 시각: {new Date(data.snapshotAt).toLocaleString()}</p>
    </div>
  );
}
