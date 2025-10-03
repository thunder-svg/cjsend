// apps/api/src/utils/cors.ts
export const allow = (o: string, env?: { CORS_ORIGIN?: string }) => {
  const ok = env?.CORS_ORIGIN || "http://localhost:5173";
  return o && [ok, "http://localhost:5173"].includes(o) ? o : ok;
};
export const cors = (o: string) => ({
  "Access-Control-Allow-Origin": o,
  "Vary": "Origin",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
});
