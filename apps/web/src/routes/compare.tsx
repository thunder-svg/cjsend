// apps/web/src/routes/compare.tsx
import React, { useState } from "react";
import { ComparePanel } from "../components/ComparePanel";
import { api } from "../lib/api";
import type { CompareResponse } from "../lib/riot";
import { ErrorBadge } from "../components/ErrorBadge";
import { Layout } from "./_layout";

export function CompareRoute() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [region, setRegion] = useState("kr");
  const [mock, setMock] = useState(true);
  const [data, setData] = useState<CompareResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setData(null);
    try { setData(await api.compare(left, right, region, mock)); } catch (e:any) { setErr(e?.message||"오류"); }
  };

  return (
    <div>
      <Layout title="비교">
        <form onSubmit={run} className="row" aria-label="비교 폼">
          <input placeholder="왼쪽 Riot ID/이름" value={left} onChange={e=>setLeft(e.target.value)} />
          <input placeholder="오른쪽 Riot ID/이름" value={right} onChange={e=>setRight(e.target.value)} />
          <select aria-label="지역" value={region} onChange={(e)=>setRegion(e.target.value)}>
            <option value="kr">KR</option><option value="na1">NA</option><option value="euw1">EUW</option>
          </select>
          <label className="flex"><input type="checkbox" checked={mock} onChange={(e)=>setMock(e.target.checked)} />mock</label>
          <button type="submit">실행</button>
        </form>
        {err && <ErrorBadge message={err} />}
      </Layout>
      {data && <ComparePanel data={data} />}
    </div>
  );
}
