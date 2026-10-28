import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!process.env.MONGODB_URI) return NextResponse.json({ connected: false, source: "not-configured", message: "Set MONGODB_URI and sync the Shizuka bot to enable live stats.", stats: null, recentEvents: [] }, { headers: { "Cache-Control": "no-store" } });
  try {
    const db = await getDb();
    const stats = await db.collection("dashboard_stats").findOne({ _id: "global" });
    const recentEvents = await db.collection("bot_events").find({}, { projection: { _id: 0, type: 1, title: 1, description: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(8).toArray();
    const heartbeat = stats?.heartbeatAt ?? stats?.updatedAt;
    const age = heartbeat ? Date.now() - new Date(heartbeat).getTime() : Infinity;
    return NextResponse.json({ connected: Boolean(stats), source: "mongodb", stale: age > 120_000, stats: stats ? {
      guilds: stats.guilds ?? 0, users: stats.users ?? 0, channels: stats.channels ?? 0, commands: stats.commands ?? 0,
      plays: stats.plays ?? 0, invites: stats.invites ?? 0, automodEvents: stats.automodEvents ?? 0,
      antinukeEvents: stats.antinukeEvents ?? 0, activePlayers: stats.activePlayers ?? 0,
      botStatus: age > 120_000 ? "stale" : "online", updatedAt: heartbeat,
    } : null, recentEvents }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("stats read failed", error);
    return NextResponse.json({ connected: false, error: "Database unavailable", stats: null, recentEvents: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
