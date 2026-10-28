import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/discord-session";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  // Public website mode works without OAuth secrets: simply report a signed-out session.
  const token = request.cookies.get("shizuka_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false, user: null }, { headers: { "Cache-Control": "no-store" } });
  try {
    const user = readSession(token);
    return NextResponse.json({ authenticated: Boolean(user), user: user ? { id: user.id, username: user.username, avatar: user.avatar } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
