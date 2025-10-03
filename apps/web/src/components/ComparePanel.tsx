// apps/web/src/components/ComparePanel.tsx
import React from "react";
import type { CompareResponse } from "../lib/riot";
import { kda, fmt } from "../lib/fmt";

export function ComparePanel({ data }: { data: CompareResponse }) {
  const a = data.left.summary.recent;
  const b = data.right.summary.recent;
  return (
    <div className="card">
      <h3>비교 결과</h3>
      <div className="row">
        <div className="card" style={{flex:1}}>
          <h4>{data.left.summoner.gameName}{data.left.summoner.tagLine?`#${data.left.summoner.tagLine}`:""}</h4>
          <p>KDA {kda(a.kills,a.deaths,a.assists)} / CS {fmt(a.avgCs)}</p>
        </div>
        <div className="card" style={{flex:1}}>
          <h4>{data.right.summoner.gameName}{data.right.summoner.tagLine?`#${data.right.summoner.tagLine}`:""}</h4>
          <p>KDA {kda(b.kills,b.deaths,b.assists)} / CS {fmt(b.avgCs)}</p>
        </div>
      </div>
    </div>
  );
}
