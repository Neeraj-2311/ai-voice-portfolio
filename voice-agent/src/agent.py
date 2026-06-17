"""Entrypoint for the Neeraj portfolio voice agent.

Kept thin on purpose (it is the Dockerfile entrypoint): load env + KB, wire the
session with the shared Userdata, start the lean root agent, and flush the
captured lead once the call ends. All behaviour lives in the supporting modules
(kb, root_agent, booking, cal_client, notify, sheets, lead, rpc).
"""

import asyncio
import contextlib
import datetime
import logging
import os
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from livekit.agents import (
    AgentServer,
    AgentSession,
    BackgroundAudioPlayer,
    JobContext,
    JobProcess,
    cli,
    room_io,
)
from livekit.plugins import ai_coustics, cartesia, deepgram, openai, silero
from livekit.plugins.turn_detector.english import EnglishModel

from cal_client import CalClient
from cerebrium_tts import CerebriumTTS
from kb import load_kb
from lead import Userdata
from notify import Notifier
from root_agent import NeerajAgent
from rpc import perform_rpc

logger = logging.getLogger("neeraj-agent")

load_dotenv(".env.local")

# Pipeline on your own keys (off LiveKit's metered gateway):
#   Deepgram nova-3 STT  ->  OpenAI gpt-5.3 LLM (brain)  ->  OpenAI gpt-4o-mini-tts.
# TTS is swappable with one env var, TTS_BACKEND:
#   openai    (default) expressive low-latency hosted voice.
#   kokoro    open-weight 82M, in-process on CPU, ~free  -> set TTS_BACKEND=kokoro.
#   cartesia  hosted streaming + instant voice cloning   -> needs CARTESIA_API_KEY.
#   cerebrium self-hosted XTTS voice-clone showcase.
STT_MODEL = "nova-3"
LLM_MODEL = "gpt-5.3-chat-latest"

# openai (default) | kokoro | cartesia | cerebrium. CEREBRIUM_TTS=1 is a back-
# compat shortcut for TTS_BACKEND=cerebrium.
TTS_BACKEND = (
    os.getenv("TTS_BACKEND")
    or ("cerebrium" if os.getenv("CEREBRIUM_TTS") == "1" else "openai")
).lower()

# Kokoro: lang 'a' = American English. Voices: am_michael/am_adam/am_onyx (male),
# af_heart/af_bella (female). 'b' = British.
KOKORO_VOICE = os.getenv("KOKORO_VOICE", "am_michael")
KOKORO_LANG = os.getenv("KOKORO_LANG", "a")

# Cartesia (hosted clone). Needs CARTESIA_API_KEY; CARTESIA_VOICE_ID = your clone.
CARTESIA_MODEL = os.getenv("CARTESIA_MODEL") or "sonic-2"

# OpenAI TTS fallback. Voices: alloy, ash, ballad, coral, echo, onyx, nova, sage.
OPENAI_TTS_MODEL = "gpt-4o-mini-tts"
OPENAI_TTS_VOICE = "alloy"
OPENAI_TTS_SPEED = 1.15  # brisk, so it never drags
OPENAI_TTS_INSTRUCTIONS = (
    "Warm, confident, professional engineer genuinely glad to show you around. Articulate and "
    "upbeat, natural intonation, brisk lively pace. Never slow, flat, or robotic."
)

# Cerebrium self-hosted XTTS voice-clone service (opt-in showcase; ~2s TTFB).
CEREBRIUM_TTS_WS_URL = os.getenv(
    "CEREBRIUM_TTS_WS_URL", "ws://localhost:8000/v1/tts/stream"
)

# Idle / away timeout: end the call gracefully when the visitor goes quiet, so a
# forgotten tab doesn't keep a session (and a worker slot) alive forever. We lean
# on LiveKit's built-in away detection: `user_away_timeout` marks the user "away"
# after this many seconds of a silent floor (it already pauses while the agent is
# speaking, so a long narration is safe). On "away" we nudge once, then hang up
# IDLE_END_AFTER seconds later unless they speak again. Set IDLE_WARN_AFTER=0 off.
IDLE_WARN_AFTER = float(os.getenv("IDLE_WARN_AFTER", "30"))
IDLE_END_AFTER = float(os.getenv("IDLE_END_AFTER", "20"))
IDLE_NUDGE = "Still there? Happy to keep going, or you can keep exploring on your own."
IDLE_GOODBYE = (
    "I'll let you keep looking around on your own. Thanks for stopping by, "
    "and feel free to reach out any time."
)


def _wire_idle_timeout(session: AgentSession) -> None:
    """Hang up gracefully after LiveKit reports the visitor 'away'. Nudge once,
    then end the call IDLE_END_AFTER seconds later unless they re-engage."""
    if IDLE_WARN_AFTER <= 0:
        return

    pending: dict = {"task": None}

    async def _hangup() -> None:
        try:
            await asyncio.sleep(IDLE_END_AFTER)
        except asyncio.CancelledError:
            return
        logger.info("idle.hangup")
        with contextlib.suppress(Exception):
            handle = session.say(
                IDLE_GOODBYE, allow_interruptions=False, add_to_chat_ctx=False
            )
            await handle.wait_for_playout()
        await asyncio.sleep(1.0)  # let the browser drain the last word
        with contextlib.suppress(Exception):
            await perform_rpc("endCall", {})

    @session.on("user_state_changed")
    def _on_user_state(ev) -> None:
        if getattr(ev, "new_state", None) == "away":
            # Floor has been silent (LiveKit pauses this while the agent talks).
            with contextlib.suppress(Exception):
                session.say(IDLE_NUDGE, allow_interruptions=True, add_to_chat_ctx=False)
            if pending["task"] is None or pending["task"].done():
                pending["task"] = asyncio.create_task(_hangup())
        else:
            # User re-engaged (speaking/listening) -> cancel the pending hang-up.
            task = pending["task"]
            if task is not None and not task.done():
                task.cancel()
            pending["task"] = None


def _tts_openai():
    """OpenAI gpt-4o-mini-tts — expressive, low latency. Needs OPENAI_API_KEY."""
    logger.info("tts.openai voice=%s", OPENAI_TTS_VOICE)
    return openai.TTS(
        model=OPENAI_TTS_MODEL,
        voice=OPENAI_TTS_VOICE,
        speed=OPENAI_TTS_SPEED,
        instructions=OPENAI_TTS_INSTRUCTIONS,
        api_key=os.getenv("OPENAI_API_KEY"),
    )


def _tts_cartesia():
    """Cartesia Sonic — hosted streaming + voice cloning. Needs CARTESIA_API_KEY;
    set CARTESIA_VOICE_ID to a cloned/stock voice."""
    voice = os.getenv("CARTESIA_VOICE_ID") or None
    logger.info("tts.cartesia model=%s voice=%s", CARTESIA_MODEL, voice or "<stock>")
    kwargs = {"model": CARTESIA_MODEL, "api_key": os.getenv("CARTESIA_API_KEY")}
    if voice:
        kwargs["voice"] = voice
    return cartesia.TTS(**kwargs)


def _tts_kokoro():
    """Kokoro-82M — open-weight, in-process on CPU, no key. Optional extra (pulls
    torch): `uv sync --extra kokoro`. find_spec checks it WITHOUT loading torch."""
    import importlib.util

    if importlib.util.find_spec("kokoro") is None:
        raise RuntimeError(
            "TTS_BACKEND=kokoro but the 'kokoro' extra isn't installed. "
            "Run: uv sync --extra kokoro"
        )
    from kokoro_tts import KokoroTTS

    logger.info("tts.kokoro voice=%s lang=%s", KOKORO_VOICE, KOKORO_LANG)
    return KokoroTTS(voice=KOKORO_VOICE, lang_code=KOKORO_LANG)


def _tts_cerebrium():
    """Self-hosted XTTS voice-clone service over WebSocket. Needs CEREBRIUM_*."""
    logger.info("tts.cerebrium url=%s", CEREBRIUM_TTS_WS_URL)
    return CerebriumTTS(
        ws_url=CEREBRIUM_TTS_WS_URL,
        token=os.getenv("CEREBRIUM_JWT") or None,
        speaker_reference_url=os.getenv("CEREBRIUM_SPEAKER_URL") or None,
        sample_rate=24000,
    )


_TTS_BACKENDS = {
    "openai": _tts_openai,
    "cartesia": _tts_cartesia,
    "kokoro": _tts_kokoro,
    "cerebrium": _tts_cerebrium,
}


def _build_tts():
    """Pick the TTS backend from TTS_BACKEND. Swap providers by setting that env
    var (+ the matching key); no code change needed."""
    builder = _TTS_BACKENDS.get(TTS_BACKEND)
    if builder is None:
        raise RuntimeError(
            f"unknown TTS_BACKEND={TTS_BACKEND!r}; choose one of: "
            f"{', '.join(_TTS_BACKENDS)}"
        )
    return builder()


KB = load_kb()

# Live sessions keyed by room name, so the on_session_end callback can find the
# session to flush its captured lead.
_SESSIONS: dict[str, AgentSession] = {}


def _summarize(session: AgentSession) -> str:
    """Cheap, deterministic 2-3 line recap of the visitor's turns for the lead
    email. Avoids an extra LLM call in the end-of-call path."""
    snippets: list[str] = []
    try:
        for item in session.history.items:
            if getattr(item, "role", None) == "user":
                text = getattr(item, "text_content", None) or ""
                text = text.strip()
                if text:
                    snippets.append(text)
    except Exception:
        return ""
    snippets = snippets[-6:]
    recap = " | ".join(s[:160] for s in snippets)
    return recap[:600]


def _full_transcript(session: AgentSession) -> str:
    """The whole conversation as plain "Visitor:/Neeraj:" lines, so the Sheet
    row carries enough to follow up even when nothing was emailed."""
    lines: list[str] = []
    try:
        for item in session.history.items:
            role = getattr(item, "role", None)
            if role not in ("user", "assistant"):
                continue
            text = (getattr(item, "text_content", None) or "").strip()
            if text:
                speaker = "Visitor" if role == "user" else "Neeraj"
                lines.append(f"{speaker}: {text}")
    except Exception:
        return ""
    return "\n".join(lines)


def _now_stamp() -> str:
    tz_name = os.getenv("CAL_TIMEZONE", "Asia/Kolkata")
    try:
        now = datetime.datetime.now(ZoneInfo(tz_name))
    except Exception:
        now = datetime.datetime.now(datetime.timezone.utc)
    return now.strftime("%Y-%m-%d %H:%M %Z")


async def _flush_session(session: AgentSession, room: str) -> None:
    """End-of-call persistence. ALWAYS logs the conversation to the Google Sheet
    (lead fields + summary + full transcript) so Neeraj can follow up on anyone,
    then emails the actionable leads. The Sheet is the durable record and the
    fallback if an email never goes out."""
    ud = session.userdata
    if not isinstance(ud, Userdata) or ud.lead_flushed:
        return
    transcript = _full_transcript(session)
    summary = _summarize(session)
    # A visitor who never said anything meaningful is not worth a row.
    if not transcript and not ud.lead.is_actionable():
        logger.info("session.flush_skip reason=empty room=%s", room)
        return
    ud.lead_flushed = True
    when = _now_stamp()
    try:
        logged = await ud.notifier.log_session(
            ud.lead, summary=summary, transcript=transcript, room=room, when=when
        )
        logger.info("session.flushed logged=%s room=%s", logged, room)
    except Exception:
        logger.exception("session.log_failed room=%s", room)
    if ud.lead.is_actionable():
        try:
            channel = await ud.notifier.send_lead(ud.lead, summary=summary, room=room)
            logger.info(
                "lead.emailed channel=%s room=%s outcome=%s",
                channel,
                room,
                ud.lead.outcome,
            )
        except Exception:
            logger.exception("lead.email_failed room=%s", room)


server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    # Load the VAD once per worker process so each call starts fast.
    proc.userdata["vad"] = silero.VAD.load()
    # Preload Kokoro (model + JIT) so the first turn isn't slow. Best-effort:
    # if it fails, the first synth just pays the load cost lazily.
    if TTS_BACKEND == "kokoro":
        try:
            from kokoro_tts import preload

            preload(KOKORO_VOICE, KOKORO_LANG)
        except Exception:
            logger.warning("kokoro.preload_failed (will load lazily)")


server.setup_fnc = prewarm


async def _on_session_end(ctx: JobContext) -> None:
    session = _SESSIONS.pop(ctx.room.name, None)
    if session is not None:
        await _flush_session(session, ctx.room.name)


@server.rtc_session(agent_name="neeraj-portfolio", on_session_end=_on_session_end)
async def session_entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}

    # Warm-up dispatch (from POST /api/voice/warmup): spin the worker up ahead of
    # a real call, then exit immediately so the replica stays warm. No session.
    if ctx.room.name.startswith("warmup"):
        logger.info("warmup dispatch room=%s; worker warm, exiting", ctx.room.name)
        return

    userdata = Userdata(
        kb=KB,
        notifier=Notifier.from_env(),
        cal=CalClient.from_env(),
    )

    session: AgentSession[Userdata] = AgentSession(
        userdata=userdata,
        # smart_format renders spoken numbers as digits in the transcript/captions
        # (e.g. "+94 67892345", "2024"), instead of spelling them out as words.
        stt=deepgram.STT(model=STT_MODEL, language="en-US", smart_format=True),
        llm=openai.LLM(model=LLM_MODEL, api_key=os.getenv("OPENAI_API_KEY")),
        tts=_build_tts(),
        turn_detection=EnglishModel(),
        vad=ctx.proc.userdata["vad"],
        # Start generating on partial transcripts so the reply begins sooner.
        preemptive_generation=True,
        # Mark the visitor "away" after a silent floor; _wire_idle_timeout acts on it.
        user_away_timeout=IDLE_WARN_AFTER if IDLE_WARN_AFTER > 0 else None,
    )
    # Register for the on_session_end flush.
    _SESSIONS[ctx.room.name] = session

    await session.start(
        agent=NeerajAgent(KB),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=ai_coustics.audio_enhancement(
                    model=ai_coustics.EnhancerModel.QUAIL_VF_S
                ),
            ),
        ),
    )

    await ctx.connect()

    # Hang up gracefully if the visitor goes silent (uses LiveKit's away state).
    _wire_idle_timeout(session)

    # Background audio player: the agent plays a typing sound (a LiveKit built-in
    # clip) while it fills the contact form, so the gap between the form filling
    # in and the next words feels intentional. See root_agent.prefill_contact.
    background = BackgroundAudioPlayer()
    try:
        await background.start(room=ctx.room, agent_session=session)
        userdata.background = background
    except Exception:
        logger.warning("background_audio.start_failed")

    intro = (
        KB.intros[0]
        if KB.intros
        else "Hey! I'm an AI stand-in for Neeraj, here to show you his work. Want a quick tour?"
    )
    await session.generate_reply(
        instructions=(
            f"Greet the visitor warmly. Use this line or a close paraphrase, keeping the upfront "
            f'note that you are an AI stand-in for Neeraj: "{intro}". Then wait for them to respond.'
        )
    )


if __name__ == "__main__":
    cli.run_app(server)
