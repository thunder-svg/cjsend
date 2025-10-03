// apps/web/src/routes/search.tsx
import React, { useMemo, useState } from "react";
import { SearchForm } from "../components/SearchForm";
import { ProfileCard } from "../components/ProfileCard";
import { MatchList } from "../components/MatchList";
import { api } from "../lib/api";
import type { SearchResponse } from "../lib/riot";
import { ErrorBadge } from "../components/ErrorBadge";
import { Layout } from "./_layout";

export function SearchRoute() {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSearch = async (q: string, region: string, mock: boolean) => {
    setLoading(true); setErr(null); setData(null);
    try { setData(await api.search(q, region, mock)); } catch (e:any) { setErr(e?.message||"오류"); }
    finally { setLoading(false); }
  };

  const header = useMemo(() => {
    if (!data) return "";
    return `${data?.summoner?.gameName || data?.summoner?.name}${
      data?.summoner?.tagLine ? `#${data?.summoner?.tagLine}` : ""
    }`;
  }, [data]);

  return (
    <div>
      <Layout title="전적검색">
        <SearchForm onSearch={onSearch} />
        {loading && <p className="muted">검색 중...</p>}
        {err && <ErrorBadge message={err} />}
      </Layout>
      {data && (
        <div className="grid">
          <ProfileCard header={header} data={data} />
          <div className="card">
            <h3>최근 전적</h3>
            <MatchList data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
