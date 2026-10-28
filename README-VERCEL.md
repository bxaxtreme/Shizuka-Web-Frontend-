# Shizuka website + Vercel API

This project is a Next.js website with Vercel-compatible serverless API routes. Vercel can host the website, OAuth callbacks, and request/response APIs. It does **not** keep a Discord bot process, voice connection, or Lavalink server running 24/7. Host the bot separately and have it send authenticated updates to this site's API.

## 1. Zero-configuration deployment (website + API shell)
1. Push this folder to GitHub and import the repository into Vercel.
2. Select the Next.js framework, root directory `.`, and build command `npm run build`.
3. Deploy without adding any environment variables. The public pages and basic API routes are designed to load in this mode; live metrics remain blank rather than showing invented numbers.
4. `/api/health` reports which optional integrations are configured. `/api/stats` returns a safe “not configured” response when MongoDB is absent. Discord sign-in redirects back to the dashboard if OAuth is not configured.

**Important limitation:** no website can show real Discord server counts, track live bot events, or authenticate Discord users without connecting the relevant services and credentials. This deployment mode hosts the frontend and API routes, but live data and authenticated dashboard features stay disabled until optional integrations are configured. Vercel cannot run the always-on Discord bot or Lavalink process.

## 2. Optional environment variables (only for live integrations)
- `MONGODB_URI`: MongoDB Atlas connection URI. Create a database user with a strong password and allow Vercel's outbound access per your Atlas network policy. Avoid `0.0.0.0/0` if you can use a safer network arrangement.
- `MONGODB_DB`: database name, e.g. `shizuka`.
- `BOT_API_SECRET`: long random secret shared only by your bot and this API.
- `SESSION_SECRET`: random secret of at least 32 characters for signing login sessions.
- `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`: Discord Developer Portal OAuth2 credentials.
- `DISCORD_REDIRECT_URI`: `https://YOUR-VERCEL-DOMAIN/api/auth/discord/callback`; add the exact same URL to your Discord application's OAuth2 Redirects.
- `NEXT_PUBLIC_SITE_URL`: your deployed website origin, e.g. `https://your-site.vercel.app`.

Never expose `MONGODB_URI`, `BOT_API_SECRET`, `SESSION_SECRET`, or `DISCORD_CLIENT_SECRET` in client-side code or any `NEXT_PUBLIC_` variable.

## 3. API routes
- `GET /api/health` — service/environment status.
- `GET /api/stats` — sanitized aggregate stats and recent events from MongoDB.
- `POST /api/bot/sync` — authenticated bot heartbeat and aggregate stats; optional `guildList` entries (`id`, `name`, `memberCount`, `icon`).
- `POST /api/bot/events` — authenticated events with `type` (`invite`, `automod`, `antinuke`, `music`, `command`, `guild`), `title`, optional `description`, `guildId`, `metadata`.
- `GET /api/guilds/{guildId}/stats` — cached guild summary and recent events. Requires a signed-in Discord session and a recently cached Manage Server/Administrator permission for that guild.
- `GET /api/auth/discord/login` — starts Discord OAuth2 identify/guilds consent.
- `GET /api/auth/discord/callback` — validates OAuth state and sets an HttpOnly signed session cookie.
- `GET /api/auth/me` — returns the signed-in user summary.
- `POST /api/auth/logout` — clears the session cookie.

## 4. Connect your bot
The API does not magically read your Discord bot's memory. A ready-to-adapt bridge helper is included at `bot_integration/shizuka_web_bridge.py` for a separately hosted `discord.py` bot. Follow the complete setup and verification steps in `bot_integration/README.md`. Keep Discord bot tokens only on the bot host.

Start one bridge instance when your existing bot starts:

```python
from bot_integration.shizuka_web_bridge import ShizukaWebBridge
web_bridge = ShizukaWebBridge(bot)
# inside your async startup hook:
await web_bridge.start()
```

The helper sends a stats heartbeat every 90 seconds. In your **existing successful handlers**, call `web_bridge.invite_tracked(...)`, `web_bridge.automod_triggered(...)`, `web_bridge.antinuke_triggered(...)`, `web_bridge.music_played(...)`, or `web_bridge.command_used(...)`. See `bot_integration/README.md` for examples. These hooks must be wired into your real cogs; they cannot infer invite attribution, music track starts, or custom AntiNuke detections by themselves. The website archive does not include the actual Shizuka bot source, so those existing handlers cannot be automatically edited here.


## 5. Discord OAuth notes
OAuth login only establishes a signed identity session. It does not yet authorize guild management. Before adding actions like changing AutoMod, AntiNuke, music, or server settings, validate the user's guild permissions with Discord and enforce them server-side for every action. Never trust a guild ID or role sent by the browser.

## 6. Deployment caveats
- MongoDB data is required for live stats; without bot sync the API intentionally reports no live data.
- Vercel serverless functions have request/runtime limits; do not run an always-on Discord gateway, voice player, scheduler, or Lavalink process inside them.
- The stats endpoint uses the latest ingested heartbeat. Event ingestion increments aggregate counters separately, so event traffic cannot falsely keep a disconnected bot marked online. For high-volume production use, add rate limits and a TTL retention index for event history.


## 7. Recommended deployment checklist
- Deploy as a normal Next.js project; do not set `GITHUB_PAGES=true` on Vercel.
- Optional: configure secrets under Vercel Project Settings → Environment Variables only when enabling live integrations.
- In MongoDB Atlas, create the `shizuka` database/user and permit connections from your deployment environment according to Atlas networking guidance.
- Set the exact Discord OAuth redirect URL in both Vercel and Discord Developer Portal.
- First test `/api/health`, then `/api/stats`, then bot sync. `/api/health` only reports configuration presence; it does not prove the database can connect.
- API handlers use Node.js runtime. Vercel hosts the web/API functions, not the persistent Discord gateway, voice connection, or Lavalink server.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before production. Dependency installation timed out in the current editing environment, so a complete local production build could not be verified here.
