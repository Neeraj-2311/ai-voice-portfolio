# AI Voice Portfolio

An AI engineering portfolio that is itself a voice agent. Visitors click "Talk to my portfolio" and a real-time voice agent gives a guided tour: it narrates while scrolling and highlighting the page, answers questions, captures leads, and books calls inline.

This repository combines the two halves of that product:

- **`web/`** — the Next.js site (the portfolio itself, plus the in-browser voice UI).
- **`voice-agent/`** — the Python LiveKit Agents worker that powers the conversation and all of its side effects (booking, email, lead capture).

The browser and the agent meet inside a LiveKit room. The browser mints a short-lived token, the agent is dispatched into the room, and the agent drives the UI over RPC while the user talks.

## How it fits together

```
                  ┌──────────────────────────── web/ (Next.js, Netlify) ────────────────────────────┐
   Visitor ─────▶ │  Portfolio UI  +  Voice UI (LiveKit components)                                  │
                  │        │                                                                         │
                  │        │ POST /api/voice/token  ──▶ mints LiveKit token + RoomAgentDispatch      │
                  └────────┼─────────────────────────────────────────────────────────────────────────┘
                           │ join room (wss)
                           ▼
                  ┌──────────────────────── LiveKit Cloud (room) ───────────────────────────┐
                  │   audio in/out  +  data channel (RPC)                                    │
                  └───────────────┬─────────────────────────────────────────────────────────┘
                                  │ dispatched as agent worker
                                  ▼
                  ┌─────────────────────── voice-agent/ (Python, LiveKit Cloud) ────────────┐
                  │  STT ▸ LLM ▸ TTS pipeline                                                │
                  │  RPC ──▶ drives the web UI (scroll, highlight, open forms, show cards)    │
                  │  Tools ─▶ Cal.com booking · Resend email · Google Sheets · lead capture  │
                  └─────────────────────────────────────────────────────────────────────────┘
```

The agent's knowledge comes from the same content the site renders. `web/scripts/build-voice-kb.ts` reads `web/src/content/*` and emits `voice-agent/src/portfolio_kb.json`, so the agent and the page never drift. See [docs/architecture.md](docs/architecture.md) for the full flow and the RPC contract.

## Repository layout

```
.
├── web/            Next.js 16 site + browser voice UI  (see docs/web.md)
├── voice-agent/    Python LiveKit Agents worker        (see docs/voice-agent.md)
├── docs/           architecture and per-app guides
├── LICENSE         MIT
└── README.md
```

## Quickstart

You will run two processes: the site and the agent worker. Each has its own environment file.

### 1. Web (Next.js)

```bash
cd web
npm install
cp .env.example .env.local   # fill in the values you have
npm run dev                  # http://localhost:3000
```

### 2. Voice agent (Python, uv)

```bash
cd voice-agent
uv sync
cp .env.example .env.local   # LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, model + tool keys
uv run python src/agent.py download-files   # one-time: VAD + turn-detector models
uv run python src/agent.py dev              # connects to your LiveKit project
```

With both running, open the site, click **Talk to my portfolio**, and the agent joins the room.

### Keeping the agent's knowledge in sync

After editing site content under `web/src/content/*`, regenerate the agent's knowledge base:

```bash
cd web && npm run build:voice-kb   # writes voice-agent/src/portfolio_kb.json
```

## Configuration

Nothing real is committed. Both apps ship a `.env.example` and ignore every real `.env*` file.

- **web** needs (at minimum) `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`, and the LiveKit server keys used by `/api/voice/token`. Optional: Cal.com username, Resend, Plausible. See [web/.env.example](web/.env.example).
- **voice-agent** needs LiveKit credentials plus the STT/LLM/TTS and tool provider keys. See [voice-agent/.env.example](voice-agent/.env.example).

## Deploy

- **Site → Netlify.** The Next.js app lives in `web/`, so set the project's **Base directory** to `web` (Site configuration ▸ Build & deploy). Netlify then reads `web/netlify.toml`.
- **Agent → LiveKit Cloud.** The worker ships a `Dockerfile` and `livekit.toml`. Deploy from `voice-agent/` with the LiveKit CLI (`lk agent deploy`) or any Docker host. See [docs/voice-agent.md](docs/voice-agent.md).

## Documentation

- [docs/architecture.md](docs/architecture.md) — end-to-end flow, token + dispatch, the agent ▸ frontend RPC contract, where side effects run.
- [docs/web.md](docs/web.md) — the Next.js app: stack, structure, env, run, deploy.
- [docs/voice-agent.md](docs/voice-agent.md) — the Python worker: pipeline, tools, env, run, tests, deploy.

## Tech

**Web:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, MDX, `@livekit/components-react`, Cal.com embed, Resend.
**Agent:** Python, [LiveKit Agents](https://github.com/livekit/agents), `uv`, a Deepgram (STT) ▸ OpenAI (LLM + TTS) voice pipeline on your own provider keys, with ai-coustics noise cancellation, Silero VAD, an English turn detector, and Cal.com v2, Resend, and Google Sheets integrations.

## License

[MIT](LICENSE). The voice-agent half began from the [LiveKit Agents Python starter](https://github.com/livekit-examples/agent-starter-python), also MIT.
