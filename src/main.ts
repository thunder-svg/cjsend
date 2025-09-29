// src/main.ts
const API_BASE = import.meta.env.VITE_API_BASE as string;

const REGION_OPTS = `
  <option value="kr">KR</option><option value="na1">NA</option>
  <option value="euw1">EUW</option><option value="eun1">EUNE</option><option value="jp1">JP</option>`;
const state = { region: "kr", queue: "RANKED_SOLO_5x5" };

const $ = (s:string, el:Document|HTMLElement=document)=> (el as Document).querySelector(s) as HTMLElement;
const esc = (s:any)=>String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));
const fmt = (n:number)=>Number(n||0).toLocaleString();
const json = async<T=any>(u:string)=>{ const r=await fetch(u,{headers:{"Accept":"application/json"}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${u}`); return r.json() as T; };
function addErr(e:any){ const b=$("#__err"); b.hidden=false; const n=Number(b.dataset.n||0)+1; b.dataset.n=String(n); b.textContent=`${n} error`; console.error(e); }

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

const avatar = (id:number|string)=>`<div class="avatar">${id||""}</div>`;
const kpi = (v:string,l:string)=>`<div class="kpi" style="display:flex;gap:8px;align-items:baseline"><div class="v" style="font:600 18px/1 system-ui">${v}</div><div class="muted" style="font-size:12px">${l}</div></div>`;
function setActiveNav(){
  const route = location.hash || "#/search";
  document.querySelectorAll("#nav a").forEach(a=>{
    a.setAttribute("aria-current", (a as HTMLAnchorElement).getAttribute("href")===route ? "page":"false");
  });
}
const routes:Record<string, ()=>void> = { "/search": viewSearch, "/history": viewHistory, "/compare": viewCompare, "/ladder": viewLadder, "/live": viewLive, "/rotations": viewRotations, "/champions": viewChampions };
function router(){ const path=(location.hash||"#/search").replace("#",""); setActiveNav(); (routes[path]||viewSearch)(); }
window.addEventListener("hashchange", router);

// ----- 공통 -----
function profileHead(p:any){
  return `<div class="grid g2" style="align-items:center">
    <div class="row" style="gap:12px">
      <div class="avatar">${p.iconId||""}</div>
      <div>
        <div style="font-weight:700">${esc(p.name)}</div>
        <div class="muted">LV ${fmt(p.level||0)}</div>
        <div class="row"><span class="pill">${p.rank?`${p.rank.tier} ${p.rank.division} • ${p.rank.lp}LP`:"Unranked"}</span></div>
      </div>
    </div>
  </div>`;
}

// ----- 검색 -----
function viewSearch(){
  const v=$("#view"); v.innerHTML = `
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
  v.addEventListener("submit", async (e)=>{
    const form = e.target as HTMLFormElement; if (form.id!=="f") return;
    e.preventDefault(); const btn=form.querySelector("button") as HTMLButtonElement; btn.disabled=true;
    try{
      state.region=(form.querySelector("#reg") as HTMLSelectElement).value;
      const name=(form.querySelector("#name") as HTMLInputElement).value.trim(); if(!name) return;
      const uProf=new URL(API_BASE+"/v1/profile"); uProf.searchParams.set("region",state.region); uProf.searchParams.set("name",name); uProf.searchParams.set("count","10");
      const uSum=new URL(API_BASE+"/v1/summary"); uSum.searchParams.set("region",state.region); uSum.searchParams.set("name",name); uSum.searchParams.set("count","20");
      const [p,s]=await Promise.all([json(uProf.toString()), json(uSum.toString())]);
      $("#box").innerHTML = `<div class="card">${profileHead(p)}</div>
      <div class="card"><div class="row" style="gap:16px">${kpi(`${s.winrate}%`,"승률")}${kpi(String(s.kda),"KDA")}${kpi(fmt(s.averages.cs),"평균 CS")}${kpi(fmt(s.averages.gold),"평균 골드")}${kpi(fmt(s.averages.dmg),"평균 딜")}</div></div>`;
    }catch(err){ addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
    finally{ btn.disabled=false; }
  }, {once:false});
}

// ----- 전적 히스토리 -----
function viewHistory(){
  const v=$("#view"); v.innerHTML = `
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

  // 초기값
  ($("#regH") as HTMLSelectElement).value = state.region;
  let cursor = 0; const PAGE = 10;
  let currentName = "";

  // 챔피언 목록 + 현재 패치
  (async()=>{
    try{
      const ver:any = await json(API_BASE+"/v1/ddragon/version");
      const currentPatch = String(ver.version).split(".").slice(0,2).join(".");
      const patchSel = $("#patch") as HTMLSelectElement;
      patchSel.innerHTML = `<option value="">패치: 전체</option><option value="${currentPatch}">${currentPatch}</option>`;

      const dj:any = await json(API_BASE+`/v1/ddragon/champions?ver=${ver.version}`);
      const arr = Object.values(dj.data as any).sort((a:any,b:any)=>a.name.localeCompare(b.name,"ko"));
      const opt = ['<option value="">챔피언: 전체</option>'].concat(arr.map((c:any)=>`<option value="${c.key}">${esc(c.name)}</option>`)).join("");
      ($("#champ") as HTMLSelectElement).innerHTML = opt;
    }catch(err){ addErr(err); }
  })();

  // 조회
  v.addEventListener("submit", async (e)=>{
    const form = e.target as HTMLFormElement; if (form.id!=="fh") return;
    e.preventDefault();
    const btn=form.querySelector("button") as HTMLButtonElement; btn.disabled=true;
    try{
      state.region=(form.querySelector("#regH") as HTMLSelectElement).value;
      currentName=(form.querySelector("#nameH") as HTMLInputElement).value.trim(); if(!currentName) return;
      cursor = 0;
      await load();
    }catch(err){ addErr(err); }
    finally{ btn.disabled=false; }
  }, {once:false});

  // 페이지 이동
  v.addEventListener("click", async (e)=>{
    const t=e.target as HTMLElement;
    if (t.id==="prev"){ if (cursor>=PAGE){ cursor-=PAGE; await load(); } }
    if (t.id==="next"){ cursor+=PAGE; await load(); }
  });

  // 필터 변경시 즉시 재조회
  v.addEventListener("change", async (e)=>{
    const t=e.target as HTMLSelectElement;
    if (["queue","champ","result","patch"].includes(t.id)) { cursor=0; if (currentName) await load(); }
  });

  async function load(){
    const box = $("#box"); box.innerHTML = `<div class="muted">불러오는 중…</div>`;
    try{
      const params = new URLSearchParams();
      params.set("region", state.region);
      params.set("name", currentName);
      params.set("start", String(cursor));
      params.set("count", String(PAGE));
      const q=($("#queue") as HTMLSelectElement).value; if (q) params.set("queue", q);
      const c=($("#champ") as HTMLSelectElement).value; if (c) params.set("championId", c);
      const r=($("#result") as HTMLSelectElement).value; if (r) params.set("result", r);
      const p=($("#patch") as HTMLSelectElement).value; if (p) params.set("patch", p);

      const d:any = await json(API_BASE+"/v1/matches?"+params.toString());
      const rows = (d.items||[]).map((m:any)=>{
        const dt = m.ts ? new Date(m.ts).toLocaleString() : "";
        const kda = m.d ? ((m.k+m.a)/m.d).toFixed(2) : (m.k+m.a).toFixed(2);
        const badge = m.win ? `<span class="badge win">승</span>` : `<span class="badge lose">패</span>`;
        return `<tr>
          <td class="muted" title="${esc(String(m.id))}">${esc(dt)}</td>
          <td>${esc(m.queue)}</td>
          <td>${esc(m.champ)}</td>
          <td>${m.k}/${m.d}/${m.a} <span class="muted">(${kda})</span></td>
          <td>${m.cs}</td>
          <td>${m.durMin}m</td>
          <td>${esc(m.role||"")}</td>
          <td>${badge}</td>
        </tr>`;
      }).join("");

      box.innerHTML = rows
        ? `<table class="table">
            <thead><tr><th>시간</th><th>큐</th><th>챔피언</th><th>K/D/A</th><th>CS</th><th>시간</th><th>포지션</th><th>결과</th></tr></thead>
            <tbody>${rows}</tbody>
           </table>`
        : `<div class="muted">표시할 전적이 없음</div>`;
    }catch(err){ addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
  }
}

// ----- 비교/랭킹/라이브/로테이션/챔피언 (기존 그대로) -----
/* 기존에 제공한 viewCompare, viewLadder, viewLive, viewRotations, viewChampions 함수를
   수정 없이 아래에 그대로 두세요. */
declare const viewCompare: ()=>void;
declare const viewLadder: ()=>void;
declare const viewLive: ()=>void;
declare const viewRotations: ()=>void;
declare const viewChampions: ()=>void;

// 부트
router();
