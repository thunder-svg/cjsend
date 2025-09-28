(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))m(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&m(r)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function m(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const $="https://yee.mfleon32.workers.dev".replace(/\/+$/,"")||"https://yee.mfleon32.workers.dev";function v(){const i=document.querySelector("#app");i&&(i.innerHTML=`
    <main style="max-width:880px;margin:24px auto;padding:16px">
      <h1 style="margin:0 0 12px">Thunder</h1>
      <form id="searchForm" style="display:flex;gap:8px;align-items:center">
        <input id="riotId" placeholder="GameName#TagLine" autocomplete="off" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:6px"/>
        <button id="searchBtn" type="submit" style="padding:8px 12px;border:1px solid #ccc;border-radius:6px;cursor:pointer">검색</button>
      </form>
      <p id="msg" role="status" style="min-height:1.2em;margin:12px 0 0"></p>
      <pre id="out" style="white-space:pre-wrap;overflow:auto;border:1px solid #eee;border-radius:8px;padding:12px;margin-top:8px"></pre>
      <section id="matchesSec" style="margin-top:16px">
        <h2 style="font-size:18px;margin:0 0 8px">최근 경기</h2>
        <div id="matches"></div>
      </section>
    </main>`)}function w(){v();const i=document.getElementById("msg"),c=document.getElementById("out"),s=document.getElementById("riotId"),m=document.getElementById("searchForm"),n=document.getElementById("searchBtn"),o=document.getElementById("matches"),r=e=>i.textContent=e,p=e=>c.textContent=typeof e=="string"?e:JSON.stringify(e,null,2);let l=null;async function I(e){l==null||l.abort(),l=new AbortController,r("조회 중"),p(""),o.innerHTML="",n.disabled=!0;const h=performance.now(),g=`${$}/summoner?riotId=${encodeURIComponent(e)}`;try{const t=await fetch(g,{signal:l.signal,headers:{Accept:"application/json"}}),a=Math.round(performance.now()-h);let d={};try{d=await t.json()}catch{}if(!t.ok){r(`오류 ${t.status} · ${a}ms`),p(d||t.statusText);return}r(`완료 · ${a}ms${d!=null&&d.cached?" · cache":""}`),p(d);const u=await fetch(`${$}/matches?riotId=${encodeURIComponent(e)}&count=10`),b=await u.json().catch(()=>({}));u.ok&&Array.isArray(b.matches)?o.innerHTML=L(b.matches):o.textContent=`경기 불러오기 실패 ${u.status}`}catch(t){const a=(t==null?void 0:t.name)==="AbortError";r(a?"타임아웃 10s":"네트워크 오류"),p(String(t))}finally{n.disabled=!1}}function L(e){const h=["챔피언","승패","K/D/A","KDA","CS","골드","큐","길이"],g=e.map(t=>{const a=typeof t.kda=="string"?t.kda:(t.kda??"").toString(),d=t.win?"승":"패",u=Math.round((t.duration||0)/60)+"m";return`<tr>
        <td>${t.champion}</td>
        <td>${d}</td>
        <td>${t.k}/${t.d}/${t.a}</td>
        <td>${a}</td>
        <td>${t.cs}</td>
        <td>${t.gold}</td>
        <td>${t.queue}</td>
        <td>${u}</td>
      </tr>`}).join("");return`<table style="width:100%;border-collapse:collapse">
      <thead><tr>${h.map(t=>`<th style="text-align:left;border-bottom:1px solid #444;padding:6px">${t}</th>`).join("")}</tr></thead>
      <tbody>${g||'<tr><td colspan="8" style="padding:8px">기록 없음</td></tr>'}</tbody>
    </table>`}function y(){const e=((s==null?void 0:s.value)||"").trim();if(!e.includes("#")){r("형식: GameName#TagLine");return}localStorage.setItem("thunder:lastRiotId",e),I(e)}m.addEventListener("submit",e=>{e.preventDefault(),y()}),s.addEventListener("keydown",e=>{e.key==="Enter"&&e.preventDefault()});const x=new URLSearchParams(location.search),f=x.get("riotId")||x.get("q")||localStorage.getItem("thunder:lastRiotId")||"";s&&f&&(s.value=f),f&&y()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w();
