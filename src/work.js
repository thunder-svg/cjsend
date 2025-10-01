// CORS 처리
const cors = (origin) => {
  const headers = {
    "Access-Control-Allow-Origin": origin || "*", // 모든 출처 허용
    "Access-Control-Allow-Methods": "GET, OPTIONS", // 허용되는 메소드
    "Access-Control-Allow-Headers": "Content-Type", // 허용되는 헤더
    "Content-Type": "application/json; charset=utf-8",
  };
  return headers;
};

// Riot API에서 소환사 이름 처리
const getByNameRoute = async (env, { router, platform, name }) => {
  const sanitizedGameName = name.trim();
  const result = await riotFetch(env, `${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(sanitizedGameName)}`, "summoner_by_name");
  return result;
};

// Riot API 호출 함수 (예시)
async function riotFetch(env, path, where = "") {
  const url = path.startsWith("http") ? path : `https://${path}`;
  const token = (env.RIOT_API_KEY || "").trim();
  if (!token || !token.startsWith("RGAPI-")) {
    throw new Error("Invalid API key");
  }
  const r = await fetch(url, { headers: { "X-Riot-Token": token } });
  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: ${data}`);
  }
  return data;
}

// API 요청 처리
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "*";
    const mock = req.headers.get("mock") === "1";  // Mock 모드 활성화 여부

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

    // 기본적으로 API 라우터 설정
    if (url.pathname === "/v1/profile") {
      const name = url.searchParams.get("name");
      const riotId = url.searchParams.get("riotId");
      if (!name && !riotId) {
        return new Response(JSON.stringify({ error: "No name or riotId provided" }), { status: 400 });
      }
      
      let result = null;
      if (riotId) {
        // Riot ID 방식
        const [gameName, tagLine] = riotId.split("#");
        result = await getByNameRoute(env, { router: "americas", platform: "na1", name: gameName });
      } else {
        // 이름만
        result = await getByNameRoute(env, { router: "americas", platform: "na1", name });
      }

      return new Response(JSON.stringify(result), { status: 200, headers: cors(origin) });
    }

    // 다른 API 라우트 예시
    if (url.pathname === "/v1/summary") {
      return json({ summary: "Summary API response here." }, 200, origin);
    }

    return new Response("Not Found", { status: 404 });
  },
};
