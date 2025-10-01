const getHashQuery = () => {
  const h = location.hash || "";
  const i = h.indexOf("?");
  return new URLSearchParams(i >= 0 ? h.slice(i + 1) : "");
};

// Riot ID 또는 소환사 이름 검색 처리
const searchProfile = async () => {
  const searchInput = ($("#name") as HTMLInputElement).value.trim();
  if (searchInput.includes("#")) {
    // Riot ID 형태
    const [gameName, tagLine] = searchInput.split("#");
    setRoute("/profile", { name: gameName, riotId: searchInput });
  } else {
    // 이름만
    setRoute("/profile", { name: searchInput });
  }
};

// API 호출 예시
async function getProfileData(riotId: string, name: string) {
  const url = new URL("/v1/profile", API_BASE);
  if (riotId) url.searchParams.set("riotId", riotId);
  if (name) url.searchParams.set("name", name);
  const response = await fetch(url.toString());
  return response.json();
}

// 페이지 이동 함수
function setRoute(path: string, params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") q.set(k, String(v)); });
  location.hash = `${path}?${q.toString()}`;
}

// 페이지 로드 시 실행
window.addEventListener("hashchange", async () => {
  const query = getHashQuery();
  const riotId = query.get("riotId");
  const name = query.get("name");

  if (riotId || name) {
    const profileData = await getProfileData(riotId || "", name || "");
    console.log(profileData);
    // 페이지 업데이트 로직 추가 (프로필 정보 렌더링)
  }
});
