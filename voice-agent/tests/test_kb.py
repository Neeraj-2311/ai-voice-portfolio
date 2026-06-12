"""KB loads and stays frontend-safe."""

import re

from kb import build_system_prompt, load_kb

ID_RE = re.compile(r"^[a-zA-Z0-9_-]+$")
PATH_RE = re.compile(r"^/[a-zA-Z0-9/_-]*$")


def test_load_kb_parses_required():
    kb = load_kb()
    assert kb.bio
    assert kb.intros
    assert kb.highlights
    assert kb.highlight_by_id["intellifyai"].section_id == "experience"


def test_ids_are_frontend_safe():
    # Every id / section / route the agent might emit must pass the frontend
    # allowlist in useVoiceSession.ts, or the RPC would be silently rejected.
    kb = load_kb()
    for sid in kb.section_ids:
        assert ID_RE.match(sid), sid
    for path in kb.route_paths:
        assert PATH_RE.match(path), path
    for h in kb.highlights:
        assert ID_RE.match(h.highlight_id), h.highlight_id
        assert h.section_id in kb.section_ids, h.section_id


def test_validators():
    kb = load_kb()
    assert kb.validate_highlight_id("intellifyai") is True
    assert kb.validate_highlight_id("does-not-exist") is False
    assert kb.validate_highlight_id(None) is True
    assert kb.validate_section_id("experience") is True
    assert kb.validate_section_id("nope") is False
    assert kb.validate_route("/") is True
    assert kb.validate_route("/evil/../x") is False


def test_prompt_is_lean_and_complete():
    kb = load_kb()
    prompt = build_system_prompt(kb)
    # Persona + narration + key policies present.
    for token in (
        "Neeraj",
        "open_route",
        "offer_booking_times",
        "book_slot",
        "update_lead",
        "wrap",
    ):
        assert token in prompt, token
    # Lean: no multi-paragraph booking script baked into the root prompt.
    assert "slot_id" not in prompt
    assert "cal-api-version" not in prompt


def test_load_kb_missing_file_falls_back(tmp_path):
    kb = load_kb(tmp_path / "nope.json")
    assert kb.bio  # embedded fallback
    assert kb.validate_section_id("hero")
