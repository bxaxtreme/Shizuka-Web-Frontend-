import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function isTrustedBotRequest(request: NextRequest): boolean {
  const expected = process.env.BOT_API_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || request.headers.get("x-bot-secret") || "";
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}
