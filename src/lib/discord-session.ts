import { createHmac, timingSafeEqual } from "node:crypto";
export type DiscordSession = { id: string; username: string; avatar: string | null; exp: number };
function secret() { const s = process.env.SESSION_SECRET; if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters"); return s; }
export function signSession(data: DiscordSession) { const payload = Buffer.from(JSON.stringify(data)).toString("base64url"); const sig = createHmac("sha256", secret()).update(payload).digest("base64url"); return `${payload}.${sig}`; }
export function readSession(token?: string): DiscordSession | null {
  if (!token) return null;
  try { const [payload, signature] = token.split("."); if (!payload || !signature) return null; const expected = createHmac("sha256", secret()).update(payload).digest(); const actual = Buffer.from(signature, "base64url"); if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null; const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as DiscordSession; if (!data.id || !data.exp || data.exp < Date.now()) return null; return data; } catch { return null; }
}
