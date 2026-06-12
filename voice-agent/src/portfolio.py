"""Portfolio knowledge base for the Neeraj voice agent.

Kept as a single Python module so we can hand-author the same content
the Next.js site renders, but tuned for speech: short sentences,
spelled-out URLs, no markdown.

The frontend RPC dispatcher (src/components/voice/VoiceSystem.tsx)
accepts these section IDs and route paths.
"""

NEERAJ_BIO = (
    "I am Neeraj. I am a voice AI and full-stack engineer based in London. "
    "I build production voice agents, agentic backends, and full-stack AI products. "
    "Most recently I shipped an enterprise voice AI platform at IntellifyAI in London, "
    "with GDPR compliance and security hardening. I am available from the seventh of May, 2026, "
    "open to full-time, fractional, and contract work."
)

# Navigation targets the agent can call via the navigateTo RPC.
# section_id maps to the anchor on the homepage.
HOMEPAGE_SECTIONS = {
    "hero": "the top of the page",
    "services": "what I do, my three service lanes",
    "experience": "my work experience timeline",
    "case-studies": "case studies and proof of work",
    "skills": "my skill stack",
    "mentorship": "free 30-minute mentorship calls for students and devs",
    "speaking": "speaking at events, hackathons, bootcamps, and colleges",
    "hire": "the hire me section",
    "contact": "the contact form",
}

# Routes the agent can soft-navigate the user to via openRoute RPC.
ROUTES = {
    "/": "homepage",
    "/hire": "dedicated hire page with engagement details and FAQ",
    "/mentorship": "dedicated mentorship page with the booking calendar",
    "/speaking": "dedicated speaking page",
    "/case-studies/enterprise-voice-ai": "the IntellifyAI enterprise voice AI case study",
    "/case-studies/goreach": "the GoReach case study",
    "/case-studies/sheets-voice-automation": "the sheets voice automation case study",
    "/resume": "my resume PDF",
    "/privacy": "the privacy policy",
}

# Things the agent should know about the homepage content, summarized for speech.
KEY_FACTS = [
    "I have three service lanes. Voice AI engineering with LiveKit and Azure AI Foundry. "
    "Agentic systems and full-stack AI products with Next.js and FastAPI. "
    "And one-on-one mentorship and speaking.",
    "I have three work experiences. IntellifyAI in London where I am a full stack engineer, "
    "started September 2025. Mindcraft Labs in Gurgaon where I built fullstack AI, "
    "February 2025 to September 2025. And Menrva Technologies in Bangalore, "
    "front-end developer intern, October 2023 to January 2025.",
    "I have three case studies. The enterprise voice AI platform at IntellifyAI is the most fleshed out. "
    "GoReach and a sheets voice automation are placeholders for now.",
    "My skill stack includes Python, TypeScript, JavaScript, C++, and the AI side: LLMs, RAG, "
    "agentic AI, LiveKit, Azure AI Foundry, voice orchestration, prompt engineering. "
    "Frameworks: FastAPI, Next.js, Node, Express, React. "
    "Cloud: Azure, AWS, Docker, GitHub Actions, MongoDB, Firebase, Convex DB, PostgreSQL.",
    "Mentorship calls are free, 30 minutes, for students and early-career devs working on AI. "
    "Not paid. Just a real call. We can dig into career roadmaps, voice agent architecture, "
    "or portfolio and resume feedback.",
    "Hire me for project work, fractional advisory, or a free 30-minute discovery call. "
    "I work with teams that ship.",
]

VOICE_DISCLAIMER = "This is a clone of my voice and audio is not stored."

INTROS = [
    "Hey, I'm Neeraj. Want a quick tour of my work, or have something specific to ask?",
    "Hi. This is Neeraj. Curious about my work, or want to hire me, or book a mentorship call?",
]

# Frontend RPC method catalog (for reference in the system prompt).
RPC_METHODS = """
Frontend RPC methods you can invoke via the function tools:
- navigateTo(sectionId, highlightId): scroll homepage to a section
- openRoute(path, anchor, highlightId): soft route the user to a different page
- openContactForm(intent, prefill): open the intent-routed contact form
- downloadResume(): open the resume in a new tab
- toggleCaptions(on): show or hide captions
- bookingConfirmed(slotIso, eventTitle, calEventLink, addToCalendarUrl, attendeeEmail):
  fire AFTER you have completed a booking on the backend
- submitFeedback(rating, quote): fire after the user gives feedback on the tour
- endCall(): end the call cleanly
""".strip()
