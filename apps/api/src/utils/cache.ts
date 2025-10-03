// apps/api/src/utils/cache.ts
const inFlight = new Map<string, Promise<any>>();

export async function coalesce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const ex = inFlight.get(key);
  if (ex) return ex;
  const p = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, p);
  return p;
}

export async function kvGetJSON<T=any>(kv: KVNamespace, key: string): Promise<T|null> {
  const v = await kv.get<T>(key, "json");
  return v || null;
}
export async function kvPut(kv: KVNamespace, key: string, obj: unknown, ttlSec: number) {
  await kv.put(key, JSON.stringify(obj), { expirationTtl: ttlSec });
}
