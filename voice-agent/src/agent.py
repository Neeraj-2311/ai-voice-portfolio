"""Entrypoint for the Neeraj portfolio voice agent.

Kept thin on purpose (it is the Dockerfile entrypoint): load env + KB, wire the
session with the shared Userdata, start the lean root agent, and flush the
captured lead once the call ends. All behaviour lives in the supporting modules
(kb, root_agent, booking, cal_client, notify, sheets, lead, rpc).
"""

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
from livekit.plugins import ai_coustics, deepgram, openai, silero
from livekit.plugins.turn_detector.english import EnglishModel

from cal_client import CalClient
from kb import load_kb
from lead import Userdata
from notify import Notifier
from root_agent import NeerajAgent

logger = logging.getLogger("neeraj-agent")

load_dotenv(".env.local")

# Pipeline on your own keys (off LiveKit's metered gateway):
#   Deepgram nova-3 STT  ->  OpenAI gpt-5.3 LLM (brain)  ->  OpenAI gpt-4o-mini-tts.
# We use OpenAI TTS (not Deepgram Aura) so the voice is EXPRESSIVE: `instructions`
# steers tone/emotion and `speed` fixes the slow pacing. Voice options: ash,
# onyx, ballad, verse, echo, sage (ash/onyx/verse read as warm males).
STT_MODEL = "nova-3"
LLM_MODEL = "gpt-5.3-chat-latest"
TTS_MODEL = "gpt-4o-mini-tts"
# Voice options: alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer.
TTS_VOICE = "alloy"
TTS_SPEED = 1.15  # brisk, so it never drags
# Kept short on purpose: a concise style prompt also trims TTS latency.
TTS_INSTRUCTIONS = (
    "Warm, confident, professional engineer genuinely glad to show you around. Articulate and "
    "upbeat, natural intonation, brisk lively pace. Never slow, flat, or robotic."
)

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


server.setup_fnc = prewarm


async def _on_session_end(ctx: JobContext) -> None:
    session = _SESSIONS.pop(ctx.room.name, None)
    if session is not None:
        await _flush_session(session, ctx.room.name)


@server.rtc_session(agent_name="neeraj-portfolio", on_session_end=_on_session_end)
async def session_entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}

    userdata = Userdata(
        kb=KB,
        notifier=Notifier.from_env(),
        cal=CalClient.from_env(),
    )

    session: AgentSession[Userdata] = AgentSession(
        userdata=userdata,
        stt=deepgram.STT(model=STT_MODEL, language="en-US"),
        llm=openai.LLM(model=LLM_MODEL, api_key=os.getenv("OPENAI_API_KEY")),
        tts=openai.TTS(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            speed=TTS_SPEED,
            instructions=TTS_INSTRUCTIONS,
            api_key=os.getenv("OPENAI_API_KEY"),
        ),
        turn_detection=EnglishModel(),
        vad=ctx.proc.userdata["vad"],
        # Start generating on partial transcripts so the reply begins sooner.
        preemptive_generation=True,
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
        KB.intros[0] if KB.intros else "Hey, I'm Neeraj. Want a quick tour of my work?"
    )
    await session.generate_reply(
        instructions=(
            f"Greet the visitor warmly in first person as Neeraj. Use this line or a close "
            f'paraphrase: "{intro}". Then wait for them to respond.'
        )
    )


if __name__ == "__main__":
    cli.run_app(server)
