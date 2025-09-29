// src/main.ts
const API_BASE = import.meta.env.VITE_API_BASE as string; // .env.production에 설정
const REGION_OPTS = `
  <option value="kr">KR</option><option value="na1">NA</option>
  <option value="euw1">EUW</option><option value="eun1">EUNE</option><option value="jp1">JP</option>`;
const state = { region: "kr", queue: "RANKED_SOLO_5x5" };

const $ = (s:string, el:Document|HTMLElement=document)=> (el as Document).querySelector(s) as HTMLElement;
const esc = (s:any)=>String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]);
const fmt = (n:number)=>Number(n||0).toLocaleString();
const json = async<T=any>(u:string)=>{ const r=await fetch(u,{headers:{"Accept":"application/json"}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${u}`); return r.json() as T; };

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

// 오류 배지
function addErr(e:any){ const b=$("#__err"); b.hidden=false; const n=Number(b.dataset.n||0)+1; b.dataset.n=String(n); b.textContent=`${n} error`; console.error(e); }

// 공통 UI
const avatar = (id:number|string)=>`<div class="avatar">${id||""}</div>`;
const kpi = (v:string, l:string)=>`<div class="kpi" style="display:flex;gap:8px;align-items:baseline"><div class="v" style="font:600 18px/1 system-ui">${v}</div><div class="muted" style="font-size:12px">${l}</div></div>`;
const regionSelect = (id:string, val:string)=>`<select id="${id}">${REGION_OPTS}</select><script>document.currentScript.previousElementSibling.value="${val}"</script>`;

// 라우팅
const routes:Record<string, ()=>void> = {
  "/search": viewSearch,
  "/compare": viewCompare,
  "/ladder": viewLadder,
  "/live": viewLive,
  "/rotations": viewRotations,
  "/champions": viewChampions,
};
function setActiveNav(){
  const route = location.hash || "#/search";
  document.querySelectorAll("#nav a").forEach(a=>{
    a.setAttribute("aria-current", (a as HTMLAnchorElement).getAttribute("href")===route ? "page":"false");
  });
}
function router(){ const path=(location.hash||"#/search").replace("#",""); setActiveNav(); (routes[path]||viewSearch)(); }
window.addEventListener("hashchange", router);

// ===== 뷰들 =====
function profileHead(p:any){
  return `<div class="grid g2" style="align-items:center">
    <div class="row" style="gap:12px">
      ${avatar(p.iconId)}
      <div>
        <div style="font-weight:700">${esc(p.name)}</div>
        <div class="muted">LV ${fmt(p.level||0)}</div>
        <div class="row"><span class="pill">${p.rank?`${p.rank.tier} ${p.rank.division} • ${p.rank.lp}LP`:"Unranked"}</span></div>
      </div>
    </div>
  </div>`;
}
function summaryCards(s:any){
  const lanes = (s.lanes||[]).map((x:any)=>`<div class="card"><b>${x.pos}</b><div class="hr"></div>${kpi(`${x.wr}%`,"승률")} ${kpi(String(x.g),"경기")}</div>`).join("");
  const champs = (s.topChamps||[]).map((c:any)=>`<div class="card"><b>${c.champ}</b><div class="hr"></div>${kpi(`${c.wr}%`,"승률")} ${kpi(String(c.kda),"KDA")} ${kpi(String(c.cs),"CS")} ${kpi(fmt(c.gold),"Gold")}</div>`).join("");
  return `
    <div class="card">
      <h4 style="margin:0 0 6px">최근 ${s.window.count}경기 요약</h4>
      <div class="row" style="justify-content:space-between">
        <div class="row" style="gap:16px">
          ${kpi(`${s.winrate}%`,"승률")}
          ${kpi(String(s.kda),"KDA")}
          ${kpi(`${fmt(s.averages.cs)}`,"평균 CS")}
          ${kpi(`${fmt(s.averages.gold)}`,"평균 골드")}
          ${kpi(`${fmt(s.averages.dmg)}`,"평균 딜")}
        </div>
      </div>
      <div class="hr"></div>
      <div class="grid g2">
        <div>
          <h5 style="margin:0 0 6px">라인 분포</h5>
          <div class="grid g3">${lanes||`<span class="muted">데이터 없음</span>`}</div>
        </div>
        <div>
          <h5 style="margin:0 0 6px">대표 챔피언</h5>
          <div class="grid g3">${champs||`<span class="muted">데이터 없음</span>`}</div>
        </div>
      </div>
    </div>`;
}

function viewSearch(){
  const v = $("#view"); v.innerHTML = `
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

  // 단일 submit 핸들러
  v.addEventListener("submit", async (e)=>{
    const form = e.target as HTMLFormElement;
    if (form.id !== "f") return;
    e.preventDefault();
    const btn = form.querySelector("button") as HTMLButtonElement;
    btn.disabled = true;
    try{
      state.region = (form.querySelector("#reg") as HTMLSelectElement).value;
      const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
      if (!name) return;

      const uProf = new URL(API_BASE+"/v1/profile"); uProf.searchParams.set("region",state.region); uProf.searchParams.set("name",name); uProf.searchParams.set("count","10");
      const uSum  = new URL(API_BASE+"/v1/summary"); uSum.searchParams.set("region",state.region); uSum.searchParams.set("name",name); uSum.searchParams.set("count","20");

      const [p, s] = await Promise.all([json(uProf.toString()), json(uSum.toString())]);
      $("#box").innerHTML = `<div class="card">${profileHead(p)}</div>${summaryCards(s)}`;
    }catch(err){ addErr(err); $("#box").innerHTML = `<div class="muted">불러오기 실패</div>`; }
    finally{ btn.disabled = false; }
  }, { once:false });
}

function viewCompare(){
  const v = $("#view"); v.innerHTML = `
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

  v.addEventListener("submit", async (e)=>{
    const form = e.target as HTMLFormElement; if (form.id!=="fc") return;
    e.preventDefault(); const btn=form.querySelector("button") as HTMLButtonElement; btn.disabled=true;
    try{
      state.region=(form.querySelector("#reg2") as HTMLSelectElement).value;
      const A=(form.querySelector("#a") as HTMLInputElement).value.trim();
      const B=(form.querySelector("#b") as HTMLInputElement).value.trim();
      if(!A||!B) return;
      const q=(name:string, cnt=10)=>{ const u=new URL(API_BASE+"/v1/summary"); u.searchParams.set("region",state.region); u.searchParams.set("name",name); u.searchParams.set("count",String(cnt)); return json(u.toString()); };
      const [a,b]=await Promise.all([q(A,20), q(B,20)]);
      const diff=(x:number,y:number)=>((x-y)>0?"+":"")+String(Math.round((x-y)*100)/100);
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
    }catch(err){ addErr(err); $("#box").innerHTML=`<div class="muted">불러오기 실패</div>`; }
    finally{ btn.disabled=false; }
  }, { once:false });
}

function viewLadder(){
  const v=$("#view"); v.innerHTML = `
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
  const load = async ()=>{
    try{
      state.region=($("#reg3") as HTMLSelectElement).value;
      const tier=($("#tier") as HTMLSelectElement).value;
      const u=new URL(API_BASE+"/v1/ladder"); u.searchParams.set("region",state.region); u.searchParams.set("queue",state.queue); u.searchParams.set("tier",tier);
      const d:any = await json(u.toString());
      const rows=d.entries.map((e:any,i:number)=>`<tr><td>${i+1}</td><td>${esc(e.summonerName)}</td><td>${e.tier}</td><td>${fmt(e.leaguePoints)}</td><td>${e.wins}/${e.losses}</td></tr>`).join("");
      $("#box").innerHTML = `<table class="table"><thead><tr><th>#</th><th>소환사</th><th>티어</th><th>LP</th><th>전적</th></tr></thead><tbody>${rows}</tbody></table>`;
    }catch(err){ addErr(err); $("#box").innerHTML=`<div class="muted">불러오기 실패</div>`; }
  };
  v.addEventListener("click", (e)=>{ const t=e.target as HTMLElement; if (t.id==="reload") load(); });
  load();
}
function viewLive(){
  const v=$("#view"); v.innerHTML = `
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
  v.addEventListener("submit", async (e)=>{
    const form = e.target as HTMLFormElement; if (form.id!=="fl") return;
    e.preventDefault(); const btn=form.querySelector("button") as HTMLButtonElement; btn.disabled=true;
    try{
      state.region=(form.querySelector("#reg4") as HTMLSelectElement).value;
      const name=(form.querySelector("#name") as HTMLInputElement).value.trim(); if(!name) return;
      const u=new URL(API_BASE+"/v1/live"); u.searchParams.set("region",state.region); u.searchParams.set("name",name);
      const d:any = await json(u.toString());
      if(!d.inGame){ $("#box").innerHTML=`<div class="muted">게임 중 아님</div>`; return; }
      $("#box").innerHTML = `<pre style="white-space:pre-wrap">${esc(JSON.stringify(d.game,null,2))}</pre>`;
    }catch(err){ addErr(err); $("#box").innerHTML=`<div class="muted">불러오기 실패</div>`; }
    finally{ btn.disabled=false; }
  }, { once:false });
}
async function viewRotations(){
  const v=$("#view"); v.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between"><h3 style="margin:0">챔피언 로테이션</h3><select id="reg5">${REGION_OPTS}</select></div>
      <div id="box" style="margin-top:10px"></div>
    </div>`;
  ($("#reg5") as HTMLSelectElement).value = state.region;
  const load = async ()=>{
    try{
      state.region=($("#reg5") as HTMLSelectElement).value;
      const rot:any = await json(new URL(API_BASE+"/v1/rotations")+"?region="+state.region);
      const ver:any = await json(API_BASE+"/v1/ddragon/version");
      const dj:any = await json(API_BASE+`/v1/ddragon/champions?ver=${ver.version}`);
      const map = Object.values(dj.data as any).reduce((a:any,c:any)=>{a[c.key]=c.name;return a;}, {});
      const names = rot.freeChampionIds.map((id:number)=>map[id]||id).sort();
      $("#box").innerHTML = `<div class="row">${names.map((n:string)=>`<span class="pill">${esc(n)}</span>`).join("")}</div>`;
    }catch(err){ addErr(err); $("#box").innerHTML=`<div class="muted">불러오기 실패</div>`; }
  };
  v.addEventListener("change", (e)=>{ const t=e.target as HTMLSelectElement; if (t.id==="reg5") load(); });
  load();
}
async function viewChampions(){
  const v=$("#view"); v.innerHTML = `<div class="card"><h3 style="margin:0 0 8px">챔피언 목록</h3><div id="box" style="margin-top:10px"></div></div>`;
  try{
    const ver:any = await json(API_BASE+"/v1/ddragon/version");
    const dj:any = await json(API_BASE+`/v1/ddragon/champions?ver=${ver.version}`);
    const cards = Object.values(dj.data as any).sort((a:any,b:any)=>a.name.localeCompare(b.name,"ko")).map((c:any)=>`<div class="pill">${esc(c.name)}</div>`).join("");
    $("#box").innerHTML = `<div class="row">${cards}</div>`;
  }catch(err){ addErr(err); $("#box").innerHTML=`<div class="muted">불러오기 실패</div>`; }
}

// 부트
router();
