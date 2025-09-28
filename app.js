// app.js — Thunder minimal client
(() => {
  // 바꿔라: Cloudflare Worker 주소
  const API_BASE = window.THUNDER_API_BASE || "https://yee.mfleon32.workers.dev/";

  const $ = (id) => document.getElementById(id);
  const ipt = $("riotId");
  const btn = $("searchBtn");
  const msg = $("msg");
  const out = $("out");

  if (API_BASE.includes("<your-worker>")) {
    if (msg) msg.textContent = "API_BASE 미설정. app.js에서 워커 주소를 설정하라.";
  }

  const setMsg = (t) => { if (msg) msg.textContent = t; };
  const print = (v) => { if (out) out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2); };

  async function search(riotId) {
    setMsg("조회 중");
    print("");
    const url = `${API_BASE}/summoner?riotId=${encodeURIComponent(riotId)}`;
    const t0 = performance.now();
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      const dt = Math.round(performance.now() - t0);
      if (!res.ok) {
        setMsg(`오류 ${res.status} · ${dt}ms`);
        print(data || { error: "invalid_response" });
        return;
      }
      setMsg(`완료 · ${dt}ms${data.cached ? " · cache" : ""}`);
      print(data);
    } catch (e) {
      setMsg("네트워크 오류");
      print(String(e));
    }
  }

  function submit() {
    const riotId = (ipt?.value || "").trim();
    if (!riotId.includes("#")) {
      setMsg("형식: GameName#TagLine");
      return;
    }
    localStorage.setItem("thunder:lastRiotId", riotId);
    search(riotId);
  }

  btn && btn.addEventListener("click", submit);
  ipt && ipt.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

  // 초기값: URL ?riotId= 또는 ?q=, 없으면 최근 값
  const params = new URLSearchParams(location.search);
  const preset = params.get("riotId") || params.get("q") || localStorage.getItem("thunder:lastRiotId") || "";
  if (ipt && preset) ipt.value = preset;
  if (preset) submit();
})();
