"""Test setup: make src importable and load local env so behavioral tests can
reach LiveKit Inference. Behavioral (judge-based) tests skip when no LiveKit
credentials are present."""

import os
import sys
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")
except Exception:
    pass


def has_livekit_creds() -> bool:
    return bool(os.getenv("LIVEKIT_API_KEY") and os.getenv("LIVEKIT_API_SECRET"))


requires_inference = pytest.mark.skipif(
    not has_livekit_creds(),
    reason="needs LIVEKIT credentials for inference / judge LLM",
)
