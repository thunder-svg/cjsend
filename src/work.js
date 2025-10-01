async function profileHandler(req) {
    const riotId = new URL(req.url).searchParams.get('riotId');
    const summonerData = await fetchRiotAPI(`/lol/summoner/v4/summoners/by-name/${riotId}`);
    const matchData = await fetchRiotAPI(`/lol/match/v5/matches/by-puuid/${summonerData.puuid}/ids?count=20`);
    return new Response(JSON.stringify({ summonerData, matchData }), { status: 200 });
}

async function compareHandler(req) {
    const riotIdA = new URL(req.url).searchParams.get('riotIdA');
    const riotIdB = new URL(req.url).searchParams.get('riotIdB');
    const dataA = await fetchRiotAPI(`/lol/summoner/v4/summoners/by-name/${riotIdA}`);
    const dataB = await fetchRiotAPI(`/lol/summoner/v4/summoners/by-name/${riotIdB}`);
    return new Response(JSON.stringify({ dataA, dataB }), { status: 200 });
}

async function fetchRiotAPI(path) {
    const apiKey = 'YOUR_RIOT_API_KEY';  // 실제 API 키 사용
    const url = `https://api.riotgames.com${path}`;
    const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } });
    return res.json();
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(req) {
    const url = new URL(req.url);
    if (url.pathname === '/v1/profile') {
        return profileHandler(req);
    }
    if (url.pathname === '/v1/compare') {
        return compareHandler(req);
    }
    return new Response('Not Found', { status: 404 });
}
