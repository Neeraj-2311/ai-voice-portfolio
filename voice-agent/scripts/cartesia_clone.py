"""Clone a voice on Cartesia from a local audio clip and print the voice id.

Usage (needs CARTESIA_API_KEY in the env or .env.local):

    uv run python scripts/cartesia_clone.py path/to/neeraj_10s.wav --name "Neeraj"

Then paste the printed id into .env.local as CARTESIA_VOICE_ID and run the agent.

Tips for a good clone: ~10-20s, mono, clean (no music/noise), one speaker,
natural conversational delivery — quality in, quality out.
"""

from __future__ import annotations

import argparse
import os
import sys

import httpx
from dotenv import load_dotenv

CLONE_URL = "https://api.cartesia.ai/voices/clone"
API_VERSION = "2025-04-16"


def main() -> None:
    load_dotenv(".env.local")
    parser = argparse.ArgumentParser()
    parser.add_argument("clip", help="path to a ~10s wav/mp3 of the voice")
    parser.add_argument("--name", default="Neeraj")
    parser.add_argument("--language", default="en")
    # "similarity" hugs the source voice; "stability" is smoother/more robust.
    parser.add_argument(
        "--mode", default="similarity", choices=["similarity", "stability"]
    )
    args = parser.parse_args()

    api_key = os.getenv("CARTESIA_API_KEY")
    if not api_key:
        sys.exit("CARTESIA_API_KEY not set (put it in .env.local or export it)")
    if not os.path.isfile(args.clip):
        sys.exit(f"no such file: {args.clip}")

    with open(args.clip, "rb") as f:
        resp = httpx.post(
            CLONE_URL,
            headers={"X-API-Key": api_key, "Cartesia-Version": API_VERSION},
            data={
                "name": args.name,
                "description": f"{args.name} portfolio voice clone",
                "language": args.language,
                "mode": args.mode,
                "enhance": "true",
            },
            files={"clip": (os.path.basename(args.clip), f, "audio/wav")},
            timeout=120.0,
        )

    if resp.status_code >= 300:
        sys.exit(f"clone failed ({resp.status_code}): {resp.text}")

    voice = resp.json()
    vid = voice.get("id")
    print(f"\n✓ cloned '{voice.get('name')}'\n  CARTESIA_VOICE_ID={vid}\n")
    print("Paste that into voice-agent/.env.local, then run the agent.")


if __name__ == "__main__":
    main()
