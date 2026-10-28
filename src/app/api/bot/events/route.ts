import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isTrustedBotRequest } from "@/lib/bot-auth";
import { isDiscordId, safeText } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const allowed = new Set(["invite", "automod", "antinuke", "music", "command", "guild"]);
const counters: Record<string, string> = { invite: "invites", automod: "automodEvents", antinuke: "antinukeEvents", music: "plays", command: "commands" };

export async function POST(request: NextRequest) {
  if (!isTrustedBotRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "JSON object required" }, { status: 400 });
  const data = body as Record<string, unknown>;
  if (typeof data.type !== "string" || !allowed.has(data.type) || typeof data.title !== "string" || !data.title.trim()) {
    return NextResponse.json({ error: "type must be invite, automod, antinuke, music, command, or guild; title is required" }, { status: 400 });
  }
  const metadata = data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata) ? data.metadata as Record<string, unknown> : {};
  // Only allow low-risk scalar metadata; never store raw message content, tokens or arbitrary nested objects.
  const safeMetadata: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata).slice(0, 12)) {
    if (/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")) {
      safeMetadata[key] = typeof value === "string" ? safeText(value, 100) : value;
    }
  }
  const event = {
    type: data.type, title: safeText(data.title, 120), description: safeText(data.description, 300),
    guildId: isDiscordId(data.guildId) ? data.guildId : null, metadata: safeMetadata, createdAt: new Date(),
  };
  try {
    const db = await getDb();
    await db.collection("bot_events").insertOne(event);
    const counter = counters[event.type];
    if (counter) await db.collection("dashboard_stats").updateOne({ _id: "global" }, { $inc: { [counter]: 1 }, $set: { lastEventAt: new Date() } }, { upsert: true });
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("event ingest failed", error); return NextResponse.json({ error: "Database write failed" }, { status: 503 }); }
}
