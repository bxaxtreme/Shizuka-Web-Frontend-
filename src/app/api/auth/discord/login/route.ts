import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/discord/callback`;
  if (!clientId || !process.env.DISCORD_CLIENT_SECRET || !process.env.SESSION_SECRET) return NextResponse.redirect(new URL("/dashboard?notice=discord-login-not-configured", request.nextUrl.origin));
  const state = randomBytes(24).toString("hex");
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId); url.searchParams.set("redirect_uri", redirectUri); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "identify guilds"); url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("shizuka_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
