"""Outbound notifications, sent directly from the agent worker (low latency, no
Next.js hop on the free-tier deploy).

- Every conversation: log_session appends a full row to the Google Sheet (lead
  fields + summary + transcript), so Neeraj can follow up on anyone. The Sheet is
  the durable record and the fallback when no email goes out.
- Actionable leads and callback requests: Resend email to Neeraj.
- Voice-driven contact messages: Resend email only (on failure the agent leaves
  the prefilled on-page form open for the visitor to send themselves).

`transport` is injectable for unit tests. configured() gates email entirely; an
unconfigured notifier no-ops so console / tests never send real mail.
"""

from __future__ import annotations

import logging
import os
from collections.abc import Awaitable
from html import escape
from typing import Callable

from lead import Lead
from net import request_json
from sheets import SheetsClient

logger = logging.getLogger("neeraj-agent.notify")

Transport = Callable[..., Awaitable[tuple[int, dict]]]
RESEND_URL = "https://api.resend.com/emails"
_ACCENT = "#6366F1"

# Google Sheet column header for the session log. Order MUST match the row built
# in log_session: [when, *Lead.as_row(), summary, room, transcript]. Set once on
# the sheet with scripts/init_sheet_header.py.
SESSION_LOG_HEADER = [
    "Logged At",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Intent",
    "Qualification",
    "Outcome",
    "Wants/Reason",
    "Summary",
    "Room",
    "Transcript",
]


def _row(label: str, value: str) -> str:
    return (
        f'<tr><td style="padding:6px 12px 6px 0;color:#71717a;font-size:13px;'
        f'vertical-align:top">{escape(label)}</td>'
        f'<td style="padding:6px 0;color:#18181b;font-size:14px;font-weight:500">'
        f"{escape(value)}</td></tr>"
    )


def _card(
    title: str, eyebrow: str, rows: list[tuple[str, str]], body: str | None = None
) -> str:
    rows_html = "".join(_row(k, v) for k, v in rows if v)
    body_html = (
        f'<div style="margin-top:16px;padding:14px 16px;background:#faf9fc;border-radius:10px;'
        f'border-left:3px solid {_ACCENT};color:#18181b;font-size:14px;line-height:1.6">'
        f"{escape(body)}</div>"
        if body
        else ""
    )
    return (
        f'<div style="max-width:560px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,'
        f'Helvetica,Arial,sans-serif">'
        f'<div style="padding:20px 24px;background:{_ACCENT};border-radius:14px 14px 0 0">'
        f'<p style="margin:0;color:rgba(255,255,255,.85);font-size:11px;font-weight:600;'
        f'letter-spacing:.6px;text-transform:uppercase">{escape(eyebrow)}</p>'
        f'<h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:600">{escape(title)}</h1>'
        f"</div>"
        f'<div style="padding:20px 24px;background:#fff;border:1px solid #ececf1;border-top:0;'
        f'border-radius:0 0 14px 14px">'
        f'<table style="width:100%;border-collapse:collapse">{rows_html}</table>'
        f"{body_html}</div></div>"
    )


class Notifier:
    def __init__(
        self,
        *,
        api_key: str | None,
        from_addr: str | None,
        to_addr: str | None,
        sheets: SheetsClient | None = None,
        transport: Transport | None = None,
    ) -> None:
        self._api_key = api_key
        self._from = from_addr
        self._to = to_addr
        self._sheets = sheets
        self._transport = transport or request_json

    @classmethod
    def from_env(cls, *, transport: Transport | None = None) -> Notifier:
        return cls(
            api_key=os.getenv("RESEND_API_KEY"),
            from_addr=os.getenv("RESEND_FROM"),
            to_addr=os.getenv("RESEND_TO") or os.getenv("NEXT_PUBLIC_SITE_EMAIL"),
            sheets=SheetsClient.from_env(transport=transport),
            transport=transport,
        )

    def configured(self) -> bool:
        return bool(self._api_key and self._from and self._to)

    async def _send_email(
        self, *, subject: str, html: str, text: str, reply_to: str | None = None
    ) -> bool:
        if not self.configured():
            logger.info("notify.email_skipped reason=unconfigured subject=%r", subject)
            return False
        body: dict = {
            "from": self._from,
            "to": [self._to],
            "subject": subject,
            "html": html,
            "text": text,
        }
        if reply_to:
            body["reply_to"] = reply_to
        try:
            status, data = await self._transport(
                "POST",
                RESEND_URL,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                json_body=body,
            )
            if status >= 400:
                logger.error("notify.email_failed status=%s body=%s", status, data)
                return False
            return True
        except Exception:
            logger.exception("notify.email_error subject=%r", subject)
            return False

    async def log_session(
        self, lead: Lead, *, summary: str, transcript: str, room: str, when: str
    ) -> bool:
        """Durable record of EVERY conversation in the Google Sheet: the captured
        lead fields, a short summary, and the full transcript, so Neeraj can
        follow up even when nothing was emailed. Best-effort.

        Sheet columns (header set once on the sheet):
        Logged At | Name | Email | Phone | Company | Intent | Qualification |
        Outcome | Wants/Reason | Summary | Room | Transcript
        """
        if not self._sheets:
            logger.info("session.log_skipped reason=no_sheet room=%s", room)
            return False
        row = [when, *lead.as_row(), summary or "", room, (transcript or "")[:45000]]
        ok = await self._sheets.append_row(row)
        logger.info("session.logged ok=%s room=%s outcome=%s", ok, room, lead.outcome)
        return ok

    async def send_lead(self, lead: Lead, *, summary: str, room: str) -> str:
        """Email Neeraj about an actionable lead. Returns 'email' or 'none'.
        The durable record lives in the Sheet via log_session."""
        rows = [
            ("Name", lead.name or ""),
            ("Email", lead.email or ""),
            ("Phone", lead.phone or ""),
            ("Company", lead.company or ""),
            ("Intent", lead.intent or ""),
            ("Qualification", lead.qualification or ""),
            ("Outcome", lead.outcome or ""),
            ("Wants", lead.wants or ""),
        ]
        subject = f"[lead] {lead.name or 'Visitor'} ({lead.qualification or 'new'}) via voice tour"
        html = _card(
            "New lead from the voice tour", lead.intent or "lead", rows, summary or None
        )
        text = "\n".join(f"{k}: {v}" for k, v in rows if v) + (
            f"\n\n{summary}" if summary else ""
        )
        ok = await self._send_email(
            subject=subject, html=html, text=text, reply_to=lead.email or None
        )
        return "email" if ok else "none"

    async def send_callback(
        self, *, name: str, phone: str, reason: str, room: str
    ) -> str:
        rows = [("Name", name), ("Phone", phone), ("Reason", reason)]
        subject = f"[callback] {name} wants a call back now"
        html = _card("Callback requested", "hot lead", rows)
        text = "\n".join(f"{k}: {v}" for k, v in rows)
        ok = await self._send_email(subject=subject, html=html, text=text)
        return "email" if ok else "none"

    async def send_contact(
        self, *, name: str, email: str, intent: str, message: str
    ) -> bool:
        rows = [("Name", name), ("Email", email), ("Intent", intent)]
        subject = f"[{intent}] {name} via voice tour"
        html = _card(f"{name} sent a message", intent, rows, message)
        text = "\n".join(f"{k}: {v}" for k, v in rows) + f"\n\n{message}"
        return await self._send_email(
            subject=subject, html=html, text=text, reply_to=email
        )
