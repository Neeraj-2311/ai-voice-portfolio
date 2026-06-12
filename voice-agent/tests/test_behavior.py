"""Behavioral (judge-based) tests of the root agent against the real LLM.

They drive the agent with text on the production brain (gpt-5.3-chat-latest) so
they reflect real flow quality, with a cheaper judge. Skip without OPENAI_API_KEY.
"""

import os

import pytest
from livekit.agents import AgentSession
from livekit.plugins import openai

from kb import load_kb
from lead import Userdata
from notify import Notifier

requires_openai = pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="needs OPENAI_API_KEY",
)

AGENT_MODEL = "gpt-5.3-chat-latest"  # the production brain
JUDGE_MODEL = "gpt-4o-mini"  # cheap is fine for judging


def _userdata():
    return Userdata(
        kb=load_kb(),
        notifier=Notifier(api_key=None, from_addr=None, to_addr=None),
        cal=None,
    )


def _make_agent():
    # Imported lazily so module import never needs credentials.
    from root_agent import NeerajAgent

    return NeerajAgent(load_kb())


def _fn_names(result) -> list[str]:
    """Tool-call names emitted during a run."""
    names = []
    for event in result.events:
        item = getattr(event, "item", None)
        name = (
            item.get("name") if isinstance(item, dict) else getattr(item, "name", None)
        )
        if name:
            names.append(name)
    return names


def _assistant_text(result) -> str:
    parts = []
    for event in result.events:
        item = getattr(event, "item", None)
        role = (
            item.get("role") if isinstance(item, dict) else getattr(item, "role", None)
        )
        if role != "assistant":
            continue
        content = (
            item.get("content")
            if isinstance(item, dict)
            else getattr(item, "content", None)
        )
        if isinstance(content, list):
            parts.extend(str(c) for c in content)
        elif content:
            parts.append(str(content))
    return " ".join(parts)


@requires_openai
async def test_steers_to_intent_after_a_few_turns():
    """Public site: after a few aimless turns the agent should stop just answering
    and start converting, asking the visitor's intent or offering a next step."""
    async with AgentSession(
        llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
    ) as session:
        await session.start(_make_agent())
        for q in [
            "Tell me about your experience.",
            "What about your skills?",
            "Cool, what is voice AI like?",
            "Interesting, tell me more about agentic systems.",
            "Nice, what else do you do?",
        ]:
            result = await session.run(user_input=q)
        # By a few turns in (firm nudge), it should be converting, not still
        # just explaining the topic.
        await result.expect.contains_message(role="assistant").judge(
            openai.LLM(model=JUDGE_MODEL),
            intent="Beyond answering, it moves toward converting: it asks what the visitor is here "
            "to do or what they are after (hiring, a project, mentorship, or just exploring), or "
            "offers a concrete next step like a call or sending a message. NOT merely an offer to "
            "explain more about the topic.",
        )


@requires_openai
async def test_responses_stay_short():
    """Replies should be conversational, not monologues."""
    async with AgentSession(
        llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
    ) as session:
        await session.start(_make_agent())
        result = await session.run(user_input="Tell me about your experience.")
        text = _assistant_text(result)
        assert text, "expected a reply"
        assert len(text) < 450, f"reply too long ({len(text)} chars): {text[:160]}"


@requires_openai
async def test_greeting_is_neeraj_first_person():
    async with (
        openai.LLM(model=JUDGE_MODEL) as judge,
        AgentSession(
            llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
        ) as session,
    ):
        await session.start(_make_agent())
        result = await session.run(user_input="Hi, who am I talking to?")
        # The agent may scroll to a section first, so assert the message anywhere.
        await result.expect.contains_message(role="assistant").judge(
            judge,
            intent="Says he is Neeraj, in the first person, in a friendly natural way. Does not break "
            "character or say he is an AI assistant.",
        )


@requires_openai
async def test_grounding_no_fabrication():
    async with (
        openai.LLM(model=JUDGE_MODEL) as judge,
        AgentSession(
            llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
        ) as session,
    ):
        await session.start(_make_agent())
        result = await session.run(user_input="What city was I born in?")
        await result.expect.contains_message(role="assistant").judge(
            judge,
            intent="Does not claim to know the user's birthplace; does not invent a city.",
        )


@requires_openai
async def test_describes_experience_by_name_without_scroll_tool():
    """Narration is transcript-driven now: the agent should just talk (and name
    the company so the frontend can follow), with no scroll/navigate tool call."""
    async with AgentSession(
        llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
    ) as session:
        await session.start(_make_agent())
        result = await session.run(
            user_input="Tell me about your experience, especially the IntellifyAI role."
        )
        names = _fn_names(result)
        assert "navigate_to" not in names
        await result.expect.contains_message(role="assistant").judge(
            openai.LLM(model=JUDGE_MODEL),
            intent="Talks about his IntellifyAI experience and refers to it by name.",
        )


@requires_openai
async def test_skills_question_is_framed_as_the_stack():
    """A skills/tech question must be answered as the skill stack (so the page
    lands on the skills section), not as the three service lanes."""
    async with AgentSession(
        llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
    ) as session:
        await session.start(_make_agent())
        result = await session.run(user_input="What skills do you have?")
        text = _assistant_text(result).lower()
        # Leads with "my skills"/"my stack" so the transcript-nav matches skills.
        assert "skill" in text or "stack" in text, text[:160]


@requires_openai
async def test_projects_overview_before_deep_dive():
    """Asking broadly about projects should get a spoken OVERVIEW (naming a few),
    not an immediate deep dive that opens one case study's page."""
    async with (
        openai.LLM(model=JUDGE_MODEL) as judge,
        AgentSession(
            llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
        ) as session,
    ):
        await session.start(_make_agent())
        result = await session.run(user_input="What projects have you worked on?")
        # No deep-dive page open on a broad ask.
        assert "open_route" not in _fn_names(result)
        await result.expect.contains_message(role="assistant").judge(
            judge,
            intent="Gives a brief overview naming more than one piece of work and invites the "
            "visitor to pick one to hear more, rather than deep-diving into a single project.",
        )


@requires_openai
async def test_contact_form_fills_and_confirms_before_send():
    """When taking a written message the agent should (1) open and FILL the form
    via prefill_contact, (2) NOT send before confirming, (3) send only after a yes."""
    async with AgentSession(
        llm=openai.LLM(model=AGENT_MODEL), userdata=_userdata()
    ) as session:
        await session.start(_make_agent())
        r1 = await session.run(
            user_input=(
                "I'd like to send you a written message. I'm Sam, my email is sam@acme.com, "
                "and the message is: I loved your voice AI work, let's talk."
            )
        )
        r1.expect.contains_function_call(name="prefill_contact")
        # It must read it back and confirm first, not fire the send immediately.
        assert "send_contact_message" not in _fn_names(r1)

        r2 = await session.run(user_input="Yes, that's perfect, please send it.")
        r2.expect.contains_function_call(name="send_contact_message")
