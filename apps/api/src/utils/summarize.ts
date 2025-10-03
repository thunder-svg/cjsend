// apps/api/src/utils/summarize.ts
export function summarize(matches: any[]) {
  const n = matches.length || 1;
  let wins = 0, kills = 0, deaths = 0, assists = 0, cs = 0;
  for (const m of matches) { if (m.win) wins++; kills += m.kills; deaths += m.deaths; assists += m.assists; cs += m.cs; }
  return { recent: { wins, losses: n - wins, kills, deaths, assists, avgCs: Math.round(cs / n) } };
}
