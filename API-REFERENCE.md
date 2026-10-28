# Shizuka Web API reference

All endpoints are same-origin with the deployed Next.js website. Bot ingestion endpoints require `Authorization: Bearer <BOT_API_SECRET>`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | Reports app and environment configuration presence | Public |
| GET | `/api/stats` | Aggregate counts and recent sanitized activity | Public, aggregate only |
| POST | `/api/bot/sync` | Updates guild/user/channel/active-player heartbeat and guild cache | Bot secret |
| POST | `/api/bot/events` | Stores one invite/AutoMod/AntiNuke/music/command/guild event and increments its total | Bot secret |
| GET | `/api/guilds/{guildId}/stats` | Returns one server's cached data and latest events | Discord session + cached Manage Server/Administrator permission |
| GET | `/api/auth/discord/login` | Starts Discord OAuth2 | Public |
| GET | `/api/auth/discord/callback` | Verifies OAuth state, creates signed session and caches manageable guild IDs | OAuth state |
| GET | `/api/auth/me` | Shows current session identity | Session cookie |
| POST | `/api/auth/logout` | Clears session cookie | Session cookie |

## Example bot heartbeat
```json
{
  "guilds": 12,
  "users": 4200,
  "channels": 380,
  "activePlayers": 2,
  "guildList": [{ "id": "123456789012345678", "name": "Example server", "memberCount": 350, "icon": null }]
}
```

## Example event
```json
{
  "type": "automod",
  "title": "AutoMod action",
  "description": "Discord AutoMod executed an action.",
  "guildId": "123456789012345678",
  "metadata": { "action": "timeout" }
}
```

Do not send message contents, bot tokens, OAuth tokens, passwords, or sensitive moderation evidence. The API validates the shared bot secret and limits event text/metadata. Server-specific data is not returned unless the signed-in Discord user had Manage Server or Administrator permission at the last successful OAuth guild check.
