(function(){const p=document.createElement("link").relList;if(p&&p.supports&&p.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))b(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const m of n.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&b(m)}).observe(document,{childList:!0,subtree:!0});function u(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function b(e){if(e.ep)return;e.ep=!0;const n=u(e);fetch(e.href,n)}})();const A="https://yee.mfleon32.workers.dev".replace(/\/+$/,"")||"https://yee.mfleon32.workers.dev";function j(){const f=document.querySelector("#app");f&&(f.innerHTML=`
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
          ${["경기","승률","평균 K/D/A","평균 KDA","평균 CS","평균 길이"].map(p=>`<div style="border:1px solid #444;border-radius:8px;padding:10px">
               <div style="opacity:.7;font-size:12px">${p}</div>
               <div id="stat-${encodeURIComponent(p)}" style="font-weight:600;margin-top:4px">-</div>
             </div>`).join("")}
        </div>
      </section>

      <section id="matchesSec" style="margin-top:16px">
        <h2 style="font-size:18px;margin:0 0 8px">최근 경기</h2>
        <div id="matches"></div>
      </section>
    </main>`)}function E(){j();const f=document.getElementById("msg"),p=document.getElementById("out"),u=document.getElementById("riotId"),b=document.getElementById("searchForm"),e=document.getElementById("searchBtn"),n=document.getElementById("platform"),m=document.getElementById("matches"),I=localStorage.getItem("thunder:platform")||"kr";[...n.options].some(t=>t.value===I)&&(n.value=I);const g=t=>f.textContent=t,v=t=>p.textContent=typeof t=="string"?t:JSON.stringify(t,null,2);let h=null;async function L(t,r){h==null||h.abort(),h=new AbortController,g("조회 중"),v(""),m.innerHTML="",C(null),e.disabled=!0;const d=performance.now(),o=`${A}/summoner?riotId=${encodeURIComponent(t)}&platform=${r}`;try{const s=await fetch(o,{signal:h.signal,headers:{Accept:"application/json"}}),c=Math.round(performance.now()-d);let a={};try{a=await s.json()}catch{}if(!s.ok){g(`오류 ${s.status} · ${c}ms`),v(a||s.statusText);return}g(`완료 · ${c}ms${a!=null&&a.cached?" · cache":""}`),v(a);const x=await fetch(`${A}/matches?riotId=${encodeURIComponent(t)}&platform=${r}&count=10`),y=await x.json().catch(()=>({}));x.ok&&Array.isArray(y.matches)?(m.innerHTML=k(y.matches),C(y.matches)):m.textContent=`경기 불러오기 실패 ${x.status}`}catch(s){const c=(s==null?void 0:s.name)==="AbortError";g(c?"타임아웃 10s":"네트워크 오류"),v(String(s))}finally{e.disabled=!1}}function C(t){const r=i=>document.getElementById(`stat-${encodeURIComponent(i)}`);if(!t||t.length===0){["경기","승률","평균 K/D/A","평균 KDA","평균 CS","평균 길이"].forEach(i=>r(i).textContent="-");return}const d=t.length,o=t.filter(i=>i.win).length,s=t.reduce((i,l)=>i+l.k,0),c=t.reduce((i,l)=>i+l.d,0),a=t.reduce((i,l)=>i+l.a,0),x=t.reduce((i,l)=>i+l.cs,0),y=t.reduce((i,l)=>i+l.duration,0),B=(o*100/d).toFixed(1)+"%",D=`${(s/d).toFixed(1)}/${(c/d).toFixed(1)}/${(a/d).toFixed(1)}`,M=c?((s+a)/c).toFixed(2):"Perfect",F=(x/d).toFixed(1),K=Math.round(y/d/60)+"m";r("경기").textContent=String(d),r("승률").textContent=B,r("평균 K/D/A").textContent=D,r("평균 KDA").textContent=M,r("평균 CS").textContent=F,r("평균 길이").textContent=K}function k(t){const r=["챔피언","승패","K/D/A","KDA","CS","골드","큐","길이"],d=t.map(o=>{const s=typeof o.kda=="string"?o.kda:(o.kda??"").toString(),c=o.win?"승":"패",a=Math.round((o.duration||0)/60)+"m";return`<tr>
        <td>${o.champion}</td>
        <td>${c}</td>
        <td>${o.k}/${o.d}/${o.a}</td>
        <td>${s}</td>
        <td>${o.cs}</td>
        <td>${o.gold}</td>
        <td>${o.queue}</td>
        <td>${a}</td>
      </tr>`}).join("");return`<table style="width:100%;border-collapse:collapse">
      <thead><tr>${r.map(o=>`<th style="text-align:left;border-bottom:1px solid #444;padding:6px">${o}</th>`).join("")}</tr></thead>
      <tbody>${d||'<tr><td colspan="8" style="padding:8px">기록 없음</td></tr>'}</tbody>
    </table>`}function S(){const t=((u==null?void 0:u.value)||"").trim(),r=n.value;if(!t.includes("#")){g("형식: GameName#TagLine");return}localStorage.setItem("thunder:lastRiotId",t),localStorage.setItem("thunder:platform",r),L(t,r)}b.addEventListener("submit",t=>{t.preventDefault(),S()}),u.addEventListener("keydown",t=>{t.key==="Enter"&&t.preventDefault()});const w=new URLSearchParams(location.search),$=w.get("riotId")||w.get("q")||localStorage.getItem("thunder:lastRiotId")||"";u&&$&&(u.value=$),$&&S()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",E):E();
