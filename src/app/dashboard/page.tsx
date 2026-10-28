import Link from "next/link";
import { getDb } from "@/lib/mongodb";
export const dynamic = "force-dynamic";

async function getDashboardData() {
  if (!process.env.MONGODB_URI) return { connected: false, stats: null, recentEvents: [] as Array<Record<string, unknown>>, error: "MONGODB_URI is not configured" };
  try {
    const db = await getDb();
    const stats = await db.collection("dashboard_stats").findOne({ _id: "global" });
    const recentEvents = await db.collection("bot_events").find({}, { projection: { _id: 0, type: 1, title: 1, description: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(8).toArray();
    const heartbeat = stats?.heartbeatAt ?? stats?.updatedAt;
    const age = heartbeat ? Date.now() - new Date(heartbeat).getTime() : Infinity;
    return { connected: Boolean(stats) && age <= 120_000, stats: stats ? {
      guilds: stats.guilds ?? 0, users: stats.users ?? 0, invites: stats.invites ?? 0, plays: stats.plays ?? 0,
      automodEvents: stats.automodEvents ?? 0, antinukeEvents: stats.antinukeEvents ?? 0, commands: stats.commands ?? 0,
      activePlayers: stats.activePlayers ?? 0, updatedAt: heartbeat,
    } : null, recentEvents: recentEvents as Array<Record<string, unknown>>, error: "" };
  } catch {
    return { connected: false, stats: null, recentEvents: [] as Array<Record<string, unknown>>, error: "Database unavailable. Check MongoDB Atlas access and environment variables." };
  }
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  const data = await getDashboardData();
  const stats = data.stats;
  const cards = [
    { label: "Servers", value: stats?.guilds }, { label: "Users", value: stats?.users },
    { label: "Invites tracked", value: stats?.invites }, { label: "Music plays", value: stats?.plays },
    { label: "AutoMod events", value: stats?.automodEvents }, { label: "AntiNuke events", value: stats?.antinukeEvents },
    { label: "Commands used", value: stats?.commands }, { label: "Active music players", value: stats?.activePlayers },
  ];
  return <main className="legal-page"><div className="legal-container">
    <p className="eyebrow">SHIZUKA CONTROL CENTER</p><h1>Dashboard</h1>
    <p>Live statistics from the Shizuka bot API. Sign in with Discord to access server-specific data.</p>
    {params.notice === "discord-login-not-configured" ? <p role="status">Discord sign-in is not enabled yet. The public website works without API keys; live dashboard features need optional integration settings.</p> : null}
    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, margin: "28px 0" }}>
      {cards.map(c => <article key={c.label} className="feature-card"><span>{c.label}</span><h2>{typeof c.value === "number" ? c.value.toLocaleString() : "—"}</h2></article>)}
    </div>
    <p role="status">{data.connected ? "Bot heartbeat received recently." : data.error || "Waiting for the first bot sync. Add the bridge to the separately hosted bot."}</p>
    {stats?.updatedAt ? <p><small>Last sync: {new Date(String(stats.updatedAt)).toLocaleString("en-IN", { timeZone: "UTC" })} UTC</small></p> : null}
    <h2 style={{ marginTop: 32 }}>Recent activity</h2>
    {data.recentEvents.length ? <div className="feature-grid">{data.recentEvents.map((event, i) => <article className="feature-card" key={`${String(event.type)}-${String(event.createdAt)}-${i}`}><small>{String(event.type || "event").toUpperCase()}</small><h3>{String(event.title || "Bot event")}</h3><p>{String(event.description || "")}</p><small>{event.createdAt ? new Date(String(event.createdAt)).toLocaleString() : ""}</small></article>)}</div> : <p>No bot events received yet.</p>}
    <p style={{ marginTop: 24 }}><a href="/api/auth/discord/login">Sign in with Discord</a> · <a href="/api/auth/me">Check login status</a> · <a href="/api/stats">View stats API</a> · <Link href="/">Back to home</Link></p>
  </div></main>;
}
