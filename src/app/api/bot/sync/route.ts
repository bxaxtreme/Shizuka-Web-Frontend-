import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isTrustedBotRequest } from "@/lib/bot-auth";
import { isDiscordId, safeCount, safeText } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isTrustedBotRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "JSON object required" }, { status: 400 });
  const data = body as Record<string, unknown>;
  const now = new Date();
  // Event counters are maintained by /api/bot/events to avoid periodic syncs resetting them.
  const stats = {
    guilds: safeCount(data.guilds), users: safeCount(data.users), channels: safeCount(data.channels),
    activePlayers: safeCount(data.activePlayers), botStatus: "online", heartbeatAt: now, updatedAt: now,
  };
  const guilds = Array.isArray(data.guildList) ? data.guildList.slice(0, 2000).filter((g): g is Record<string, unknown> => !!g && typeof g === "object" && !Array.isArray(g) && isDiscordId((g as Record<string, unknown>).id)).map((g) => ({
    id: String(g.id), name: safeText(g.name, 100, "Unknown server"), memberCount: safeCount(g.memberCount),
    icon: typeof g.icon === "string" && g.icon.length <= 300 ? g.icon : null, updatedAt: now,
  })) : [];
  try {
    const db = await getDb();
    await db.collection("dashboard_stats").updateOne({ _id: "global" }, { $set: stats, $setOnInsert: { commands: 0, plays: 0, invites: 0, automodEvents: 0, antinukeEvents: 0 } }, { upsert: true });
    if (guilds.length) await db.collection("guilds").bulkWrite(guilds.map((g) => ({ updateOne: { filter: { id: g.id }, update: { $set: g }, upsert: true } })), { ordered: false });
    return NextResponse.json({ ok: true, received: { stats: true, guilds: guilds.length }, updatedAt: now.toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("bot sync failed", error);
    return NextResponse.json({ error: "Database write failed; verify MONGODB_URI and database network access" }, { status: 503 });
  }
}
