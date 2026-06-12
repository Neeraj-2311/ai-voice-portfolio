"""One-off setup: write the session-log header row to the Google Sheet.

Idempotent and non-destructive:
  - if row 1 already equals the header, it does nothing;
  - if row 1 is empty, it writes the header;
  - if row 1 holds other data, it inserts a fresh top row first (existing rows
    shift down, nothing is overwritten) and writes the header there.

Run from the voice-agent dir:  uv run python scripts/init_sheet_header.py
Reads creds from .env.local (GOOGLE_SERVICE_ACCOUNT_*, GOOGLE_SHEETS_LEADS_ID).
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from dotenv import load_dotenv

SRC = Path(__file__).resolve().parent.parent / "src"
sys.path.insert(0, str(SRC))

from notify import SESSION_LOG_HEADER  # noqa: E402
from sheets import SheetsClient  # noqa: E402

BASE = "https://sheets.googleapis.com/v4/spreadsheets"


async def main() -> int:
    load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")
    client = SheetsClient.from_env()
    if client is None:
        print(
            "Google Sheets is not configured (set GOOGLE_SERVICE_ACCOUNT_* and "
            "GOOGLE_SHEETS_LEADS_ID in .env.local). Nothing to do."
        )
        return 0

    token = await client._token_fn()
    transport = client._transport
    sheet_id = client._sheet_id
    tab = client._range.split("!", 1)[0]
    auth = {"Authorization": f"Bearer {token}"}
    end_col = chr(ord("A") + len(SESSION_LOG_HEADER) - 1)  # 12 cols -> "L"
    header_range = f"{tab}!A1:{end_col}1"

    status, data = await transport(
        "GET", f"{BASE}/{sheet_id}/values/{header_range}", headers=auth
    )
    if status >= 400:
        print(f"Failed to read the sheet (status {status}): {data}")
        return 1
    row1 = (data.get("values") or [[]])[0]

    if [c.strip() for c in row1] == SESSION_LOG_HEADER:
        print(f"Header already set on '{tab}'. Nothing to do.")
        return 0

    if any(c.strip() for c in row1):
        # Row 1 has other data: insert a blank top row so nothing is overwritten.
        gid = await _sheet_gid(transport, auth, sheet_id, tab)
        if gid is None:
            print(f"Could not find a tab named '{tab}'. Aborting (no data touched).")
            return 1
        req = {
            "requests": [
                {
                    "insertDimension": {
                        "range": {
                            "sheetId": gid,
                            "dimension": "ROWS",
                            "startIndex": 0,
                            "endIndex": 1,
                        },
                        "inheritFromBefore": False,
                    }
                }
            ]
        }
        status, data = await transport(
            "POST", f"{BASE}/{sheet_id}:batchUpdate", headers=auth, json_body=req
        )
        if status >= 400:
            print(f"Failed to insert header row (status {status}): {data}")
            return 1
        print(f"Inserted a new top row on '{tab}' (existing rows shifted down).")

    status, data = await transport(
        "PUT",
        f"{BASE}/{sheet_id}/values/{header_range}",
        headers=auth,
        params={"valueInputOption": "USER_ENTERED"},
        json_body={"values": [SESSION_LOG_HEADER]},
    )
    if status >= 400:
        print(f"Failed to write the header (status {status}): {data}")
        return 1
    print(f"Header written to '{header_range}': {SESSION_LOG_HEADER}")
    return 0


async def _sheet_gid(transport, auth, sheet_id, tab) -> int | None:
    status, data = await transport(
        "GET",
        f"{BASE}/{sheet_id}",
        headers=auth,
        params={"fields": "sheets.properties(sheetId,title)"},
    )
    if status >= 400:
        return None
    for s in data.get("sheets", []):
        props = s.get("properties", {})
        if props.get("title") == tab:
            return props.get("sheetId")
    return None


async def _run() -> int:
    try:
        return await main()
    finally:
        import net

        if net._fallback_session and not net._fallback_session.closed:
            await net._fallback_session.close()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(_run()))
