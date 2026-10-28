# Connect the Shizuka Discord bot to the Vercel website

The website API is hosted on Vercel; the Discord gateway/music process must stay on your existing always-on bot host. This bridge sends a heartbeat every 90 seconds and lets existing bot cogs publish real events. It never sends Discord bot tokens, message contents, or moderation evidence.

## A. Configure Vercel

Add these environment variables in Vercel → Project → Settings → Environment Variables, then redeploy:

- `MONGODB_URI`: MongoDB Atlas connection string
- `MONGODB_DB`: `shizuka`
- `BOT_API_SECRET`: a random secret of at least 32 characters
- `SESSION_SECRET`: a different random secret of at least 32 characters
- `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`: OAuth2 credentials from Discord Developer Portal
- `DISCORD_REDIRECT_URI`: `https://YOUR-VERCEL-DOMAIN/api/auth/discord/callback`
- `NEXT_PUBLIC_SITE_URL`: `https://YOUR-VERCEL-DOMAIN`

Add the exact callback URL above under your Discord application's OAuth2 Redirects. Never put secrets in variables prefixed with `NEXT_PUBLIC_`, in frontend files, or in Git.

## B. Configure the existing bot host

Copy `shizuka_web_bridge.py` into your bot repository's `bot_integration/` package. Install `aiohttp` if not already installed (`pip install aiohttp`). Set these environment variables on the bot host:

- `SHIZUKA_WEB_URL=https://YOUR-VERCEL-DOMAIN` (no trailing slash required)
- `BOT_API_SECRET` = exactly the same secret configured in Vercel

Do not set the Discord bot token on Vercel; it belongs only on the bot host.

## C. Start the bridge once

For a `discord.py` bot, after the bot object is created, instantiate one bridge and start it from your existing async startup hook:

```python
from bot_integration.shizuka_web_bridge import ShizukaWebBridge

web_bridge = ShizukaWebBridge(bot)

# Call this once from your existing async setup/startup hook:
await web_bridge.start()
```

Keep the `web_bridge` object available to the cogs that need to report events. If your bot uses a different framework, adapt the same HTTP payloads to its startup lifecycle.

## D. Send real event signals from existing handlers

These calls belong in the relevant successful event handlers in the *actual bot project*:

```python
# In your existing invite tracker, only after identifying the used invite:
await web_bridge.invite_tracked(member.guild.id, used_invite.code)

# In the existing AutoMod event handler after Discord reports an action:
await web_bridge.automod_triggered(guild.id, "timeout")

# In the existing AntiNuke cog when it detects an actual security event:
await web_bridge.antinuke_triggered(guild.id, "channel_delete")

# When the music library confirms a track has started:
await web_bridge.music_played(guild.id, "youtube")

# After a command successfully completes:
await web_bridge.command_used(ctx.guild.id, ctx.command.qualified_name)
```

Use your bot's real variable names and real event callbacks; the snippets above are examples, not drop-in lines for every bot. Do not call an event method merely because a command was attempted. The bridge does not automatically infer your private custom cogs' AntiNuke decisions or music-library callbacks. Without adding the calls to those existing handlers, those event totals will stay unchanged.

## E. Verify the connection

1. Open `https://YOUR-VERCEL-DOMAIN/api/health` — check configuration presence.
2. Open `https://YOUR-VERCEL-DOMAIN/api/stats` — initially it may report not configured or no stats.
3. Start the bot and check its logs for `Shizuka web bridge enabled` and no `HTTP 401/503` warnings.
4. After one sync (up to ~90 seconds), `/api/stats` should show `connected: true` and real `guilds`, `users`, `channels`, and `activePlayers` values.
5. Publish a real event from one of the existing handlers and confirm the event appears in `recentEvents` and its counter increments.

If API returns `401`, the bot and Vercel `BOT_API_SECRET` values do not match. If it returns `503`, check MongoDB URI, database user/password, and Atlas network access. `/api/health` only reports whether configuration variables exist; it does not prove MongoDB can connect.

## Hosting boundary

Vercel runs the Next.js website, OAuth routes, and request/response API functions. It does not keep a persistent Discord gateway connection, voice player, or Lavalink process running. Keep the bot and Lavalink on separate suitable hosting.
