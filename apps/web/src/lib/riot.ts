// apps/web/src/lib/riot.ts
export type RankEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type MatchLite = {
  id: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  win: boolean;
  role?: string;
  lane?: string;
  queueId?: number;
  gameDuration?: number;
  gameEndTimestamp?: number;
};

export type SearchResponse = {
  input: { query: string; region: string; mock: boolean };
  summoner: {
    id?: string;
    puuid?: string;
    name?: string;
    gameName?: string;
    tagLine?: string;
    profileIconId?: number;
    summonerLevel?: number;
  };
  ranks: RankEntry[];
  recentMatches: MatchLite[];
  summary: { recent: { wins:number; losses:number; kills:number; deaths:number; assists:number; avgCs:number } };
};

export type CompareResponse = {
  region: string;
  left: SearchResponse;
  right: SearchResponse;
};

export type RankingEntry = {
  summonerId: string;
  summonerName: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};
export type RankingResponse = {
  region: string;
  queue: string;
  entries: RankingEntry[];
  snapshotAt: number;
};
