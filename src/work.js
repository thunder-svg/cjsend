// CORS 헤더 추가
const cors = (origin) => {
  const headers = {
    "Access-Control-Allow-Origin": origin, // 요청을 보내는 origin을 허용
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
  return headers;
};

// Riot API 호출 함수
async function fetchRiotAPI(path, env) {
  const apiKey = env.RIOT_API_KEY;
  if (!apiKey) throw new Error('Riot API Key is not set in the environment variables');
  
  const url = `https://api.riotgames.com${path}`;
  const response = await fetch(url, { headers: { 'X-Riot-Token': apiKey } });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.status.message);
  }
  return await response.json();
}

// DDragon (Dragon Data) API 호출 함수
async function fetchDDragonVersion() {
  const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await res.json();
  return versions[0];  // Latest version
}

// DDragon 챔피언 데이터 가져오기
async function fetchDDragonChampions(version) {
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
  const data = await res.json();
  return data.data;
}

// 레이트 리미트 처리
async function rateLimitHandler(req, env) {
  const ip = req.headers.get("CF-Connecting-IP");
  const cacheKey = `rate_limit:${ip}`;
  let attempts = await env.THUNDER_KV.get(cacheKey, { type: "json" }) || { count: 0, timestamp: Date.now() };

  if (Date.now() - attempts.timestamp > 60000) { // 1 minute window
    attempts.count = 0;
    attempts.timestamp = Date.now();
  }
  
  if (attempts.count >= 100) {
    return new Response("Rate limit exceeded", { status: 429 });
  }
  
  attempts.count++;
  await env.THUNDER_KV.put(cacheKey, JSON.stringify(attempts));

  return new Response("Request allowed", { status: 200 });
}

// 요청 핸들링
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event));
});

async function handleRequest(req, env) {
  const url = new URL(req.url);
  const origin = req.headers.get("Origin") || "*"; // CORS 헤더에 사용할 origin
  const headers = cors(origin);

  // 레이트 리미트 처리
  const rateLimitResponse = await rateLimitHandler(req, env);
  if (rateLimitResponse.status === 429) return rateLimitResponse;

  // 엔드포인트 처리
  if (url.pathname === '/v1/profile') {
    return profileHandler(req, env, headers);
  }
  if (url.pathname === '/v1/compare') {
    return compareHandler(req, env, headers);
  }
  if (url.pathname === '/v1/meta') {
    return metaAnalysisHandler(req, env, headers);
  }

  return new Response('Not Found', { status: 404, headers: headers });
}

// 프로필 핸들러
async function profileHandler(req, env, headers) {
  const riotId = new URL(req.url).searchParams.get('riotId');
  if (!riotId) return new Response('Riot ID is required', { status: 400, headers: headers });

  try {
    const summonerData = await fetchRiotAPI(`/lol/summoner/v4/summoners/by-name/${riotId}`, env);
    const matchData = await fetchRiotAPI(`/lol/match/v5/matches/by-puuid/${summonerData.puuid}/ids?count=20`, env);
    return new Response(JSON.stringify({ summonerData, matchData }), { status: 200, headers: headers });
  } catch (e) {
    return new Response(`Error fetching data: ${e.message}`, { status: 500, headers: headers });
  }
}

// 비교 핸들러
async function compareHandler(req, env, headers) {
  const riotIdA = new URL(req.url).searchParams.get('riotIdA');
  const riotIdB = new URL(req.url).searchParams.get('riotIdB');
  if (!riotIdA || !riotIdB) return new Response('Both Riot IDs are required', { status: 400, headers: headers });

  try {
    const dataA = await fetchRiotAPI(`/lol/summoner/v4/summoners/by-name/${riotIdA}`, env);
    const dataB = await fetchRiotAPI(`/lol/summoner/v4/summoners/by-name/${riotIdB}`, env);
    return new Response(JSON.stringify({ dataA, dataB }), { status: 200, headers: headers });
  } catch (e) {
    return new Response(`Error fetching comparison data: ${e.message}`, { status: 500, headers: headers });
  }
}

// 메타 분석 핸들러
async function metaAnalysisHandler(req, env, headers) {
  try {
    const version = await fetchDDragonVersion();
    const champions = await fetchDDragonChampions(version);
    const matchData = await fetchRiotAPI('/lol/match/v5/matches', env);
    return new Response(JSON.stringify({ champions, matchData }), { status: 200, headers: headers });
  } catch (e) {
    return new Response(`Error in meta analysis: ${e.message}`, { status: 500, headers: headers });
  }
}
