import "./style.css";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://yee.mfleon32.workers.dev";

function render() {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) return;
  root.innerHTML = `
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
    </main>`;
}

function init() {
  render();

  const msg = document.getElementById("msg")!;
  const out = document.getElementById("out")!;
  const ipt = document.getElementById("riotId") as HTMLInputElement;
  const form = document.getElementById("searchForm") as HTMLFormElement;
  const btn = document.getElementById("searchBtn") as HTMLButtonElement;
  const matchesBox = document.getElementById("matches") as HTMLDivElement;

  const setMsg = (t: string) => (msg.textContent = t);
  const print = (v: unknown) =>
    (out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2));

  let inflight: AbortController | null = null;

  async function search(riotId: string) {
    inflight?.abort();
    inflight = new AbortController();

    setMsg("조회 중");
    print("");
    matchesBox.innerHTML = "";
    btn.disabled = true;

    const t0 = performance.now();
    const url = `${API_BASE}/summoner?riotId=${encodeURIComponent(riotId)}`;

    try {
      const res = await fetch(url, { signal: inflight.signal, headers: { Accept: "application/json" } });
      const dt = Math.round(performance.now() - t0);
      let data: any = {}; try { data = await res.json(); } catch {}
      if (!res.ok) { setMsg(`오류 ${res.status} · ${dt}ms`); print(data || res.statusText); return; }
      setMsg(`완료 · ${dt}ms${data?.cached ? " · cache" : ""}`);
      print(data);

      const mres = await fetch(`${API_BASE}/matches?riotId=${encodeURIComponent(riotId)}&count=10`);
      const mdata: any = await mres.json().catch(() => ({}));
      if (mres.ok && Array.isArray(mdata.matches)) {
        matchesBox.innerHTML = toTable(mdata.matches);
      } else {
        matchesBox.textContent = `경기 불러오기 실패 ${mres.status}`;
      }
    } catch (err: any) {
      const aborted = err?.name === "AbortError";
      setMsg(aborted ? "타임아웃 10s" : "네트워크 오류");
      print(String(err));
    } finally {
      btn.disabled = false;
    }
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
    if (!v.includes("#")) { setMsg("형식: GameName#TagLine"); return; }
    localStorage.setItem("thunder:lastRiotId", v);
    search(v);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  ipt.addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });

  const q = new URLSearchParams(location.search);
  const preset =
    q.get("riotId") || q.get("q") || localStorage.getItem("thunder:lastRiotId") || "";
  if (ipt && preset) ipt.value = preset;
  if (preset) submit();
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init)
  : init();
