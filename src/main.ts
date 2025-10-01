// src/main.ts
const API_BASE = import.meta.env.VITE_API_BASE as string;

const REGION_OPTS = `
  <option value="kr">KR</option><option value="na1">NA</option>
  <option value="euw1">EUW</option><option value="eun1">EUNE</option><option value="jp1">JP</option>`;
const state = { region: "kr", queue: "RANKED_SOLO_5x5" };

const $ = (s: string, el: Document | HTMLElement = document) =>
  (el as Document).querySelector(s) as HTMLElement;
const esc = (s: any) =>
  String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[m]));
const fmt = (n: number) => Number(n || 0).toLocaleString();
const json = async <T = any>(u: string) => {
  const r = await fetch(u, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${u}`);
  return r.json() as T;
};
function addErr(e: any) {
  const b = $("#__err");
  b.hidden = false;
  const n = Number(b.dataset.n || 0) + 1;
  b.dataset.n = String(n);
  (b as HTMLElement).textContent = `${n} error`;
  console.error(e);
}
const kpi = (v: string, l: string) =>
  `<div class="kpi" style="display:flex;gap:8px;align-items:baseline"><div class="v" style="font:600 18px/1 system-ui">${v}</div><div class="muted" style="font-size:12px">${l}</div></div>`;
const avatar = (id: number | string) => `<div class="avatar">${id || ""}</div>`;

// ------ hash/query helpers ------
const getHashQuery = () => {
  const h = location.hash || "";
  const i = h.indexOf("?");
  return new URLSearchParams(i >= 0 ? h.slice(i + 1) : "");
};
const setRoute = (path: string, params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") q.set(k, String(v)); });
  location.hash = `${path}?${q.toString()}`;
};
const splitRiotInput = (s: string) => {
  const t = (s || "").trim();
  return t.includes("#") ? { riotId: t } : { name: t };
};

// ------ layout ------
const app = document.getElementById("app")!;
app.innerHTML = `
  <header class="site">
    <div class="container header-inner">
      <div class="brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12h5l3-9 3 18 3-9h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <div class="logo">Thunder</div>
      </div>
      <nav class="nav" id="nav">
        <a href="#/search">검색</a>
        <a href="#/history">전적</a>
        <a href="#/compare">비교</a>
        <a href="#/personal">개인메타</a>
        <a href="#/ladder">랭킹</a>
        <a href="#/live">라이브</a>
        <a href="#/rotations">로테이션</a>
        <a href="#/champions">챔피언</a>
      </nav>
    </div>
  </header>
  <main class="container"><section id="view"></section></main>
  <div id="__err" class="err" hidden>0 error</div>
`;

function setActiveNav() {
  const route = (location.hash || "#/search").split("?")[0];
  document.querySelectorAll("#nav a").forEach(a => {
    a.setAttribute("aria-current", (a as HTMLAnchorElement).getAttribute("href") === route ? "page" : "false");
  });
}
const routes: Record<string, () => void> = {
  "/search": viewSearch,
  "/profile": viewProfile,          // ★ NEW: 퍼머링크 프로필
  "/history": viewHistory,
  "/compare": viewCompare,
  "/personal": viewPersonal,
  "/ladder": viewLadder,
  "/live": viewLive,
  "/rotations": viewRotations,
  "/champions": viewChampions
};
function router() {
  const path = (location.hash || "#/search").replace("#", "").split("?")[0];
  setActiveNav();
  (routes[path] || viewSearch)();
}
window.addEventListener("hashchange", router);

// ----- 공통 -----
function profileHead(p: any, patch?: string) {
  return `<div class="grid g2" style="align-items:center">
    <div class="row" style="gap:12px">
      <div class="avatar">${p?.summoner?.profileIconId ?? p.iconId ?? ""}</div>
      <div>
        <div style="font-weight:700">${esc(p.name || p.gameName || "")}</div>
        <div class="muted">LV ${fmt(p?.summoner?.summonerLevel || p.level || 0)}</div>
        <div class="row" style="gap:6px;flex-wrap:wrap">
          <span class="pill">${p.ranks?.solo ? `${p.ranks.solo.tier} ${p.ranks.solo.rank} • ${p.ranks.solo.lp}LP` : "Unranked"}</span>
          ${patch ? `<span class="pill muted">패치 ${patch}</span>` : ""}
        </div>
      </div>
    </div>
  </div>`;
}

// ====== 검색(입력) ======
function viewSearch() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 8px">전적 검색</h3>
      <form id="f" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px">
        <select id="reg">${REGION_OPTS}</select>
        <input id="name" placeholder="Riot ID 예: Faker#KR1 또는 소환사명" autocomplete="off"/>
        <button type="submit">검색</button>
      </form>
      <div class="muted" style="margin-top:6px">예: KR / Faker#KR1</div>
    </div>`;
  ($("#reg") as HTMLSelectElement).value = state.region;

  v.addEventListener("submit", async e => {
    const form = e.target as HTMLFormElement;
    if (form.id !== "f") return;
    e.preventDefault();
    state.region = (form.querySelector("#reg") as HTMLSelectElement).value;
    const raw = (form.querySelector("#name") as HTMLInputElement).value.trim();
    if (!raw) return;
    const who = splitRiotInput(raw);
    setRoute("/profile", { region: state.region, ...who });
  });
}

// ====== 프로필(요약+대표챔프+라인분포) ======
async function viewProfile() {
  const v = $("#view");
  const q = getHashQuery();
  state.region = (q.get("region") || state.region).toLowerCase();
  const riotId = q.get("riotId") || "";
  const name   = q.get("name") || "";

  v.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center">
        <h3 style="margin:0">프로필 요약</h3>
        <div class="row" style="gap:8px">
          <select id="regP">${REGION_OPTS}</select>
          <a id="perma" class="pill" href="#">링크복사</a>
        </div>
      </div>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#regP") as HTMLSelectElement).value = state.region;

  const box = $("#box");
  box.innerHTML = `<div class="muted">불러오는 중…</div>`;

  try {
    // 패치
    const { version } = await json<any>(`${API_BASE}/v1/ddragon/version`);
    const patch = String(version).split(".").slice(0, 2).join(".");
    // 챔프 맵
    const dj = await json<any>(`${API_BASE}/v1/ddragon/champions?ver=${version}`);
    const key2name = Object.values(dj.data).reduce((a: any, c: any) => { a[(c as any).key] = (c as any).name; return a; }, {});

    // 프로필 + 요약
    const qp = new URLSearchParams({ region: state.region, count: "10" });
    const qs = new URLSearchParams({ region: state.region, count: "20" });
    if (riotId) { qp.set("riotId", riotId); qs.set("name", riotId); }
    else if (name) { qp.set("name", name); qs.set("name", name); }

    const [p, s]: any = await Promise.all([
      json(`${API_BASE}/v1/profile?` + qp.toString()),
      json(`${API_BASE}/v1/summary?` + qs.toString())
    ]);

    // 대표 챔프 3
    const champs = (s.top3 || []).map((t: any) =>
      `<div class="pill">${esc(key2name[String(t.championId)] || t.championId)} <span class="muted">x${t.games}</span></div>`
    ).join("");

    // 라인 분포
    const laneNames: Record<string,string> = { TOP:"탑", JUNGLE:"정글", MIDDLE:"미드", ADC:"원딜", SUPPORT:"서폿", UNKNOWN:"기타" };
    const lanes = Object.entries(s.lanes || {}).sort((a,b)=>Number(b[1])-Number(a[1]))
      .map(([k,c]) => `<span class="pill">${laneNames[k] || k} <span class="muted">${c}</span></span>`).join("");

    // KPI
    const kpis = `
      ${kpi(`${s.winrate}%`, "승률")}
      ${kpi(String(s.kda), "KDA")}
      ${kpi(fmt(s.averages.cs), "평균 CS")}
      ${kpi(fmt(s.averages.gold), "평균 골드")}
      ${kpi(fmt(s.averages.dmg), "평균 딜")}
    `;

    box.innerHTML = `
      <div class="card">${profileHead(p, patch)}</div>
      <div class="card"><div class="row" style="gap:16px;flex-wrap:wrap">${kpis}</div></div>
      <div class="card">
        <h4 style="margin:0 0 6px">대표 챔피언</h4>
        <div class="row" style="gap:6px;flex-wrap:wrap">${champs || `<span class="muted">데이터 없음</span>`}</div>
      </div>
      <div class="card">
        <h4 style="margin:0 0 6px">라인 분포</h4>
        <div class="row" style="gap:6px;flex-wrap:wrap">${lanes || `<span class="muted">데이터 없음</span>`}</div>
      </div>
    `;

    // 퍼머링크
    const perma = $("#perma") as HTMLAnchorElement;
    const link = `#/profile?region=${encodeURIComponent(state.region)}&${riotId ? `riotId=${encodeURIComponent(riotId)}` : `name=${encodeURIComponent(name||p?.gameName||"")}`}`;
    perma.href = link;
    perma.addEventListener("click", (e) => {
      e.preventDefault();
      const full = location.origin + location.pathname + link;
      navigator.clipboard?.writeText(full);
      perma.textContent = "복사됨!";
      setTimeout(()=> perma.textContent = "링크복사", 1000);
    });

    // 지역 변경 시 라우트 갱신
    $("#regP").addEventListener("change", (e) => {
      const reg = (e.target as HTMLSelectElement).value;
      setRoute("/profile", { region: reg, ...(riotId ? {riotId} : {name: name || p?.gameName || ""}) });
    });
  } catch (err) { addErr(err); box.innerHTML = `<div class="muted">불러오기 실패</div>`; }
}

// ====== 전적 히스토리 ======
function viewHistory() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 8px">전적 히스토리</h3>
      <form id="fh" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px;align-items:center">
        <select id="regH">${REGION_OPTS}</select>
        <input id="nameH" placeholder="Riot ID" autocomplete="off"/>
        <button type="submit">조회</button>
      </form>
      <div class="row" style="margin-top:8px;gap:8px">
        <select id="queue"><option value="">큐: 전체</option><option value="420">솔로랭크</option><option value="440">자유랭크</option><option value="450">칼바람</option><option value="430">일반</option></select>
        <select id="champ"><option value="">챔피언: 전체</option></select>
        <select id="result"><option value="">결과: 전체</option><option value="win">승</option><option value="lose">패</option></select>
        <select id="patch"><option value="">패치: 전체</option></select>
        <button id="prev" type="button">이전</button>
        <button id="next" type="button">다음</button>
      </div>
      <div id="box" style="margin-top:10px"></div>
    </div>`;

  ($("#regH") as HTMLSelectElement).value = state.region;
  let cursor = 0;
  const PAGE = 10;
  let currentName = "";

  (async () => {
    try {
      const ver: any = await json(API_BASE + "/v1/ddragon/version");
      const currentPatch = String(ver.version).split(".").slice(0, 2).join(".");
      const patchSel = $("#patch") as HTMLSelectElement;
      patchSel.innerHTML = `<option value="">패치: 전체</option><option value="${currentPatch}">${currentPatch}</option>`;
      const dj: any = await json(API_BASE + `/v1/ddragon/champions?ver=${ver.version}`);
      const arr = Object.values(dj.data as any).sort((a: any, b: any) => a.name.localeCompare(b.name, "ko"));
      const opt = ['<option value="">챔피언: 전체</option>'].concat(
        arr.map((c: any) => `<option value="${c.key}">${esc(c.name)}</option>`)
      ).join("");
      ($("#champ") as HTMLSelectElement).innerHTML = opt;
    } catch (err) { addErr(err); }
  })();

  v.addEventListener("submit", async e => {
    const form = e.target as HTMLFormElement;
    if (form.id !== "fh") return;
    e.preventDefault();
    const btn = form.querySelector("button") as HTMLButtonElement;
    btn.disabled = true;
    try {
      state.region = (form.querySelector("#regH") as HTMLSelectElement).value;
      currentName = (form.querySelector("#nameH") as HTMLInputElement).value.trim();
      if (!currentName) return;
      cursor = 0;
      await load();
    } catch (err) { addErr(err); }
    finally { btn.disabled = false; }
  });

  v.addEventListener("click", async e => {
    const t = e.target as HTMLElement;
    if (t.id === "prev") { if (cursor >= PAGE) { cursor -= PAGE; await load(); } }
    if (t.id === "next") { cursor += PAGE; await load(); }
  });

  v.addEventListener("change", async e => {
    const t = e.target as HTMLSelectElement;
    if (["queue", "champ", "result", "patch"].includes(t.id)) {
      cursor = 0;
      if (currentName) await load();
    }
  });

  async function load() {
    const box = $("#box");
    box.innerHTML = `<div class="muted">불러오는 중…</div>`;
    try {
      const params = new URLSearchParams();
      params.set("region", state.region);
      params.set("name", currentName);
      params.set("start", String(cursor));
      params.set("count", String(PAGE));
      const q = ($("#queue") as HTMLSelectElement).value; if (q) params.set("queue", q);
      const c = ($("#champ") as HTMLSelectElement).value; if (c) params.set("championId", c);
      const r = ($("#result") as HTMLSelectElement).value; if (r) params.set("result", r);
      const p = ($("#patch") as HTMLSelectElement).value; if (p) params.set("patch", p);
      const d: any = await json(API_BASE + "/v1/matches?" + params.toString());
      const rows = (d.items || []).map((m: any) => {
        const dt = m.ts ? new Date(m.ts).toLocaleString() : "";
        const kda = m.d ? ((m.k + m.a) / m.d).toFixed(2) : (m.k + m.a).toFixed(2);
        const badge = m.win ? `<span class="badge win">승</span>` : `<span class="badge lose">패</span>`;
        return `<tr>
          <td class="muted" title="${esc(String(m.id))}">${esc(dt)}</td>
          <td>${esc(m.queue)}</td>
          <td>${esc(m.champ)}</td>
          <td>${m.k}/${m.d}/${m.a} <span class="muted">(${kda})</span></td>
          <td>${m.cs}</td>
          <td>${m.durMin}m</td>
          <td>${esc(m.role || "")}</td>
          <td>${badge}</td>
        </tr>`;
      }).join("");
      box.innerHTML = rows
        ? `<table class="table">
            <thead><tr><th>시간</th><th>큐</th><th>챔피언</th><th>K/D/A</th><th>CS</th><th>시간</th><th>포지션</th><th>결과</th></tr></thead>
            <tbody>${rows}</tbody>
           </table>`
        : `<div class="muted">표시할 전적이 없음</div>`;
    } catch (err) { addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
  }
}

// ====== 비교 (원본 유지) ======
function viewCompare() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 8px">비교하기</h3>
      <form id="fc" class="grid" style="grid-template-columns:110px 1fr 1fr 110px;gap:8px">
        <select id="reg2">${REGION_OPTS}</select>
        <input id="a" placeholder="A: Riot ID" autocomplete="off"/>
        <input id="b" placeholder="B: Riot ID" autocomplete="off"/>
        <button type="submit">비교</button>
      </form>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#reg2") as HTMLSelectElement).value = state.region;

  v.addEventListener("submit", async e => {
    const form = e.target as HTMLFormElement;
    if (form.id !== "fc") return;
    e.preventDefault();
    const btn = form.querySelector("button") as HTMLButtonElement;
    btn.disabled = true;
    try {
      state.region = (form.querySelector("#reg2") as HTMLSelectElement).value;
      const A = (form.querySelector("#a") as HTMLInputElement).value.trim();
      const B = (form.querySelector("#b") as HTMLInputElement).value.trim();
      if (!A || !B) return;
      const q = (name: string, cnt = 20) => {
        const u = new URL(API_BASE + "/v1/summary");
        u.searchParams.set("region", state.region);
        u.searchParams.set("name", name);
        u.searchParams.set("count", String(cnt));
        return json(u.toString());
      };
      const [a, b]: any = await Promise.all([q(A, 20), q(B, 20)]);
      const diff = (x: number, y: number) => ((x - y) > 0 ? "+" : "") + String(Math.round((x - y) * 100) / 100);
      $("#box").innerHTML = `
        <div class="card">
          <h4 style="margin:0 0 6px">요약 비교(최근 20)</h4>
          <table class="table">
            <tr><th>지표</th><th>A</th><th>B</th><th>Δ</th></tr>
            <tr><td>승률</td><td>${a.winrate}%</td><td>${b.winrate}%</td><td>${diff(a.winrate,b.winrate)}%</td></tr>
            <tr><td>KDA</td><td>${a.kda}</td><td>${b.kda}</td><td>${diff(a.kda,b.kda)}</td></tr>
            <tr><td>평균 CS</td><td>${fmt(a.averages.cs)}</td><td>${fmt(b.averages.cs)}</td><td>${diff(a.averages.cs,b.averages.cs)}</td></tr>
            <tr><td>평균 골드</td><td>${fmt(a.averages.gold)}</td><td>${fmt(b.averages.gold)}</td><td>${diff(a.averages.gold,b.averages.gold)}</td></tr>
            <tr><td>평균 딜</td><td>${fmt(a.averages.dmg)}</td><td>${fmt(b.averages.dmg)}</td><td>${diff(a.averages.dmg,b.averages.dmg)}</td></tr>
          </table>
        </div>`;
    } catch (err) { addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
    finally { btn.disabled = false; }
  });
}

// ====== 개인 메타 (원본 유지) ======
function viewPersonal() { /* 기존 코드 그대로 */ }

// ====== 랭킹 (원본 유지) ======
function viewLadder() { /* 기존 코드 그대로 */ }

// ====== 라이브 (원본 유지) ======
function viewLive() { /* 기존 코드 그대로 */ }

// ====== 로테이션 (원본 유지) ======
function viewRotations() { /* 기존 코드 그대로 */ }

// ====== 챔피언 (원본 유지) ======
function viewChampions() { /* 기존 코드 그대로 */ }

// 부트
router();

