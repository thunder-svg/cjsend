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

const avatar = (id: number | string) => `<div class="avatar">${id || ""}</div>`;
const kpi = (v: string, l: string) =>
  `<div class="kpi" style="display:flex;gap:8px;align-items:baseline"><div class="v" style="font:600 18px/1 system-ui">${v}</div><div class="muted" style="font-size:12px">${l}</div></div>`;

function setActiveNav() {
  const route = location.hash || "#/search";
  document.querySelectorAll("#nav a").forEach(a => {
    a.setAttribute("aria-current", (a as HTMLAnchorElement).getAttribute("href") === route ? "page" : "false");
  });
}
const routes: Record<string, () => void> = {
  "/search": viewSearch,
  "/history": viewHistory,
  "/compare": viewCompare,
  "/personal": viewPersonal,
  "/ladder": viewLadder,
  "/live": viewLive,
  "/rotations": viewRotations,
  "/champions": viewChampions
};
function router() {
  const path = (location.hash || "#/search").replace("#", "");
  setActiveNav();
  (routes[path] || viewSearch)();
}
window.addEventListener("hashchange", router);

// ----- 공통 -----
function profileHead(p: any) {
  return `<div class="grid g2" style="align-items:center">
    <div class="row" style="gap:12px">
      <div class="avatar">${p.iconId || ""}</div>
      <div>
        <div style="font-weight:700">${esc(p.name)}</div>
        <div class="muted">LV ${fmt(p.level || 0)}</div>
        <div class="row"><span class="pill">${p.rank ? `${p.rank.tier} ${p.rank.division} • ${p.rank.lp}LP` : "Unranked"}</span></div>
      </div>
    </div>
  </div>`;
}

// ====== 검색 + 요약 ======
function viewSearch() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 8px">전적 검색 + 요약</h3>
      <form id="f" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px">
        <select id="reg">${REGION_OPTS}</select>
        <input id="name" placeholder="Riot ID 예: Faker#KR1" autocomplete="off"/>
        <button type="submit">검색</button>
      </form>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#reg") as HTMLSelectElement).value = state.region;

  v.addEventListener("submit", async e => {
    const form = e.target as HTMLFormElement;
    if (form.id !== "f") return;
    e.preventDefault();
    const btn = form.querySelector("button") as HTMLButtonElement;
    btn.disabled = true;
    try {
      state.region = (form.querySelector("#reg") as HTMLSelectElement).value;
      const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
      if (!name) return;
      const uProf = new URL(API_BASE + "/v1/profile");
      uProf.searchParams.set("region", state.region);
      uProf.searchParams.set("name", name);
      uProf.searchParams.set("count", "10");
      const uSum = new URL(API_BASE + "/v1/summary");
      uSum.searchParams.set("region", state.region);
      uSum.searchParams.set("name", name);
      uSum.searchParams.set("count", "20");
      const [p, s] = await Promise.all([json(uProf.toString()), json(uSum.toString())]);
      $("#box").innerHTML = `<div class="card">${profileHead(p)}</div>
      <div class="card"><div class="row" style="gap:16px">
        ${kpi(`${s.winrate}%`, "승률")}
        ${kpi(String(s.kda), "KDA")}
        ${kpi(fmt(s.averages.cs), "평균 CS")}
        ${kpi(fmt(s.averages.gold), "평균 골드")}
        ${kpi(fmt(s.averages.dmg), "평균 딜")}
      </div></div>`;
    } catch (err) {
      addErr(err);
      $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`;
    } finally {
      btn.disabled = false;
    }
  });
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
        <select id="result"><option value="">결과: 전체</option><option value="win">승</option><option value="loss">패</option></select>
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
      const c = ($("#champ") as HTMLSelectElement).value; if (c) params.set("champion", c);
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

// ====== 비교 ======
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

// ====== 개인 메타 ======
function viewPersonal() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 8px">개인 메타(챔피언별 성적)</h3>
      <form id="fp" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px;align-items:center">
        <select id="regP">${REGION_OPTS}</select>
        <input id="nameP" placeholder="Riot ID 예: Faker#KR1" autocomplete="off"/>
        <button type="submit">조회</button>
      </form>
      <div class="row" style="margin-top:8px;gap:8px">
        <select id="queueP">
          <option value="">큐: 전체</option>
          <option value="420">솔로랭크</option><option value="440">자유랭크</option>
          <option value="450">칼바람</option><option value="430">일반</option>
        </select>
        <select id="roleP">
          <option value="">포지션: 전체</option>
          <option value="TOP">TOP</option><option value="JUNGLE">JUNGLE</option>
          <option value="MIDDLE">MIDDLE</option><option value="ADC">ADC</option><option value="SUPPORT">SUPPORT</option>
        </select>
        <select id="patchP"><option value="">패치: 전체</option></select>
        <label class="row" style="gap:6px"><span class="muted">최소 경기</span><input id="minP" type="number" min="1" value="3" style="width:80px"></label>
        <select id="sortP">
          <option value="g">정렬: 경기수</option>
          <option value="wr">승률</option>
          <option value="kda">KDA</option>
          <option value="csAvg">CS</option>
          <option value="dmgAvg">딜</option>
          <option value="dmgShare">딜 점유%</option>
        </select>
        <button id="reloadP" type="button">새로고침</button>
      </div>
      <div id="boxP" style="margin-top:10px"></div>
    </div>`;

  ($("#regP") as HTMLSelectElement).value = state.region;

  (async () => {
    try {
      const r = await fetch(`${API_BASE}/v1/ddragon/version`);
      const { version } = await r.json();
      const current = String(version).split(".").slice(0, 2).join(".");
      const sel = document.getElementById("patchP") as HTMLSelectElement;
      sel.innerHTML = `<option value="">패치: 전체</option><option value="${current}">${current}</option>`;
    } catch { /* ignore */ }
  })();

  let cacheData: any[] = [];
  let meta: { name?: string; sample?: number; queueId?: number; role?: string; patch?: string } = {};

  v.addEventListener("submit", async e => {
    const fm = e.target as HTMLFormElement;
    if (fm.id !== "fp") return;
    e.preventDefault();
    const btn = fm.querySelector("button") as HTMLButtonElement;
    btn.disabled = true;
    try {
      state.region = (fm.querySelector("#regP") as HTMLSelectElement).value;
      const name = (fm.querySelector("#nameP") as HTMLInputElement).value.trim();
      if (!name) return;
      await load(name);
    } catch (err) { addErr(err); }
    finally { btn.disabled = false; }
  });

  v.addEventListener("click", async e => {
    const t = e.target as HTMLElement;
    if (t.id === "reloadP") {
      const name = (document.getElementById("nameP") as HTMLInputElement).value.trim();
      if (name) await load(name);
    }
  });

  v.addEventListener("change", e => {
    const id = (e.target as HTMLSelectElement).id;
    if (["sortP", "minP"].includes(id)) { render(); }
    if (["queueP", "roleP", "patchP"].includes(id)) {
      const name = (document.getElementById("nameP") as HTMLInputElement).value.trim();
      if (name) load(name);
    }
  });

  async function load(name: string) {
    const box = document.getElementById("boxP") as HTMLElement;
    box.innerHTML = `<div class="muted">불러오는 중…</div>`;
    const params = new URLSearchParams();
    params.set("region", state.region);
    params.set("name", name);
    params.set("count", "100");
    const q = (document.getElementById("queueP") as HTMLSelectElement).value; if (q) params.set("queue", q);
    const role = (document.getElementById("roleP") as HTMLSelectElement).value; if (role) params.set("role", role);
    const patch = (document.getElementById("patchP") as HTMLSelectElement).value; if (patch) params.set("patch", patch);
    try {
      const u = `${API_BASE}/v1/personal/champs?` + params.toString();
      const res = await fetch(u, { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      cacheData = d.entries || [];
      meta = d;
      render();
    } catch (err) { addErr(err); box.innerHTML = `<div class="muted">불러오기 실패</div>`; }
  }

  function render() {
    const box = document.getElementById("boxP") as HTMLElement;
    const minG = Math.max(1, Number((document.getElementById("minP") as HTMLInputElement).value) || 3);
    const sortKey = (document.getElementById("sortP") as HTMLSelectElement).value as keyof typeof cacheData[0] || "g";
    const data = (cacheData || []).filter((r: any) => r.g >= minG).sort((a: any, b: any) => {
      if (sortKey === "champ") return String(a.champ).localeCompare(b.champ, "ko");
      return Number(b[sortKey]) - Number(a[sortKey]);
    });

    const head = `
      <div class="row" style="justify-content:space-between;margin-bottom:8px">
        <div class="muted">${esc(meta.name || "")} • 샘플 ${meta.sample || 0}경기</div>
        <div class="muted">필터: ${meta.queueId || "전체"} ${meta.role || ""} ${meta.patch || ""}</div>
      </div>`;

    if (!data.length) { box.innerHTML = head + `<div class="muted">표시할 데이터 없음</div>`; return; }

    const rows = data.map((r: any) => `
      <tr>
        <td>${esc(r.champ)}</td>
        <td class="num">${r.g}</td>
        <td class="num">${r.wr}%</td>
        <td class="num">${r.kda}</td>
        <td class="num">${r.kAvg}/${r.dAvg}/${r.aAvg}</td>
        <td class="num">${r.csAvg}</td>
        <td class="num">${r.goldAvg}</td>
        <td class="num">${r.dmgAvg}</td>
        <td class="num">${r.dmgShare}%</td>
        <td class="num">${r.visionAvg}</td>
        <td class="num">${r.timeMinAvg}m</td>
      </tr>`).join("");

    box.innerHTML = head + `
      <table class="table">
        <thead><tr>
          <th>챔피언</th><th class="num">경기</th><th class="num">승률</th><th class="num">KDA</th><th class="num">K/D/A</th>
          <th class="num">CS</th><th class="num">골드</th><th class="num">딜</th><th class="num">딜점유</th><th class="num">시야</th><th class="num">시간</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }
}

// ====== 랭킹 ======
function viewLadder() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h3 style="margin:0">랭킹</h3>
        <div class="row">
          <select id="reg3">${REGION_OPTS}</select>
          <select id="tier"><option value="all">All</option><option value="challenger">Challenger</option><option value="grandmaster">Grandmaster</option><option value="master">Master</option></select>
          <button id="reload" type="button">불러오기</button>
        </div>
      </div>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#reg3") as HTMLSelectElement).value = state.region;
  const load = async () => {
    try {
      state.region = ($("#reg3") as HTMLSelectElement).value;
      const tier = ($("#tier") as HTMLSelectElement).value;
      const u = new URL(API_BASE + "/v1/ladder");
      u.searchParams.set("region", state.region);
      u.searchParams.set("queue", state.queue);
      u.searchParams.set("tier", tier);
      const d: any = await json(u.toString());
      const rows = d.entries.map((e: any, i: number) =>
        `<tr><td>${i + 1}</td><td>${esc(e.summonerName)}</td><td>${e.tier}</td><td>${fmt(e.leaguePoints)}</td><td>${e.wins}/${e.losses}</td></tr>`
      ).join("");
      $("#box").innerHTML = `<table class="table"><thead><tr><th>#</th><th>소환사</th><th>티어</th><th>LP</th><th>전적</th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch (err) { addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
  };
  v.addEventListener("click", e => { const t = e.target as HTMLElement; if (t.id === "reload") load(); });
  load();
}

// ====== 라이브 ======
function viewLive() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 8px">라이브 관전</h3>
      <form id="fl" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px">
        <select id="reg4">${REGION_OPTS}</select>
        <input id="name" placeholder="Riot ID" autocomplete="off"/>
        <button type="submit">조회</button>
      </form>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#reg4") as HTMLSelectElement).value = state.region;

  v.addEventListener("submit", async e => {
    const form = e.target as HTMLFormElement;
    if (form.id !== "fl") return;
    e.preventDefault();
    const btn = form.querySelector("button") as HTMLButtonElement;
    btn.disabled = true;
    try {
      state.region = (form.querySelector("#reg4") as HTMLSelectElement).value;
      const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
      if (!name) return;
      const u = new URL(API_BASE + "/v1/live");
      u.searchParams.set("region", state.region);
      u.searchParams.set("name", name);
      const d: any = await json(u.toString());
      if (!d.inGame) { $("#box").innerHTML = `<div class="muted">게임 중 아님</div>`; return; }

      const row = (p: any) => {
        const rune = p.runes?.keystone?.icon ? `<img alt="" src="${p.runes.keystone.icon}" width="20" height="20" style="vertical-align:middle">` : "";
        const sub  = p.runes?.secondary?.icon ? `<img alt="" src="${p.runes.secondary.icon}" width="18" height="18" style="vertical-align:middle;opacity:.8">` : "";
        const items = (p.starters||[]).map((it:any)=> it.icon ? `<img alt="${esc(it.name)}" src="${it.icon}" width="22" height="22" style="border-radius:4px">` : "").join(" ");
        const wr = (p.soloWr==null) ? "-" : `${p.soloWr}%`;
        return `<tr>
          <td>${esc(p.championName)}</td>
          <td>${esc(p.summonerName)}</td>
          <td>${esc(p.rankShort)}</td>
          <td class="c">${wr}</td>
          <td class="c">${rune} ${sub}</td>
          <td class="c">${items||"-"}</td>
        </tr>`;
      };
      const patch = d.version ? esc(String(d.version).split(".").slice(0,2).join(".")) : "";
      const team = (title: string, arr: any[]) => `
        <div class="card">
          <div class="row" style="justify-content:space-between"><strong>${title}</strong>
            <span class="muted">${patch ? `패치 ${patch}` : ""}</span>
          </div>
          <table class="table">
            <thead><tr><th>챔피언</th><th>소환사</th><th>랭크</th><th class="c">솔랭 WR</th><th class="c">룬</th><th class="c">시작템</th></tr></thead>
            <tbody>${arr.map(row).join("")}</tbody>
          </table>
        </div>`;
      $("#box").innerHTML = team("블루 팀", d.blue||[]) + team("레드 팀", d.red||[]);
    } catch (err) { addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
    finally { btn.disabled = false; }
  });
}

// ====== 로테이션 ======
function viewRotations() {
  const v = $("#view");
  v.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">챔피언 로테이션</h3><select id="reg5">${REGION_OPTS}</select></div>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#reg5") as HTMLSelectElement).value = state.region;

  const load = async () => {
    try {
      state.region = ($("#reg5") as HTMLSelectElement).value;
      const rot = await json<any>(new URL(API_BASE + "/v1/rotations") + "?region=" + state.region);
      const ver = await json<any>(API_BASE + "/v1/ddragon/version");
      const dj = await json<any>(API_BASE + `/v1/ddragon/champions?ver=${ver.version}`);
      const map = Object.values(dj.data).reduce((a: any, c: any) => { a[(c as any).key] = (c as any).name; return a; }, {});
      const names = rot.freeChampionIds.map((id: number) => map[id] || id).sort();
      $("#box").innerHTML = `<div class="row">${names.map((n: string) => `<span class="pill">${esc(n)}</span>`).join("")}</div>`;
    } catch (err) { addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
  };
  v.addEventListener("change", e => { const t = e.target as HTMLSelectElement; if (t.id === "reg5") load(); });
  load();
}

// ====== 챔피언 목록 ======
function viewChampions() {
  const v = $("#view");
  v.innerHTML = `<div class="card"><h3 style="margin:0 0 8px">챔피언 목록</h3><div id="box" style="margin-top:10px"></div></div>`;
  (async () => {
    try {
      const ver = await json<any>(API_BASE + "/v1/ddragon/version");
      const dj = await json<any>(API_BASE + `/v1/ddragon/champions?ver=${ver.version}`);
      const cards = Object.values(dj.data).sort((a: any, b: any) => (a as any).name.localeCompare((b as any).name, "ko"))
        .map((c: any) => `<div class="pill">${esc((c as any).name)}</div>`).join("");
      $("#box").innerHTML = `<div class="row">${cards}</div>`;
    } catch (err) { addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
  })();
}

// 부트
router();
