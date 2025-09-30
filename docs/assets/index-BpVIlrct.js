(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function i(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=i(n);fetch(n.href,s)}})();const l="https://yee.mfleon32.workers.dev/",r=(e,t=document)=>t.querySelector(e),p=r("#view"),L=r("#nav"),$=r("#err");let x=0;const m=e=>{x++,$.textContent=x+" error",$.hidden=!1,console.error(e)},M=["검색","비교","랭킹","라이브","로테이션","챔피언"],c={region:"kr",queue:"RANKED_SOLO_5x5"};M.forEach((e,t)=>{const i=document.createElement("button");i.className="tab",i.textContent=e,i.onclick=()=>k(t),L.appendChild(i)});function T(e){[...L.children].forEach((t,i)=>t.setAttribute("aria-selected",i===e?"true":"false"))}function k(e){T(e),e===0&&H(),e===1&&j(),e===2&&A(),e===3&&E(),e===4&&S(),e===5&&R()}const v=async e=>{const t=await fetch(e,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error("HTTP "+t.status+" "+e);return t.json()},y=e=>{const t=e.reduce((a,n)=>(a.k+=n.k,a.d+=n.d,a.a+=n.a,a.w+=n.win?1:0,a),{k:0,d:0,a:0,w:0}),i=t.d?(t.k+t.a)/t.d:t.k+t.a;return{games:e.length,wins:t.w,winrate:Math.round(t.w/e.length*100),k:t.k,d:t.d,a:t.a,kda:Number(i.toFixed(2))}},P=e=>Number(e).toLocaleString();function w(e){const t=y(e.last10||[]);return`<div class="grid g2" style="align-items:center">
    <div class="row" style="gap:12px">
      <div style="width:54px;height:54px;border-radius:14px;background:#222;display:grid;place-items:center;font-weight:700">${e.iconId||""}</div>
      <div><div style="font-weight:700">${e.name}</div><div class="muted">LV ${P(e.level||0)}</div></div>
    </div>
    <div class="row" style="justify-content:flex-end;gap:16px">
      <div class="kpi"><div class="v">${t.winrate}%</div><div class="muted">승률(10)</div></div>
      <div class="kpi"><div class="v">${t.kda}</div><div class="muted">KDA</div></div>
      <div class="kpi"><div class="v">${t.k}/${t.d}/${t.a}</div><div class="muted">합산</div></div>
    </div>
    <div class="hr"></div>
    <div class="row"><span class="pill">${e.rank?`${e.rank.tier} ${e.rank.division} • ${e.rank.lp}LP`:"Unranked"}</span><span class="pill">${c.region.toUpperCase()}</span></div>
  </div>`}function H(){p.innerHTML=`<div class="card">
    <h3 style="margin:0 0 8px">전적 검색</h3>
    <form id="f" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px">
      ${g("reg")}
      <input id="name" placeholder="Riot ID 예: Faker#KR1" autocomplete="off"/>
      <button type="submit">검색</button>
    </form>
    <div id="box" style="margin-top:10px"></div>
  </div>`,r("#reg").value=c.region,r("#f").addEventListener("submit",async e=>{e.preventDefault(),c.region=r("#reg").value;const t=r("#name").value.trim();if(!t)return;const i=new URL(l+"/v1/profile");i.searchParams.set("region",c.region),i.searchParams.set("name",t),i.searchParams.set("count","10");try{const a=await v(i.toString());r("#box").innerHTML=w(a)}catch(a){m(a),r("#box").innerHTML='<div class="muted">불러오기 실패</div>'}})}function j(){p.innerHTML=`<div class="card">
    <h3 style="margin:0 0 8px">비교하기</h3>
    <form id="f" class="grid" style="grid-template-columns:110px 1fr 1fr 110px;gap:8px">
      ${g("reg2")}
      <input id="a" placeholder="A: Riot ID" autocomplete="off"/>
      <input id="b" placeholder="B: Riot ID" autocomplete="off"/>
      <button type="submit">비교</button>
    </form>
    <div id="box" style="margin-top:10px"></div>
  </div>`,r("#reg2").value=c.region,r("#f").addEventListener("submit",async e=>{e.preventDefault(),c.region=r("#reg2").value;const t=r("#a").value.trim(),i=r("#b").value.trim();if(!t||!i)return;const a=n=>{const s=new URL(l+"/v1/profile");return s.searchParams.set("region",c.region),s.searchParams.set("name",n),s.searchParams.set("count","10"),v(s.toString())};try{const[n,s]=await Promise.all([a(t),a(i)]),o=y(n.last10),d=y(s.last10),u=(f,h)=>(f-h>0?"+":"")+String((f-h).toFixed?(f-h).toFixed(2):f-h);r("#box").innerHTML=`
        <div class="grid g2"><div class="card">${w(n)}</div><div class="card">${w(s)}</div></div>
        <div class="card" style="margin-top:10px">
          <h4 style="margin:0 0 6px">핵심 지표</h4>
          <table class="table">
            <tr><th>지표</th><th>A</th><th>B</th><th>Δ</th></tr>
            <tr><td>승률(10)</td><td>${o.winrate}%</td><td>${d.winrate}%</td><td>${u(o.winrate,d.winrate)}%</td></tr>
            <tr><td>KDA</td><td>${o.kda}</td><td>${d.kda}</td><td>${u(o.kda,d.kda)}</td></tr>
            <tr><td>합산 K/D/A</td><td>${o.k}/${o.d}/${o.a}</td><td>${d.k}/${d.d}/${d.a}</td><td>${u(o.k+o.a,d.k+d.a)}</td></tr>
          </table>
        </div>`}catch(n){m(n),r("#box").innerHTML='<div class="muted">불러오기 실패</div>'}})}function A(){p.innerHTML=`<div class="card">
    <div class="row" style="justify-content:space-between">
      <h3 style="margin:0">랭킹</h3>
      <div class="row">
        ${g("reg3")}
        <select id="tier"><option value="all">All</option><option value="challenger">Challenger</option><option value="grandmaster">Grandmaster</option><option value="master">Master</option></select>
        <button id="reload">불러오기</button>
      </div>
    </div>
    <div id="box" style="margin-top:10px"></div>
  </div>`,r("#reg3").value=c.region,r("#reload").onclick=e,r("#tier").value="all",e();async function e(){c.region=r("#reg3").value;const t=r("#tier").value,i=new URL(l+"/v1/ladder");i.searchParams.set("region",c.region),i.searchParams.set("queue",c.queue),i.searchParams.set("tier",t);try{const n=(await v(i.toString())).entries.map((s,o)=>`<tr><td>${o+1}</td><td>${b(s.summonerName)}</td><td>${s.tier}</td><td>${P(s.leaguePoints)}</td><td>${s.wins}/${s.losses}</td></tr>`).join("");r("#box").innerHTML=`<table class="table"><thead><tr><th>#</th><th>소환사</th><th>티어</th><th>LP</th><th>전적</th></tr></thead><tbody>${n}</tbody></table>`}catch(a){m(a),r("#box").innerHTML='<div class="muted">불러오기 실패</div>'}}}function E(){p.innerHTML=`<div class="card">
    <h3 style="margin:0 0 8px">라이브 관전</h3>
    <form id="f" class="grid" style="grid-template-columns:110px 1fr 110px;gap:8px">
      ${g("reg4")}
      <input id="name" placeholder="Riot ID" autocomplete="off"/>
      <button type="submit">조회</button>
    </form>
    <div id="box" style="margin-top:10px"></div>
  </div>`,r("#reg4").value=c.region,r("#f").addEventListener("submit",async e=>{e.preventDefault(),c.region=r("#reg4").value;const t=r("#name").value.trim();if(!t)return;const i=new URL(l+"/v1/live");i.searchParams.set("region",c.region),i.searchParams.set("name",t);try{const a=await v(i.toString());if(!a.inGame){r("#box").innerHTML='<div class="muted">게임 중 아님</div>';return}r("#box").innerHTML=`<pre style="white-space:pre-wrap">${b(JSON.stringify(a.game,null,2))}</pre>`}catch(a){m(a),r("#box").innerHTML='<div class="muted">불러오기 실패</div>'}})}function S(){p.innerHTML=`<div class="card">
    <div class="row" style="justify-content:space-between"><h3 style="margin:0">챔피언 로테이션</h3>${g("reg5")}</div>
    <div id="box" style="margin-top:10px"></div>
  </div>`,r("#reg5").value=c.region,e(),r("#reg5").onchange=e;async function e(){c.region=r("#reg5").value;const t=new URL(l+"/v1/rotations");t.searchParams.set("region",c.region);try{const i=await v(t.toString()),a=await v(l+"/v1/ddragon/version"),n=await v(l+`/v1/ddragon/champions?ver=${a.version}`),s=Object.values(n.data).reduce((d,u)=>(d[u.key]=u.name,d),{}),o=i.freeChampionIds.map(d=>s[d]||d).sort();r("#box").innerHTML=`<div class="row">${o.map(d=>`<span class="pill">${b(d)}</span>`).join("")}</div>`}catch(i){m(i),r("#box").innerHTML='<div class="muted">불러오기 실패</div>'}}}function R(){p.innerHTML=`<div class="card">
    <div class="row" style="justify-content:space-between"><h3 style="margin:0">챔피언 목록</h3></div>
    <div id="box" style="margin-top:10px"></div>
  </div>`,(async()=>{try{const e=await v(l+"/v1/ddragon/version"),t=await v(l+`/v1/ddragon/champions?ver=${e.version}`),i=Object.values(t.data).sort((a,n)=>a.name.localeCompare(n.name,"ko")).map(a=>`<div class="pill">${b(a.name)}</div>`).join("");r("#box").innerHTML=`<div class="row">${i}</div>`}catch(e){m(e),r("#box").innerHTML='<div class="muted">불러오기 실패</div>'}})()}function g(e){return`<select id="${e}">
    <option value="kr">KR</option><option value="na1">NA</option><option value="euw1">EUW</option><option value="eun1">EUNE</option><option value="jp1">JP</option>
  </select>`}const b=e=>String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t]);k(0);
