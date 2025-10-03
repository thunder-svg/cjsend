// apps/web/src/components/SearchForm.tsx
import React, { useEffect, useRef, useState } from "react";

export function SearchForm(props: { onSearch: (q: string, region: string, mock: boolean) => void }) {
  const { onSearch } = props;
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("kr");
  const [mock, setMock] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => { e.preventDefault(); const query=q.trim(); if(!query) return; onSearch(query, region, mock); };
  return (
    <form onSubmit={submit} aria-label="전적검색 폼">
      <label htmlFor="q">Riot ID 또는 소환사명</label>
      <div className="row">
        <input id="q" ref={inputRef} aria-label="검색어" placeholder="예: 코뚱잉#KR1 또는 코뚱잉" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="지역" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="kr">KR</option><option value="na1">NA</option><option value="euw1">EUW</option><option value="eun1">EUNE</option><option value="jp1">JP</option>
        </select>
        <button type="submit">검색</button>
      </div>
      <div className="flex">
        <label className="flex" htmlFor="mock"><input id="mock" type="checkbox" checked={mock} onChange={(e)=>setMock(e.target.checked)} />모의데이터 사용(mock)</label>
        <span className="muted">키 없이 테스트. 해제 시 실데이터.</span>
      </div>
    </form>
  );
}
