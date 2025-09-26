document.getElementById('searchBtn').addEventListener('click', async () => {
    const summonerName = document.getElementById('summonerName').value;
    if (!summonerName) return;

    const apiKey = 'YOUR_RIOT_API_KEY';  // 여기에 발급 받은 Riot API 키를 넣어야 함
    const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // 결과 표시
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('summonerId').textContent = `소환사 ID: ${data.id}`;
        document.getElementById('summonerLevel').textContent = `소환사 레벨: ${data.summonerLevel}`;
    } catch (error) {
        alert('소환사 정보를 불러오는 데 실패했습니다.');
    }
});
