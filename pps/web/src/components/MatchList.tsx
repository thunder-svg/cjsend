// apps/web/src/components/MatchList.tsx
import React from "react";
import { fmt, kda } from "../lib/fmt";
import type { SearchResponse } from "../lib/riot";

export function MatchList(props: { data: SearchResponse }) {
  const matches = props.data.recentMatches || [];
  if (!matches.length) return <p className="muted">최근 전적이 없습니다.</p>;
  return (
    <ul className="list" aria-label="최근 전적 리스트">
      {matches.map((m) => (
        <li key={m.id}>
          <div className="flex">
            <strong>{m.championName}</strong>
            <span className={`badge ${m.win ? "ok" : "bad"}`}>{m.win ? "승" : "패"}</span>
            <span className="badge">{m.role || m.lane || "-"}</span>
          </div>
          <div className="flex">
            <span>K/D/A {m.kills}/{m.deaths}/{m.assists} ( {kda(m.kills, m.deaths, m.assists)} )</span>
            <span>CS {fmt(m.cs)}</span>
            <span>{Math.round((m.gameDuration || 0) / 60)}분</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
