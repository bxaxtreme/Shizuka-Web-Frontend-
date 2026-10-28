import { MongoClient, type Db } from "mongodb";

type MongoCache = { client: MongoClient | null; promise: Promise<MongoClient> | null };
const globalForMongo = globalThis as typeof globalThis & { __shizukaMongo?: MongoCache };
const cache = (globalForMongo.__shizukaMongo ??= { client: null, promise: null });

/** Lazy connection: routes can still return a useful 503 when env vars are missing. */
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (cache.client) return cache.client.db(process.env.MONGODB_DB || "shizuka");
  if (!cache.promise) {
    cache.promise = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 }).connect()
      .catch((error: unknown) => { cache.promise = null; throw error; });
  }
  cache.client = await cache.promise;
  return cache.client.db(process.env.MONGODB_DB || "shizuka");
}
