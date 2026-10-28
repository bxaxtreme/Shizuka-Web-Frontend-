"""Optional integration helper for a separately hosted discord.py Shizuka bot.

Set SHIZUKA_WEB_URL and BOT_API_SECRET on the bot host. Instantiate once after
creating your bot: bridge = ShizukaWebBridge(bot); await bridge.start().
Call bridge.event(...) from your existing invite, music and AntiNuke handlers.
This module never sends message contents or Discord tokens to the website.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any
from urllib.parse import urlparse

import aiohttp

log = logging.getLogger("shizuka.web_bridge")


class ShizukaWebBridge:
    def __init__(self, bot: Any, interval: int = 90):
        self.bot = bot
        self.interval = max(60, min(int(interval), 300))
        self.base_url = os.environ.get("SHIZUKA_WEB_URL", "").rstrip("/")
        self.secret = os.environ.get("BOT_API_SECRET", "")
        self._session: aiohttp.ClientSession | None = None
        self._task: asyncio.Task | None = None
        self._closed = False

    @property
    def configured(self) -> bool:
        parsed = urlparse(self.base_url)
        return parsed.scheme == "https" and bool(parsed.netloc) and len(self.secret) >= 32

    async def start(self) -> None:
        if not self.configured:
            log.warning("Web bridge disabled: configure HTTPS SHIZUKA_WEB_URL and BOT_API_SECRET (32+ chars).")
            return
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=10)
            self._session = aiohttp.ClientSession(timeout=timeout, headers={"Authorization": f"Bearer {self.secret}"})
        if self._task is None or self._task.done():
            self._closed = False
            self._task = asyncio.create_task(self._sync_loop(), name="shizuka-web-sync")
        log.info("Shizuka web bridge enabled: %s", self.base_url)

    async def close(self) -> None:
        self._closed = True
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        if self._session and not self._session.closed:
            await self._session.close()

    async def _post(self, path: str, payload: dict[str, Any]) -> bool:
        if not self.configured or not self._session or self._session.closed:
            return False
        try:
            async with self._session.post(f"{self.base_url}{path}", json=payload) as response:
                if response.status >= 300:
                    log.warning("Website API %s returned HTTP %s", path, response.status)
                    return False
                return True
        except (aiohttp.ClientError, asyncio.TimeoutError):
            log.warning("Website API %s temporarily unavailable", path)
            return False

    async def _sync_loop(self) -> None:
        while not self._closed:
            try:
                await self.sync_once()
            except Exception:
                log.exception("Website stats sync failed")
            await asyncio.sleep(self.interval)

    async def sync_once(self) -> bool:
        guilds = list(getattr(self.bot, "guilds", []))
        payload = {
            "guilds": len(guilds),
            "users": sum(int(getattr(g, "member_count", 0) or 0) for g in guilds),
            "channels": sum(len(getattr(g, "channels", [])) for g in guilds),
            "activePlayers": self._active_players(),
            "guildList": [
                {"id": str(g.id), "name": str(g.name), "memberCount": int(getattr(g, "member_count", 0) or 0),
                 "icon": str(g.icon.url) if getattr(g, "icon", None) else None}
                for g in guilds
            ],
        }
        return await self._post("/api/bot/sync", payload)

    def _active_players(self) -> int:
        # Adapt this if your music library exposes players under another property.
        players = getattr(self.bot, "players", None)
        if isinstance(players, dict):
            return sum(1 for player in players.values() if player is not None)
        return 0

    async def event(self, event_type: str, title: str, description: str = "", guild_id: int | str | None = None,
                    metadata: dict[str, str | int | bool] | None = None) -> bool:
        """Publish one event. Allowed types: invite, automod, antinuke, music, command, guild."""
        return await self._post("/api/bot/events", {
            "type": event_type, "title": title[:120], "description": description[:300],
            "guildId": str(guild_id) if guild_id is not None else None,
            "metadata": metadata or {},
        })

    # Call these methods from the bot's existing handlers; no duplicate event
    # listeners are registered automatically to avoid conflicting with your cogs.
    async def invite_tracked(self, guild_id: int | str, invite_code: str | None = None) -> bool:
        metadata = {"inviteCode": invite_code[:50]} if invite_code else {}
        return await self.event("invite", "Invite tracked", "A join was attributed by the bot's invite tracker.", guild_id, metadata)

    async def automod_triggered(self, guild_id: int | str, action: str) -> bool:
        return await self.event("automod", "AutoMod action", "Discord AutoMod executed an action.", guild_id, {"action": action[:60]})

    async def antinuke_triggered(self, guild_id: int | str, action: str) -> bool:
        return await self.event("antinuke", "AntiNuke alert", "The bot's AntiNuke system reported an event.", guild_id, {"action": action[:60]})

    async def music_played(self, guild_id: int | str, source: str = "unknown") -> bool:
        return await self.event("music", "Track started", "Music playback started.", guild_id, {"source": source[:40]})

    async def command_used(self, guild_id: int | str, command: str) -> bool:
        return await self.event("command", "Command used", "A bot command completed.", guild_id, {"command": command[:60]})
