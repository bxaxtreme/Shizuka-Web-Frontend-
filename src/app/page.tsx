import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, ShieldCheck, Music2, Activity, Users, MessageSquare, UserPlus, Radio, ShieldAlert, Bot, CheckCircle2, Star, Zap, ScanLine } from "lucide-react";
import MusicPlayerPreview from "@/components/MusicPlayerPreview";
import features from "@/data/features.json";
import commands from "@/data/commands.json";
import { siteConfig } from "@/data/site-config";
import { getDb } from "@/lib/mongodb";

const featureIcons = [Music2, ShieldCheck, ShieldAlert, Activity, UserPlus, MessageSquare, Radio, Star, Bot, Sparkles, Zap, ArrowRight];
const liveModules = [
  { title: "Live Server Stats", detail: "Members, channels & activity", icon: Activity, tag: "ANALYTICS", color: "pink" },
  { title: "Invite Tracker", detail: "Track invites and join activity", icon: UserPlus, tag: "COMMUNITY", color: "blue" },
  { title: "AutoMod", detail: "Automated moderation tools", icon: ScanLine, tag: "PROTECTION", color: "green" },
  { title: "AntiNuke Security", detail: "Security event monitoring", icon: ShieldAlert, tag: "SECURITY", color: "orange" },
  { title: "Music System", detail: "Playback controls & queue", icon: Music2, tag: "MUSIC", color: "violet" },
  { title: "Welcome Messages", detail: "Make every new member feel welcome", icon: MessageSquare, tag: "ENGAGEMENT", color: "pink" },
];

export const dynamic = "force-dynamic";

async function getLiveStats() {
  if (!process.env.MONGODB_URI) return null;
  try {
    const db = await getDb();
    const stats = await db.collection("dashboard_stats").findOne({ _id: "global" });
    const heartbeat = stats?.heartbeatAt ?? stats?.updatedAt;
    if (!heartbeat || Date.now() - new Date(heartbeat).getTime() > 120_000) return null;
    return { guilds: Number(stats.guilds || 0), users: Number(stats.users || 0) };
  } catch { return null; }
}

export default async function Home() {
  const liveStats = await getLiveStats();
  return <>
    <section className="hero shell">
      <div className="hero-copy">
        <div className="announcement"><span className="announcement-dot"/> YOUR COMMUNITY, UPGRADED <span className="announce-arrow">↗</span></div>
        <h1>One Bot.<br/><span>Infinite</span> Possibilities.</h1>
        <p className="hero-lede">Meet Shizuka — your all-in-one Discord companion for music, moderation, anti-nuke security, and community management.</p>
        <div className="hero-actions"><a className="button button-pink" href={siteConfig.inviteUrl || "#features"}>Add to Discord <ArrowUpRight size={17}/></a><Link className="button button-outline" href="/commands">Explore commands <ArrowRight size={16}/></Link></div>
        <div className="hero-proof"><div className="proof-avatars"><span>S</span><span>♡</span><span>✦</span></div><div><strong>One home for your server tools</strong><small>Music, safety, insights and more.</small></div><span className="proof-separator"/><span className="rating"><Star size={14} fill="currentColor"/> Built for communities</span></div>
      </div>
      <div className="hero-visual"><div className="hero-halo"/><div className="hero-spark spark-one">✦</div><div className="hero-spark spark-two">✧</div><div className="bot-portrait"><img src={siteConfig.logo} alt="Shizuka character artwork"/><span className="portrait-label"><span className="live-dot"/> SHIZUKA</span></div>
        <div className="floating-card float-status"><span className="float-icon"><CheckCircle2 size={17}/></span><div><small>SYSTEM OVERVIEW</small><strong>All tools, one bot</strong></div><span className="status-neutral pulse-dot"/></div>
        <div className="floating-card float-music"><span className="music-mini"><Music2 size={18}/></span><div><small>MUSIC EXPERIENCE</small><strong>Queue up your vibe</strong><span>Interactive preview</span></div><span className="equalizer"><i/><i/><i/><i/></span></div><div className="visual-caption">A little magic for every server <Sparkles size={15}/></div>
      </div>
    </section>

    <section className="stats-strip shell" aria-label="Community overview"><div className="stats-heading"><span className="eyebrow">THE COMMUNITY</span><h2>Small bot. Big energy.</h2><p>{liveStats ? "Live bot metrics · refreshed automatically" : "Live metrics appear after the bot connects to the website API."}</p></div>
      {[{n:"Servers",v:liveStats ? liveStats.guilds.toLocaleString() : "—",i:<Users size={15}/>,cls:"count-up"},{n:"Community users",v:liveStats ? liveStats.users.toLocaleString() : "—",i:<UserPlus size={15}/>,cls:"count-up delay-1"},{n:"Available commands",v:commands.length.toLocaleString(),i:<Bot size={15}/>,cls:"count-up delay-2"},{n:"Bot connection",v:liveStats ? "Online" : "Waiting",i:<Activity size={15}/>,cls:"count-up delay-3"}].map(s=><div className="stat-box" key={s.n}><span>{s.i}</span><small>{s.n}</small><strong className={s.cls}>{s.v}</strong></div>)}
    </section>

    <section className="section shell" id="features"><div className="section-heading"><div><span className="eyebrow">MADE TO DO MORE</span><h2>Your server, <span>your style.</span></h2><p>Helpful tools for everyday moments and the big ones.</p></div><Link className="text-link" href="/features">Explore all features <ArrowRight size={16}/></Link></div>
      <div className="feature-grid home-feature-grid">{(features as {title:string;description:string;icon:string}[]).slice(0,6).map((f,i)=>{const Icon=featureIcons[i]||Sparkles;return <article className="feature-card" key={f.title}><div className="feature-icon"><Icon size={21}/></div><h3>{f.title}</h3><p>{f.description}</p><Link href="/features" aria-label={`Learn more about ${f.title}`}>Learn more <ArrowUpRight size={14}/></Link></article>})}</div>
    </section>

    <section className="live-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">A LIVE-LOOKING CONTROL ROOM</span><h2>See your server <span>in motion.</span></h2><p>Animated product previews for the systems Shizuka brings together.</p></div><div className="preview-status"><span className="live-dot"/> UI PREVIEW</div></div>
      <div className="live-grid">{liveModules.map((m,i)=>{const Icon=m.icon;return <article className={`live-card accent-${m.color}`} key={m.title} style={{animationDelay:`${i*90}ms`}}><div className="live-card-top"><span className="live-card-icon"><Icon size={19}/></span><span className="module-tag">{m.tag}</span></div><h3>{m.title}</h3><p>{m.detail}</p><div className="activity-visual" aria-hidden="true"><span className="activity-line line-a"/><span className="activity-line line-b"/><span className="activity-line line-c"/><span className="activity-line line-d"/><span className="activity-sweep"/></div><div className="live-card-foot"><span><i className="mini-dot"/> Module preview</span><span className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></span></div></article>})}</div>
      <p className="preview-disclaimer"><Radio size={14}/> These animated cards demonstrate the website UI. Live server counts, invite events, AutoMod and AntiNuke events require a connected Shizuka bot/API and are not simulated as real events.</p>
    </div></section>

    <section className="music-section"><div className="shell music-layout"><div><span className="eyebrow">SET THE MOOD</span><h2>Good music.<br/><span>Better hangouts.</span></h2><p>Keep the vibe going with Shizuka’s music tools. Try the interactive player preview while the live bot connection is configured.</p><Link href="/commands" className="button button-outline">Browse music commands <ArrowRight size={16}/></Link></div><MusicPlayerPreview/></div></section>
    <section className="bottom-cta shell"><div className="cta-icon"><Sparkles size={25}/></div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Make your community<br/>feel a little more <span>Shizuka.</span></h2><p>Explore the commands and find the tools your server needs.</p><div className="hero-actions centered"><Link href="/commands" className="button button-pink">Explore commands <ArrowRight size={16}/></Link><Link href="/premium" className="button button-outline">Discover Premium</Link></div></section>
  </>;
}
