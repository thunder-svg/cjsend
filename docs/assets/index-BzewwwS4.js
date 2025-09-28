(function(){const p=document.createElement("link").relList;if(p&&p.supports&&p.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))b(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&b(u)}).observe(document,{childList:!0,subtree:!0});function f(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function b(r){if(r.ep)return;r.ep=!0;const i=f(r);fetch(r.href,i)}})();const M="https://yee.mfleon32.workers.dev".replace(/\/+$/,"")||"https://yee.mfleon32.workers.dev";function G(){const x=document.querySelector("#app");x&&(x.innerHTML=`
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
    </main>`)}function q(){G();const x=document.getElementById("msg"),p=document.getElementById("out"),f=document.getElementById("riotId"),b=document.getElementById("searchForm"),r=document.getElementById("searchBtn"),i=document.getElementById("platform"),u=document.getElementById("matches"),D=document.getElementById("queueFilter"),I=document.getElementById("prevBtn"),$=document.getElementById("nextBtn"),C=document.getElementById("pageInfo"),S=localStorage.getItem("thunder:platform")||"kr";[...i.options].some(t=>t.value===S)&&(i.value=S);const y=t=>x.textContent=t,v=t=>p.textContent=typeof t=="string"?t:JSON.stringify(t,null,2);let h=null,m=0;const g=10;let w=[];async function R(t,n){h==null||h.abort(),h=new AbortController,y("조회 중"),v(""),u.innerHTML="",L(null),r.disabled=!0,m=0;const o=performance.now(),e=`${M}/summoner?riotId=${encodeURIComponent(t)}&platform=${n}`;try{const a=await fetch(e,{signal:h.signal,headers:{Accept:"application/json"}}),c=Math.round(performance.now()-o);let d={};try{d=await a.json()}catch{}if(!a.ok){y(`오류 ${a.status} · ${c}ms`),v(d||a.statusText);return}y(`완료 · ${c}ms${d!=null&&d.cached?" · cache":""}`),v(d),await B()}catch(a){const c=(a==null?void 0:a.name)==="AbortError";y(c?"타임아웃 10s":"네트워크 오류"),v(String(a))}finally{r.disabled=!1}}async function B(){const t=(f.value||"").trim(),n=i.value;C.textContent="로딩…",u.innerHTML="";const o=await fetch(`${M}/matches?riotId=${encodeURIComponent(t)}&platform=${n}&count=${g}&start=${m}`),e=await o.json().catch(()=>({}));if(!(o.ok&&Array.isArray(e.matches))){u.textContent=`경기 불러오기 실패 ${o.status}`,C.textContent="-",I.disabled=m===0,$.disabled=!0;return}w=e.matches,A()}function A(){const t=j(w,D.value);u.innerHTML=K(t),L(t);const n=m/g+1;C.textContent=`페이지 ${n}`,I.disabled=m===0,$.disabled=w.length<g}function j(t,n){if(n==="all")return t;const o=e=>t.filter(a=>e.includes(a.queueId));switch(n){case"ranked":return o([420,440]);case"aram":return o([450]);case"arena":return o([1700]);case"urf":return o([1900]);case"normal":return o([400,430]);default:return t}}function L(t){const n=s=>document.getElementById(`stat-${encodeURIComponent(s)}`);if(!t||t.length===0){["경기","승률","평균 K/D/A","평균 KDA","평균 CS","평균 길이"].forEach(s=>n(s).textContent="-");return}const o=t.length,e=t.filter(s=>s.win).length,a=t.reduce((s,l)=>s+l.k,0),c=t.reduce((s,l)=>s+l.d,0),d=t.reduce((s,l)=>s+l.a,0),T=t.reduce((s,l)=>s+l.cs,0),O=t.reduce((s,l)=>s+l.duration,0),P=(e*100/o).toFixed(1)+"%",z=`${(a/o).toFixed(1)}/${(c/o).toFixed(1)}/${(d/o).toFixed(1)}`,N=c?((a+d)/c).toFixed(2):"Perfect",U=(T/o).toFixed(1),H=Math.round(O/o/60)+"m";n("경기").textContent=String(o),n("승률").textContent=P,n("평균 K/D/A").textContent=z,n("평균 KDA").textContent=N,n("평균 CS").textContent=U,n("평균 길이").textContent=H}function K(t){const n=["챔피언","승패","K/D/A","KDA","CS","골드","큐","길이"],o=t.map(e=>{const a=typeof e.kda=="string"?e.kda:(e.kda??"").toString(),c=e.win?"승":"패",d=Math.round((e.duration||0)/60)+"m";return`<tr>
        <td>${e.champion}</td>
        <td>${c}</td>
        <td>${e.k}/${e.d}/${e.a}</td>
        <td>${a}</td>
        <td>${e.cs}</td>
        <td>${e.gold}</td>
        <td>${e.queue}</td>
        <td>${d}</td>
      </tr>`}).join("");return`<table style="width:100%;border-collapse:collapse">
      <thead><tr>${n.map(e=>`<th style="text-align:left;border-bottom:1px solid #444;padding:6px">${e}</th>`).join("")}</tr></thead>
      <tbody>${o||'<tr><td colspan="8" style="padding:8px">기록 없음</td></tr>'}</tbody>
    </table>`}function k(){const t=((f==null?void 0:f.value)||"").trim(),n=i.value;if(!t.includes("#")){y("형식: GameName#TagLine");return}localStorage.setItem("thunder:lastRiotId",t),localStorage.setItem("thunder:platform",n),R(t,n)}b.addEventListener("submit",t=>{t.preventDefault(),k()}),document.getElementById("queueFilter").addEventListener("change",()=>A()),I.addEventListener("click",()=>{m>=g&&(m-=g,B())}),$.addEventListener("click",()=>{m+=g,B()});const F=new URLSearchParams(location.search),E=F.get("riotId")||F.get("q")||localStorage.getItem("thunder:lastRiotId")||"";E&&(f.value=E),E&&k()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",q):q();
