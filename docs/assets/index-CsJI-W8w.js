(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();const w="https://yee.mfleon32.workers.dev/",h=!0,d=(e,t=document)=>t.querySelector(e),m=d("#err");let g=0;const k=e=>{g++,m.textContent=g+" error",m.hidden=!1,console.error(e)},c=(e,t)=>e.classList.toggle("loading",!!t),y=async e=>{const t=await fetch(e,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error("HTTP "+t.status+" "+e);return t.json()};async function u(e,t,n=10){const i=new URL(w+"/v1/profile");return i.searchParams.set("region",e),i.searchParams.set("name",t),i.searchParams.set("count",String(n)),y(i.toString())}function v(e){return{region:"kr",name:e,level:413,iconId:4568,rank:{queue:"RANKED_SOLO_5x5",tier:"CHALLENGER",division:"I",lp:1020,wins:720,losses:610},last10:[{k:8,d:2,a:7,win:!0,cs:220,dur:31,champ:"Ahri"},{k:3,d:5,a:9,win:!0,cs:180,dur:28,champ:"Orianna"},{k:10,d:1,a:11,win:!0,cs:242,dur:33,champ:"Azir"},{k:2,d:7,a:4,win:!1,cs:160,dur:26,champ:"LeBlanc"},{k:9,d:3,a:6,win:!0,cs:210,dur:29,champ:"Akali"},{k:4,d:6,a:8,win:!1,cs:190,dur:30,champ:"Syndra"},{k:7,d:2,a:5,win:!0,cs:230,dur:32,champ:"Ahri"},{k:11,d:4,a:3,win:!0,cs:250,dur:34,champ:"Azir"},{k:6,d:3,a:9,win:!0,cs:205,dur:30,champ:"Viktor"},{k:1,d:9,a:2,win:!1,cs:150,dur:25,champ:"Yone"}]}}function f(e){const t=e.reduce((i,r)=>(i.k+=r.k,i.d+=r.d,i.a+=r.a,i.w+=r.win?1:0,i),{k:0,d:0,a:0,w:0}),n=t.d?(t.k+t.a)/t.d:t.k+t.a;return{games:e.length,wins:t.w,winrate:Math.round(t.w/e.length*100),k:t.k,d:t.d,a:t.a,kda:Number(n.toFixed(2))}}const $=e=>e.toLocaleString();function p(e){const t=f(e.last10||[]);return`
        <div class="grid g2" style="align-items:center">
          <div class="row" style="align-items:center;gap:12px">
            <div style="width:54px;height:54px;border-radius:14px;background:#222;display:grid;place-items:center;font-weight:700">${String(e.iconId||"")}</div>
            <div>
              <div style="font-weight:700">${e.name} <span class="muted">LV ${$(e.level||0)}</span></div>
              <div class="muted">${e.rank?`${e.rank.tier} ${e.rank.division} • ${e.rank.lp}LP`:"Unranked"}</div>
            </div>
          </div>
          <div class="row" style="justify-content:flex-end;gap:16px">
            <div class="kpi"><div class="v">${t.winrate}%</div><div class="l">승률(10)</div></div>
            <div class="kpi"><div class="v">${t.kda}</div><div class="l">KDA</div></div>
            <div class="kpi"><div class="v">${t.k}/${t.d}/${t.a}</div><div class="l">합산</div></div>
          </div>
        </div>
        <div class="hr"></div>
        <div class="grid g3">
          ${o(e.last10,"mid")}
          ${o(e.last10,"top")}
          ${o(e.last10,"adc")}
        </div>
      `}function o(e,t){const n=e.length||1,i=e.filter(s=>s.win).length,r=Math.round(i/n*100);return`<div>
        <div class="row" style="justify-content:space-between"><b>${t.toUpperCase()}</b><span class="muted">${i}/${n}</span></div>
        <div class="bar"><i style="width:${r}%;background:${r>=50?"var(--ok)":"var(--bad)"}"></i></div>
      </div>`}function b(e,t){const n=f(e.last10||[]),i=f(t.last10||[]),r=(s,a)=>s-a>0?"+"+(s-a):String(s-a);return`
        <div class="grid g2">
          <div class="card">${p(e)}</div>
          <div class="card">${p(t)}</div>
        </div>
        <div class="card" style="margin-top:12px">
          <h4 style="margin:0 0 8px">핵심 지표 비교</h4>
          <div class="grid g3">
            ${l("승률(10)",n.winrate+"%",i.winrate+"%",r(n.winrate,i.winrate)+"%")}
            ${l("KDA",n.kda,i.kda,r(n.kda,i.kda))}
            ${l("합산 K/D/A",`${n.k}/${n.d}/${n.a}`,`${i.k}/${i.d}/${i.a}`,r(n.k+n.a,i.k+i.a))}
          </div>
        </div>
      `}function l(e,t,n,i){const s=Number(i.replace("+",""))>0;return`<div class="card">
        <div class="row" style="justify-content:space-between"><b>${e}</b><span class="muted">Δ ${i}</span></div>
        <div class="row" style="gap:12px;margin-top:8px">
          <div style="flex:1">
            <div class="muted" style="font-size:12px">A</div>
            <div class="bar"><i style="width:50%"></i></div>
            <div style="margin-top:6px">${t}</div>
          </div>
          <div style="flex:1">
            <div class="muted" style="font-size:12px">B</div>
            <div class="bar"><i style="width:50%;background:${s?"var(--bad)":"var(--ok)"}"></i></div>
            <div style="margin-top:6px">${n}</div>
          </div>
        </div>
      </div>`}d("#form-search").addEventListener("submit",async e=>{e.preventDefault();const t=d("#search-out");t.innerHTML="";const n=d("#region").value.trim(),i=d("#name").value.trim();if(i){c(e.currentTarget,!0);try{let r;try{r=await u(n,i)}catch{h&&(r=v(i))}t.innerHTML=`<div class="card">${p(r)}</div>`}catch(r){k(r),t.innerHTML='<div class="muted">불러오기 실패</div>'}finally{c(e.currentTarget,!1)}}});d("#form-compare").addEventListener("submit",async e=>{e.preventDefault();const t=d("#compare-out");t.innerHTML="";const n=d("#region2").value.trim(),i=d("#nameA").value.trim(),r=d("#nameB").value.trim();if(!(!i||!r)){c(e.currentTarget,!0);try{let s,a;try{[s,a]=await Promise.all([u(n,i),u(n,r)])}catch{h&&(s=v(i),a=v(r))}t.innerHTML=b(s,a)}catch(s){k(s),t.innerHTML='<div class="muted">불러오기 실패</div>'}finally{c(e.currentTarget,!1)}}});
