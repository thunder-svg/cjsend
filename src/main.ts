import "./style.css";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://yee.mfleon32.workers.dev";

type MatchRow = {
  win: boolean; k: number; d: number; a: number;
  cs: number; duration: number; champion: string; queue: string;
};

function render() {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) return;
  root.innerHTML = `
    <main style="max-width:980px;margin:24px auto;padding:16px">
      <h1 style="margin:0 0 12px">Thunder</h1>

      <form id="searchForm" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input id="riotId" placeholder="GameName#TagLine" autocomplete="off"
               style="flex:1;min-width:260px;padding:8px;border:1px solid #ccc;border-radius:6px"/>
        <select id="platform" style="padding:8px;border:1px solid #ccc;border-radius:6px">
          <option value="kr">kr</option>
          <option value="na1">na1</option>
          <option value="euw1">euw1</option>
          <option value="eun1">eun1</option>
          <option value="jp1">jp1</option>
          <option value="oc1">oc1</option>
        </select>
        <button id="searchBtn" type="submit"
                style="padding:8px 12px;border:1px solid #ccc;border-radius:6px;cursor:pointer">검색</button>
      </form>

      <p id="msg" role="status" style="min-height:1.2em;margin:12px 0 0"></p>
      <pre id="out" style="white-space:pre-wrap;overflow:auto;border:1px solid #eee;border-radius:8px;padding:12px;margin-top:8px"></pre>

      <section id="summarySec" style="margin-top:16px">
        <h2 style="font-size:18px;margin:0 0 8px">요약</h2>
        <div id="stats" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px">
          ${["경기", "승률", "평균 K/D/A", "평균 KDA", "평균 CS", "평균 길이"].map(l =>
            `<div style="border:1px solid #444;border-radius:8px;padding:10px">
               <div style="opacity:.7;font-size:12px">${l}</div>
               <div id="stat-${encodeURIComponent(l)}" style="font-weight:600;margin-top:4px">-</div>
             </div>`
          ).join("")}
        </div>
      </section>

      <section id="matchesSec" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <h2 style="font-size:18px;margin:0">최근 경기</h2>
          <div style="display:flex;gap:8px;align-items:center">
            <label style="font-size:12px;opacity:.8">큐</label>
            <select id="queueFilter" style="padding:6px;border:1px solid #ccc;border-radius:6px">
              <option value="all">전체</option>
              <option value="ranked">랭크</option>
              <option value="aram">ARAM</option>
              <option value="arena">Arena</option>
              <option value="urf">URF</option>
              <option value="normal">일반</option>
            </select>
            <button id="prevBtn" type="button" style="padding:6px 10px;border:1px solid #ccc;border-radius:6px;cursor:pointer">이전</button>
            <span id="pageInfo" style="min-width:80px;text-align:center;font-size:12px;opacity:.8">-</span>
            <button id="nextBtn" type="button" style="padding:6px 10px;border:1px solid #ccc;border-radius:6px;cursor:pointer">다음</button>
          </div>
        </div>
        <div id="matches" style="margin-top:8px"></div>
      </section>
    </main>`;
}

function init() {
  render();

  const msg = document.getElementById("msg")!;
  const out = document.getElementById("out")!;
  const ipt = document.getElementById("riotId") as HTMLInputElement;
  const form = document.getElementById("searchForm") as HTMLFormElement;
  const btn = document.getElementById("searchBtn") as HTMLButtonElement;
  const platSel = document.getElementById("platform") as HTMLSelectElement;
  const matchesBox = document.getElementById("matches") as HTMLDivElement;
  const qFilter = document.getElementById("queueFilter") as HTMLSelectElement;
  const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
  const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLSpanElement;

  const savedPlat = localStorage.getItem("thunder:platform") || "kr";
  if ([...platSel.options].some(o => o.value === savedPlat)) platSel.value = savedPlat;

  const setMsg = (t: string) => (msg.textContent = t);
  const print = (v: unknown) =>
    (out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2));

  let inflight: AbortController | null = null;
  let start = 0;
  const pageSize = 10;
  let lastRows: any[] = [];

  async function search(riotId: string, platform: string) {
    inflight?.abort();
    inflight = new AbortController();

    setMsg("조회 중");
    print("");
    matchesBox.innerHTML = "";
    fillSummary(null);
    btn.disabled = true;
    start = 0;

    const t0 = performance.now();
    const url = `${API_BASE}/summoner?riotId=${encodeURIComponent(riotId)}&platform=${platform}`;

    try {
      const res = await fetch(url, { signal: inflight.signal, headers: { Accept: "application/json" } });
      const dt = Math.round(performance.now() - t0);
      let data: any = {}; try { data = await res.json(); } catch {}
      if (!res.ok) { setMsg(`오류 ${res.status} · ${dt}ms`); print(data || res.statusText); return; }
      setMsg(`완료 · ${dt}ms${data?.cached ? " · cache" : ""}`);
      print(data);

      await loadMatches();
    } catch (err: any) {
      const aborted = err?.name === "AbortError";
      setMsg(aborted ? "타임아웃 10s" : "네트워크 오류");
      print(String(err));
    } finally {
      btn.disabled = false;
    }
  }

  async function loadMatches() {
    const riotId = (ipt.value || "").trim();
    const platform = platSel.value;
    pageInfo.textContent = `로딩…`;
    matchesBox.innerHTML = "";

    const mres = await fetch(`${API_BASE}/matches?riotId=${encodeURIComponent(riotId)}&platform=${platform}&count=${pageSize}&start=${start}`);
    const mdata: any = await mres.json().catch(() => ({}));
    if (!(mres.ok && Array.isArray(mdata.matches))) {
      matchesBox.textContent = `경기 불러오기 실패 ${mres.status}`;
      pageInfo.textContent = "-";
      prevBtn.disabled = start === 0;
      nextBtn.disabled = true;
      return;
    }
    lastRows = mdata.matches;
    renderMatches();
  }

  function renderMatches() {
    const rows = applyFilter(lastRows, qFilter.value);
    matchesBox.innerHTML = toTable(rows);
    fillSummary(rows);
    const page = start / pageSize + 1;
    pageInfo.textContent = `페이지 ${page}`;
    prevBtn.disabled = start === 0;
    nextBtn.disabled = lastRows.length < pageSize; // 더 없으면 비활성
  }

  function applyFilter(rows: any[], f: string) {
    if (f === "all") return rows;
    const pick = (ids: number[]) => rows.filter(r => ids.includes(r.queueId));
    switch (f) {
      case "ranked": return pick([420, 440]);
      case "aram":   return pick([450]);
      case "arena":  return pick([1700]);
      case "urf":    return pick([1900]);
      case "normal": return pick([400, 430]);
      default: return rows;
    }
  }

  function fillSummary(rows: MatchRow[] | null) {
    const q = (id: string) => document.getElementById(`stat-${encodeURIComponent(id)}`)!;
    if (!rows || rows.length === 0) {
      ["경기","승률","평균 K/D/A","평균 KDA","평균 CS","평균 길이"].forEach(k => q(k).textContent = "-");
      return;
    }
    const n = rows.length;
    const wins = rows.filter(r => r.win).length;
    const kills = rows.reduce((s,r)=>s+r.k,0);
    const deaths = rows.reduce((s,r)=>s+r.d,0);
    const assists = rows.reduce((s,r)=>s+r.a,0);
    const cs = rows.reduce((s,r)=>s+r.cs,0);
    const dur = rows.reduce((s,r)=>s+r.duration,0);

    const wr = (wins*100/n).toFixed(1) + "%";
    const kdastr = `${(kills/n).toFixed(1)}/${(deaths/n).toFixed(1)}/${(assists/n).toFixed(1)}`;
    const kda = deaths ? ((kills+assists)/deaths).toFixed(2) : "Perfect";
    const avCs = (cs/n).toFixed(1);
    const avMin = Math.round(dur/n/60) + "m";

    q("경기").textContent = String(n);
    q("승률").textContent = wr;
    q("평균 K/D/A").textContent = kdastr;
    q("평균 KDA").textContent = kda;
    q("평균 CS").textContent = avCs;
    q("평균 길이").textContent = avMin;
  }

  function toTable(rows: any[]) {
    const th = ["챔피언", "승패", "K/D/A", "KDA", "CS", "골드", "큐", "길이"];
    const trs = rows.map((r) => {
      const kda = typeof r.kda === "string" ? r.kda : (r.kda ?? "").toString();
      const win = r.win ? "승" : "패";
      const dur = Math.round((r.duration || 0) / 60) + "m";
      return `<tr>
        <td>${r.champion}</td>
        <td>${win}</td>
        <td>${r.k}/${r.d}/${r.a}</td>
        <td>${kda}</td>
        <td>${r.cs}</td>
        <td>${r.gold}</td>
        <td>${r.queue}</td>
        <td>${dur}</td>
      </tr>`;
    }).join("");
    return `<table style="width:100%;border-collapse:collapse">
      <thead><tr>${th.map(h=>`<th style="text-align:left;border-bottom:1px solid #444;padding:6px">${h}</th>`).join("")}</tr></thead>
      <tbody>${trs || `<tr><td colspan="8" style="padding:8px">기록 없음</td></tr>`}</tbody>
    </table>`;
  }

  function submit() {
    const v = (ipt?.value || "").trim();
    const platform = platSel.value;
    if (!v.includes("#")) { setMsg("형식: GameName#TagLine"); return; }
    localStorage.setItem("thunder:lastRiotId", v);
    localStorage.setItem("thunder:platform", platform);
    search(v, platform);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  (document.getElementById("queueFilter") as HTMLSelectElement)
    .addEventListener("change", () => renderMatches());
  prevBtn.addEventListener("click", () => { if (start >= pageSize) { start -= pageSize; loadMatches(); } });
  nextBtn.addEventListener("click", () => { start += pageSize; loadMatches(); });

  const q = new URLSearchParams(location.search);
  const preset =
    q.get("riotId") || q.get("q") || localStorage.getItem("thunder:lastRiotId") || "";
  if (preset) ipt.value = preset;
  if (preset) submit();
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init)
  : init();
