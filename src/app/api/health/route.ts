import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ ok: true, service: "shizuka-web-api", timestamp: new Date().toISOString(), integrations: { database: process.env.MONGODB_URI ? "configured" : "not-configured", botIngestSecret: process.env.BOT_API_SECRET ? "configured" : "not-configured", discordOAuth: process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET && process.env.SESSION_SECRET ? "configured" : "not-configured" } }, { headers: { "Cache-Control": "no-store" } });
}
