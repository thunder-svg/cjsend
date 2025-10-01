document.querySelector("#searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const riotId = document.querySelector("#riotId").value.trim();
  const region = document.querySelector("#region").value;

  if (!riotId) {
    alert("Riot ID를 입력해 주세요.");
    return;
  }

  // Cloudflare Worker API에 요청 보내기
  const apiUrl = `https://yee.mfleon32.workers.dev/v1/profile?riotId=${riotId}&region=${region}`;
  
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    if (data.error) {
      alert(`오류: ${data.error}`);
    } else {
      console.log("프로필 데이터:", data);
      // 결과 표시하는 로직 추가
      displayProfile(data);
    }
  } catch (error) {
    alert("API 요청에 실패했습니다. 다시 시도해주세요.");
    console.error("Error:", error);
  }
});

function displayProfile(data) {
  // 프로필 정보를 화면에 표시하는 로직
  const profileContainer = document.querySelector("#profileContainer");
  profileContainer.innerHTML = `
    <h3>${data.name}</h3>
    <p>Level: ${data.summonerLevel}</p>
    <p>Rank: ${data.rank}</p>
    <p>Profile Icon ID: ${data.profileIconId}</p>
  `;
}
