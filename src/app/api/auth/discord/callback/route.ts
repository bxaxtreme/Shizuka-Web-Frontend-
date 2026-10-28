import { NextRequest, NextResponse } from "next/server";
import { signSession } from "@/lib/discord-session";
import { getDb } from "@/lib/mongodb";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code"); const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("shizuka_oauth_state")?.value;
  const fail = (reason: string) => NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(reason)}`, request.nextUrl.origin));
  if (!code || !state || !savedState || state !== savedState) return fail("invalid_oauth_state");
  const clientId = process.env.DISCORD_CLIENT_ID; const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/discord/callback`;
  if (!clientId || !clientSecret || !process.env.SESSION_SECRET) return fail("oauth_not_configured");
  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri }), cache: "no-store" });
    if (!tokenResponse.ok) return fail("token_exchange_failed");
    const token = await tokenResponse.json() as { access_token: string; token_type: string };
    const userResponse = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `${token.token_type} ${token.access_token}` }, cache: "no-store" });
    if (!userResponse.ok) return fail("discord_profile_failed");
    const user = await userResponse.json() as { id: string; username: string; avatar: string | null };
    // Store only server IDs the user can manage; do not persist the Discord access token.
    const guildResponse = await fetch("https://discord.com/api/users/@me/guilds", { headers: { Authorization: `${token.token_type} ${token.access_token}` }, cache: "no-store" });
    if (!guildResponse.ok) return fail("discord_guild_list_failed");
    const guilds = await guildResponse.json() as Array<{ id: string; permissions?: string; owner?: boolean }>;
    const manageableGuildIds = guilds.filter((g) => {
      try { const permissions = BigInt(g.permissions || "0"); return Boolean(g.owner) || (permissions & BigInt(8)) === BigInt(8) || (permissions & BigInt(32)) === BigInt(32); }
      catch { return false; }
    }).map((g) => g.id).filter((id) => /^[0-9]{15,25}$/.test(id));
    if (process.env.MONGODB_URI) {
      try { const db = await getDb(); await db.collection("dashboard_users").updateOne({ userId: user.id }, { $set: { userId: user.id, manageableGuildIds, username: user.username, updatedAt: new Date() } }, { upsert: true }); }
      catch (error) { console.error("OAuth guild permission cache failed", error); return fail("dashboard_database_unavailable"); }
    }
    const cookie = signSession({ id: user.id, username: user.username, avatar: user.avatar, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    const response = NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    response.cookies.set("shizuka_session", cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
    response.cookies.set("shizuka_oauth_state", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch { return fail("oauth_request_failed"); }
}
