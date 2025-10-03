// apps/web/src/components/ProfileCard.tsx
import React from "react";
import { esc, fmt, kda } from "../lib/fmt";
import type { SearchResponse } from "../lib/riot";

export function ProfileCard(props: { header: string; data: SearchResponse }) {
  const { data, header } = props;
  const s = data.summoner;
  const ranks = data.ranks || [];
  const recent = data.summary?.recent;

  return (
    <div className="card">
      <h3 aria-label="소환사 프로필">{esc(header)}</h3>
      <div className="row">
        <div className="badge">Lv {fmt(s?.summonerLevel || 0)}</div>
        {ranks.map((r) => (
          <div key={r.queueType} className="badge">
            {r.queueType === "RANKED_SOL0_5x5".replace("0","O") ? "솔로" : "자유"} {r.tier} {r.rank} {r.leaguePoints}LP • {r.wins}W {r.losses}L
          </div>
        ))}
      </div>
      {recent && (
        <div className="row">
          <div className="badge ok">최근 {recent.wins}승</div>
          <div className="badge bad">{recent.losses}패</div>
          <div className="badge">KDA {kda(recent.kills, recent.deaths, recent.assists)}</div>
          <div className="badge">CS {fmt(recent.avgCs)}</div>
        </div>
      )}
    </div>
  );
}
