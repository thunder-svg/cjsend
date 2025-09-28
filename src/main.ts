import "./style.css";

const API_BASE = "https://<your-worker>.workers.dev"; // 교체

function init() {
  const msg = document.getElementById("msg")!;
  const out = document.getElementById("out")!;
  const ipt = document.getElementById("riotId") as HTMLInputElement | null;

  const setMsg = (t: string) => (msg.textContent = t);
  const print = (v: any) => (out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2));

  async function search(riotId: string) {
    setMsg("조회 중"); print("");
    const t0 = performance.now();
    const res = await fetch(`${API_BASE}/summoner?riotId=${encodeURIComponent(riotId)}`);
    const data = await res.json().catch(() => ({}));
    const dt = Math.round(performance.now() - t0);
    if (!res.ok) { setMsg(`오류 ${res.status} · ${dt}ms`); print(data); return; }
    setMsg(`완료 · ${dt}ms${data.cached ? " · cache" : ""}`); print(data);
  }

  function submit() {
    const v = (ipt?.value || "").trim();
    if (!v.includes("#")) { setMsg("형식: GameName#TagLine"); return; }
    localStorage.setItem("thunder:lastRiotId", v);
    search(v);
  }

  document.addEventListener("click", (e) => {
    const el = (e.target as Element | null)?.closest("#searchBtn");
    if (el) { e.preventDefault(); submit(); }
  });
  ipt?.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

  const q = new URLSearchParams(location.search);
  const preset = q.get("riotId") || q.get("q") || localStorage.getItem("thunder:lastRiotId") || "";
  if (ipt && preset) ipt.value = preset;
  if (preset) submit();
}

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();

