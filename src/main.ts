import "./style.css";

// .env의 VITE_API_BASE가 있으면 우선 사용. 없으면 아래 상수 사용.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://yee.mfleon32.workers.dev"; // 교체

function render() {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) return;
  root.innerHTML = `
    <main style="max-width:720px;margin:24px auto;padding:16px">
      <h1 style="margin:0 0 12px">Thunder</h1>
      <form id="searchForm" style="display:flex;gap:8px;align-items:center">
        <input id="riotId" placeholder="GameName#TagLine" autocomplete="off" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:6px"/>
        <button id="searchBtn" type="submit" style="padding:8px 12px;border:1px solid #ccc;border-radius:6px;cursor:pointer">검색</button>
      </form>
      <p id="msg" role="status" style="min-height:1.2em;margin:12px 0 0"></p>
      <pre id="out" style="white-space:pre-wrap;overflow:auto;border:1px solid #eee;border-radius:8px;padding:12px;margin-top:8px"></pre>
    </main>`;
}

function init() {
  render();

  const msg = document.getElementById("msg")!;
  const out = document.getElementById("out")!;
  const ipt = document.getElementById("riotId") as HTMLInputElement;
  const form = document.getElementById("searchForm") as HTMLFormElement;
  const btn = document.getElementById("searchBtn") as HTMLButtonElement;

  const setMsg = (t: string) => (msg.textContent = t);
  const print = (v: unknown) =>
    (out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2));

  let inflight: AbortController | null = null;

  async function search(riotId: string) {
    inflight?.abort();
    inflight = new AbortController();

    setMsg("조회 중");
    print("");
    btn.disabled = true;

    const t0 = performance.now();
    const url = `${API_BASE}/summoner?riotId=${encodeURIComponent(riotId)}`;

    try {
      const timeout = setTimeout(() => inflight?.abort(), 10000);
      const res = await fetch(url, {
        signal: inflight.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      const dt = Math.round(performance.now() - t0);
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setMsg(`오류 ${res.status} · ${dt}ms`);
        print(data || res.statusText);
        return;
      }

      setMsg(`완료 · ${dt}ms${data?.cached ? " · cache" : ""}`);
      print(data);
    } catch (err: any) {
      const aborted = err?.name === "AbortError";
      setMsg(aborted ? "타임아웃 10s" : "네트워크 오류");
      print(String(err));
    } finally {
      btn.disabled = false;
    }
  }

  function submit() {
    const v = (ipt?.value || "").trim();
    if (!v.includes("#")) {
      setMsg("형식: GameName#TagLine");
      return;
    }
    localStorage.setItem("thunder:lastRiotId", v);
    search(v);
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    submit();
  });
  ipt?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault();
  });

  const q = new URLSearchParams(location.search);
  const preset =
    q.get("riotId") || q.get("q") || localStorage.getItem("thunder:lastRiotId") || "";
  if (ipt && preset) ipt.value = preset;
  if (preset) submit();
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init)
  : init();
