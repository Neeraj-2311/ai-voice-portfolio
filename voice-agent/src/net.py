"""Tiny async JSON-over-HTTP helper shared by the Cal, notify, and sheets
clients. Prefers the LiveKit job-bound pooled aiohttp session; falls back to a
lazily-created session when there is no job context (e.g. console, tests).

Every client takes an injectable `transport` with this signature so unit tests
can stub the network without touching aiohttp.
"""

from __future__ import annotations

import logging

import aiohttp
from livekit.agents.utils import http_context

logger = logging.getLogger("neeraj-agent.http")

_fallback_session: aiohttp.ClientSession | None = None


def _session() -> aiohttp.ClientSession:
    try:
        return http_context.http_session()
    except Exception:
        global _fallback_session
        if _fallback_session is None or _fallback_session.closed:
            _fallback_session = aiohttp.ClientSession()
        return _fallback_session


async def request_json(
    method: str,
    url: str,
    *,
    headers: dict | None = None,
    params: dict | None = None,
    json_body: dict | None = None,
    timeout: float = 10.0,
) -> tuple[int, dict]:
    """Returns (status, json_dict). Never raises on a non-2xx; raises only on a
    transport-level failure (which callers wrap and degrade)."""
    session = _session()
    async with session.request(
        method,
        url,
        headers=headers,
        params=params,
        json=json_body,
        timeout=aiohttp.ClientTimeout(total=timeout),
    ) as resp:
        try:
            data = await resp.json(content_type=None)
        except Exception:
            data = {"_raw": await resp.text()}
        if not isinstance(data, dict):
            data = {"_data": data}
        return resp.status, data
