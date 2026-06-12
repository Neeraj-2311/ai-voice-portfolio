"""Google Sheets append, the durable record of every conversation (and the
fallback when no email goes out). Disabled (and silently skipped) until a
service account is configured via env.

Auth uses a service-account JWT (google-auth, imported lazily so the dependency
is only needed when actually configured). `transport` and `token_fn` are
injectable for unit tests.
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import Awaitable
from typing import Callable

from net import request_json

logger = logging.getLogger("neeraj-agent.sheets")

Transport = Callable[..., Awaitable[tuple[int, dict]]]
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


class SheetsClient:
    def __init__(
        self,
        *,
        service_account_email: str,
        private_key: str,
        sheet_id: str,
        sheet_range: str = "Lead!A1",
        transport: Transport | None = None,
        token_fn: Callable[[], Awaitable[str]] | None = None,
    ) -> None:
        self._email = service_account_email
        # Env stores the PEM with literal \n; restore real newlines.
        self._private_key = private_key.replace("\\n", "\n")
        self._sheet_id = sheet_id
        self._range = sheet_range
        self._transport = transport or request_json
        self._token_fn = token_fn or self._mint_token

    @classmethod
    def from_env(cls, *, transport: Transport | None = None) -> SheetsClient | None:
        email = os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
        key = os.getenv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")
        sheet_id = os.getenv("GOOGLE_SHEETS_LEADS_ID")
        if not (email and key and sheet_id):
            return None
        return cls(
            service_account_email=email,
            private_key=key,
            sheet_id=sheet_id,
            sheet_range=os.getenv("GOOGLE_SHEETS_RANGE", "Lead!A1"),
            transport=transport,
        )

    def configured(self) -> bool:
        return bool(self._email and self._private_key and self._sheet_id)

    async def _mint_token(self) -> str:
        # Lazy import: google-auth is only needed when the fallback is live.
        from google.auth.transport.requests import Request
        from google.oauth2 import service_account

        def _refresh() -> str:
            creds = service_account.Credentials.from_service_account_info(
                {
                    "type": "service_account",
                    "client_email": self._email,
                    "private_key": self._private_key,
                    "token_uri": "https://oauth2.googleapis.com/token",
                },
                scopes=SCOPES,
            )
            creds.refresh(Request())
            return creds.token

        return await asyncio.to_thread(_refresh)

    async def append_row(self, values: list[str]) -> bool:
        if not self.configured():
            return False
        try:
            token = await self._token_fn()
            url = (
                f"https://sheets.googleapis.com/v4/spreadsheets/{self._sheet_id}"
                f"/values/{self._range}:append"
            )
            status, data = await self._transport(
                "POST",
                url,
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "valueInputOption": "USER_ENTERED",
                    "insertDataOption": "INSERT_ROWS",
                },
                json_body={"values": [values]},
            )
            if status >= 400:
                logger.error("sheets.append_failed status=%s body=%s", status, data)
                return False
            return True
        except Exception:
            logger.exception("sheets.append_error")
            return False
