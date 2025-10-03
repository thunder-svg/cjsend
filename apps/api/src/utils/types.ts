// apps/api/src/utils/types.ts
export type RankEntry = { queueType:string; tier:string; rank:string; leaguePoints:number; wins:number; losses:number; };
export type MatchLite = { id:string; championName:string; kills:number; deaths:number; assists:number; cs:number; win:boolean; role?:string; lane?:string; queueId?:number; gameDuration?:number; gameEndTimestamp?:number; };
