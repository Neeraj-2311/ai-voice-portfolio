"""Frontend RPC helper. The agent drives the visitor's browser (scroll,
highlight, open form, booking-confirmed card, etc.) by calling RPC methods the
page registered in useVoiceSession.ts.

The room is resolved from the live job context, so tools and tasks can fire RPC
without threading the room through. Outside a session (console / tests) there is
no job context, so every call degrades to a `{"ok": false}` result instead of
raising. That makes every RPC best-effort: a missing method or a disconnected
visitor never breaks the conversation.
"""

from __future__ import annotations

import asyncio
import json
import logging

from livekit import rtc
from livekit.agents import get_job_context

logger = logging.getLogger("neeraj-agent.rpc")

# Keep strong refs to in-flight fire-and-forget tasks so they aren't GC'd.
_BG_TASKS: set[asyncio.Task] = set()


def pick_visitor_identity(room: rtc.Room) -> str | None:
    """First remote participant. The visitor's browser is the only remote peer."""
    for participant in room.remote_participants.values():
        return participant.identity
    return None


def room_name() -> str:
    try:
        return get_job_context().room.name
    except Exception:
        return "unknown"


def fire_rpc(method: str, payload: dict | None = None) -> None:
    """Fire an RPC without blocking the caller. Used for narration (scroll /
    highlight) so the agent can keep generating speech immediately instead of
    waiting on the browser round-trip."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return
    task = asyncio.create_task(_fire_and_log(method, payload))
    _BG_TASKS.add(task)
    task.add_done_callback(_BG_TASKS.discard)


async def _fire_and_log(method: str, payload: dict | None) -> None:
    try:
        await perform_rpc(method, payload)
    except Exception:
        logger.warning("rpc.fire_failed method=%s", method)


async def perform_rpc(method: str, payload: dict | None = None) -> dict:
    try:
        ctx = get_job_context()
        room = ctx.room
    except Exception:
        logger.debug("rpc.skipped reason=no_job_context method=%s", method)
        return {"ok": False, "error": "no_job_context"}

    if room is None:
        return {"ok": False, "error": "no_room"}
    visitor = pick_visitor_identity(room)
    if visitor is None:
        logger.warning("rpc.skipped reason=no_visitor method=%s", method)
        return {"ok": False, "error": "no_visitor"}
    try:
        raw = await room.local_participant.perform_rpc(
            destination_identity=visitor,
            method=method,
            payload=json.dumps(payload or {}),
        )
        return json.loads(raw) if raw else {"ok": True}
    except Exception as e:
        logger.warning("rpc.failed method=%s error=%s", method, e)
        return {"ok": False, "error": str(e)}
