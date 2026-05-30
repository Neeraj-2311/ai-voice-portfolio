# Portfolio Plan & Context

**Read this first.** Single source of truth for what this project is, what we are building, what has shipped, what is next, and how to operate.

When you fire up a fresh Claude session, paste: `read PORTFOLIO-PLAN.md, then continue from "Next up"`.

---

## 1. What this is

Personal portfolio for **Neeraj**, a Voice AI and full-stack engineer based in London. Three audiences:

1. **Founders and companies** looking to hire for voice AI, agentic systems, or full-stack AI work.
2. **Students and early-career devs** looking for free 30-min mentorship calls.
3. **Event organizers** looking to invite Neeraj to speak, mentor, or judge.

Primary success metric: every audience can reach a contact or booking action in **at most 2 clicks** from anywhere on the site.

Viral hook: the site is itself a voice agent. Visitors click "Talk to my portfolio" and Neeraj (cloned voice) gives a guided tour, navigating the page via RPC and booking calls inline.

---

## 2. Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (CSS-vars-based theme, @theme inline, @utility)
- **Motion**: Framer Motion (restrained, single signature moments)
- **Content**: structured TS files in `src/content/*.ts` so Phase 2 RAG can use them
- **Booking**: Cal.com popup via `@calcom/embed-react`, configured by `NEXT_PUBLIC_CAL_USERNAME`
- **Voice**: LiveKit + `@livekit/components-react` on the client, LiveKit Agents Python in `/Users/neeraj/Projects/voice-agent`
- **Email**: Resend (server action) for contact form fallback
- **MDX case studies**: `@next/mdx`
- **Deploy**: Vercel for the site, LiveKit Cloud (or any Docker host) for the agent worker

> AGENTS.md flags that Next.js 16 has breaking changes from your training data. Read `node_modules/next/dist/docs/` for any Next API you are unsure of, e.g. async `params`, cookies, route handlers.

---

## 3. Repo layout (the bits that matter)

```
src/
  app/                       App Router routes
    layout.tsx               mounts Nav, Footer, ContactModal, VoiceSystem, CalProvider
    api/voice/token/         POST -> { token, url, room } + agent dispatch
    case-studies/[slug]/     MDX-driven case study route
    hire/, mentorship/, speaking/, privacy/, resume/
  components/
    booking/                 BookCallButton, CalProvider
    contact/                 ContactForm + Modal + IntentPicker
    layout/                  Nav, Footer, ThemeToggle, TextSizeToggle
    primitives/              Button, Card, TechBadge, SectionReveal, BrandIcon
    seo/                     PersonJsonLd, PlausibleAnalytics
    sections/                Hero, Services, Experience, CaseStudies, Demos,
                             Skills, Mentorship, Speaking, Hire, Contact,
                             AmbientVisualizer, LinearWaveStrip, CursorSpotlight,
                             CaseStudyCover, SlashHint
    voice/                   VoiceSystem (root mount), VoiceArc, VoicePill,
                             HeroVoiceCTA, AudioVisualizer, CaptionRail,
                             ControlRow, TextFallback, BookingSummaryCard,
                             FeedbackPanel, useVoiceSession, state.ts
  content/                   site, nav, services, experience, case-studies,
                             skills, mentorship, speaking, hire
  lib/                       contact-modal-event, voice-event, intents,
                             theme, text-size, storage-keys, icons
  types/                     content.ts (single source of content shape)
```

Agent worker lives in a **sibling** directory: `/Users/neeraj/Projects/voice-agent`. Python, `uv`-managed, deployable via LiveKit CLI.

---

## 4. Status by section

### Shipped
- Theme system (dark default, light, cookie-persisted, server-rendered for zero FOUC).
- Larger-text toggle (bumps body and small only, not headings or chrome).
- Hero: ambient cursor spotlight + dot grid, layered CSS pulse-wave strip in CTA area, slash-key shortcut, third primary CTA "Talk to my portfolio".
- Voice arc system: morphing pill to arc via Framer `layoutId`, full state machine, LiveKit connect, RPC dispatcher, captions consolidated per-speaker, text fallback (mic-muted), audio attach on TrackSubscribed, end-call snap-to-idle.
- Contact: intent picker, RHF + Zod, native validation, modal with key bump per open so initial intent and prefill take effect every open, LinkedIn / X DM links, server action with Resend (env-gated).
- Booking: Cal.com popup theme-synced to site theme, BookCallButton single entry point.
- Sections:
  - Hire: quick-contact row, single CTA + 3 descriptive engagement paragraphs.
  - Mentorship: single CTA + bulleted topics, "Not paid. Just a call." line.
  - Speaking: topics + formats grid, contact-form invite CTA.
  - Experience: timeline with tech badges (CSS-only tooltip).
  - Case studies: programmatic SVG cover art per project, featured-style cards with hover lift + cover scale, metric pulled out of cover.
  - Skills: badge grid by category.
- Cursor spotlight rolled out to **every** homepage section via `CursorSpotlight` component.
- SEO: sitemap, robots, Person JSON-LD, edge OG image (1200x630).
- Phase 2 hooks: `data-highlight-id` on every interesting sub-element, `data-voice-action` on key CTAs, `/api/voice/token` ready, agent dispatch wired via `RoomAgentDispatch`.

### Voice agent (sibling repo `/Users/neeraj/Projects/voice-agent`)
- Persona: first-person Neeraj impersonation. System prompt baked with portfolio knowledge from `src/portfolio.py`.
- Pipeline: Deepgram nova-3 STT (English), OpenAI gpt-5.2-chat-latest LLM via LiveKit Inference, Cartesia sonic-3 TTS (placeholder voice id, needs Neeraj's clone).
- English turn detector.
- Auto-greets on session start.
- Function tools registered: `navigate_to`, `open_route`, `open_contact_form`, `download_resume`, `book_call` (mocked, fires `bookingConfirmed` RPC to test UI), `submit_feedback`, `toggle_captions`, `end_call`.
- Agent name: `neeraj-portfolio` (matches what `RoomAgentDispatch` in `/api/voice/token` requests).
- Local run: `cd /Users/neeraj/Projects/voice-agent && source .venv/bin/activate && python src/agent.py dev`.

### In progress / current focus

- **Frontend polish pass** using the now-installed shadcn + magic MCPs.
  - Hero, Case Studies done.
  - Cursor spotlight on every section done.
- Mentorship, Speaking, Hire, Contact sections all have the spotlight wired but their layouts have not been re-thought beyond the rewrite earlier.

### Next up (priority order)

1. **Skills section rework** — current is a flat badge grid by category, feels static. Direction: bento-style grid where each category is a card with hover-reveal of a one-line "how I have used this" note. Pull patterns from shadcn (Card variants) and Magic UI (BentoGrid) via MCP.
2. **Experience timeline polish** — sharper hover, vertical accent rail, tighter spacing.
3. **Mobile pass** — pin layouts at 375 / 768. Hero text wraps weirdly, arc is too tall on phones, slash hint hidden, but other sections untested.
4. **Microinteractions sweep** — button springs, focus rings, link underlines, page-route transitions. The Rauno / Linear floor-raise pass.
5. **Real Cartesia voice clone** — Neeraj uploads a 60s sample, swap `CARTESIA_VOICE_ID` in `voice-agent/src/agent.py`.
6. **Cal v2 real booking** — replace the mocked `book_call` with a real Cal v2 call from the agent backend.
7. **Mindcraft outcome bullet** — Neeraj to provide concrete metric.
8. **Mentorship final prices** — currently nullable.
9. **Case study cover photos** — real metric values for GoReach and Sheets-to-call. Currently `[TODO]`.

---

## 5. Locked design decisions

- **Aesthetic level**: confident-but-restrained, Anthropic / Cursor coded. No Three.js, no parallax, no mesh gradients, no neon, no template-y AI shimmer.
- **Accent**: indigo `#6366F1` in both themes. Used sparingly: max one accent CTA per visual group.
- **Borders**: 1px (overrides the original spec's 0.5px).
- **Em dashes**: never used. Substitute with periods, commas, colons, or restructure. Memory rule, applies everywhere: UI copy, content files, code comments, commit messages.
- **Motion budget**: page transition opacity + 8px Y. Hover 150ms. Scroll-reveal once at 20% viewport. Cursor spotlight per section. Linear wave strip in hero CTA area.
- **Voice arc geometry**: bottom-center curved-top panel, ~720x260, morphs from corner pill via shared `layoutId="voice-cta"`.
- **Booking**: every "Book a call" CTA opens Cal.com popup via `BookCallButton intent="hire" | "mentor"`. No more contact-form-as-gateway for booking intents. Speaking and Other still use the contact form.
- **Voice navigation**: pure tool call from agent (`navigateTo`, `openRoute`). Soft routes via `router.push`, layout stays mounted so the LiveKit session never drops mid-conversation.

---

## 6. RPC contract (agent -> frontend)

Agent registers as `neeraj-portfolio`. Frontend mints a token with `RoomAgentDispatch` so LiveKit summons the worker. Agent calls these via `room.local_participant.perform_rpc(...)`:

```
navigateTo({sectionId, highlightId?})
openRoute({path, anchor?, highlightId?})
openContactForm({intent?, prefill?})
downloadResume({})
toggleCaptions({on?})
bookingConfirmed({slotIso, eventTitle, calEventLink?, addToCalendarUrl?, attendeeEmail?})
submitFeedback({rating: 'great'|'good'|'okay'|'bad', quote?})
endCall({})
```

Booking and slot listing happen on the **agent backend** (Cal v2 directly), not via frontend RPC. The frontend only sees `bookingConfirmed` after the agent has already done it.

---

## 7. MCP servers (now connected)

- **shadcn** (`shadcn@latest mcp`): authoritative access to the shadcn registry. Use for component sources (cards, hover-card, navigation-menu, scroll-area, etc) instead of guessing props.
- **magic** (`@21st-dev/magic@latest`): text-to-UI exploration. Use when designing a new section to compare 3 to 5 variants before committing.

Config lives in `.mcp.json` (gitignored). Template at `.mcp.json.example`. Reload window or restart `claude` CLI when changing.

When designing the next section, prefer:
1. Browse shadcn for the closest existing pattern first.
2. If nothing fits, ask magic for 3 to 5 variants.
3. Synthesize the component in our own file (do not blanket-install all of shadcn).

---

## 8. Operating rules

- **No em dashes anywhere** (UI copy, comments, commit messages).
- Use the auto memory at `/Users/neeraj/.claude/projects/-Users-neeraj-Projects/memory/` for user/feedback/project memories. Read `MEMORY.md` at session start.
- AGENTS.md flags Next.js 16 has breaking changes. Read `node_modules/next/dist/docs/` for any Next API.
- Prefer editing existing files. Do not create unnecessary new files.
- Server components by default. Mark `'use client'` only when needed.
- Each section that wants ambient motion gets `relative isolate overflow-hidden` and a `<CursorSpotlight />` as its first child.
- Voice CTA pill should remain visually first-class. Never bury the pill or remove the hero "Talk to my portfolio" CTA.

---

## 9. Local dev cheat sheet

```bash
# Portfolio
cd /Users/neeraj/Projects/neeraj-ai-portfolio
npm install                # if first time
npm run dev                # localhost:3000

# Voice agent worker
cd /Users/neeraj/Projects/voice-agent
source .venv/bin/activate
python src/agent.py dev    # joins LiveKit rooms automatically

# Type / lint checks
cd /Users/neeraj/Projects/neeraj-ai-portfolio
npx tsc --noEmit
npx eslint src

# Cal events to create on cal.com/<NEXT_PUBLIC_CAL_USERNAME>
#   /hire    30 min, free
#   /mentor  30 min, free
```

Env vars in `.env.local` (gitignored; template in `.env.example`):
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`, `NEXT_PUBLIC_CAL_USERNAME`
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`
- Optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO`

---

## 10. Outstanding content TODOs (Neeraj fills)

- Real Mindcraft achievement bullet
- Real case study metrics for GoReach and Sheets-to-call
- Real testimonials (mentorship)
- Past speaking events list
- Profile photo, OG asset
- Resume PDF replacement
- Cartesia voice clone id
- Cal.com events created on the actual account
