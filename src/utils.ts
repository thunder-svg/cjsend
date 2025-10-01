const API_BASE = import.meta.env.VITE_API_BASE;

export const getProfile = async (summonerId: string) => {
    const response = await fetch(`${API_BASE}/v1/profile?riotId=${summonerId}`);
    return await response.json();
};

export const getMatches = async (summonerId: string, count = 20) => {
    const response = await fetch(`${API_BASE}/v1/matches?riotId=${summonerId}&count=${count}`);
    return await response.json();
};

export const getMetaAnalysis = async () => {
    const response = await fetch(`${API_BASE}/v1/meta`);
    return await response.json();
};
