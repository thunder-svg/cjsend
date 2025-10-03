// apps/web/src/app.tsx
import React, { useEffect, useState } from "react";
import { SearchRoute } from "./routes/search";
import { CompareRoute } from "./routes/compare";
import { RankingRoute } from "./routes/ranking";

function useRoute() {
  const [path, setPath] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const onHash = () => setPath(location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return [path, (p: string) => (location.hash = p)] as const;
}

export default function App() {
  const [path, nav] = useRoute();
  return (
    <main>
      <header className="container">
        <h1 aria-label="Thunder 전적검색">
          <a href="#/" aria-label="홈">Thunder</a>
        </h1>
        <nav aria-label="메뉴" className="flex">
          <a href="#/" aria-current={path==="/" ? "page" : undefined}>검색</a>
          <a href="#/compare" aria-current={path==="/compare" ? "page" : undefined}>비교</a>
          <a href="#/ranking" aria-current={path==="/ranking" ? "page" : undefined}>랭킹</a>
        </nav>
      </header>
      <section className="container">
        {path === "/" && <SearchRoute />}
        {path === "/compare" && <CompareRoute />}
        {path === "/ranking" && <RankingRoute />}
      </section>
      <footer className="container muted">
        <p>Data based on Riot Games. Not endorsed by Riot Games.</p>
      </footer>
    </main>
  );
}
