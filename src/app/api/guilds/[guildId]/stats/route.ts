import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { readSession } from "@/lib/discord-session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, context: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await context.params;
  if (!/^[0-9]{15,25}$/.test(guildId)) return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 });
  const session = readSession(_request.cookies.get("shizuka_session")?.value);
  if (!session) return NextResponse.json({ error: "Sign in with Discord first" }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json({ connected: false }, { status: 503 });
  try {
    const db = await getDb();
    const access = await db.collection("dashboard_users").findOne({ userId: session.id, manageableGuildIds: guildId, updatedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } }, { projection: { _id: 1 } });
    if (!access) return NextResponse.json({ error: "You do not have Manage Server or Administrator permission for this server" }, { status: 403 });
    const guild = await db.collection("guilds").findOne({ id: guildId }, { projection: { _id: 0 } });
    const events = await db.collection("bot_events").find({ guildId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(20).toArray();
    return NextResponse.json({ connected: Boolean(guild), guild, recentEvents: events }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Database unavailable" }, { status: 503 }); }
}
