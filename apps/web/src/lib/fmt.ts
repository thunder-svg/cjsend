// apps/web/src/lib/fmt.ts
export const esc = (s: any) =>
  String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
export const fmt = (n: number) => Number(n || 0).toLocaleString();
export const kda = (k = 0, d = 0, a = 0) => {
  const v = d === 0 ? k + a : (k + a) / d;
  return v.toFixed(2);
};
