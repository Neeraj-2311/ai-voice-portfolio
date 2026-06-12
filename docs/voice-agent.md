# Voice agent (`voice-agent/`)

The Python [LiveKit Agents](https://github.com/livekit/agents) worker that powers the conversation and its side effects. It started from the LiveKit Agents Python starter and was extended with the portfolio persona, the RPC UI control, and real booking / lead tools.

## Pipeline

- Speech-to-text, an LLM turn, then text-to-speech, wired through [LiveKit Inference](https://docs.livekit.io/agents/models/inference) (Deepgram STT, an OpenAI LLM, Cartesia TTS by default). The exact model ids live in `src/agent.py`.
- English turn detector for contextually-aware turn taking.
- Auto-greets on session start.
- First-person persona grounded in `src/portfolio_kb.json`, which is generated from the site's content (see [architecture.md](architecture.md)).

## Structure

```
voice-agent/
├── src/
│   ├── agent.py            entrypoint (keep this as the entrypoint; the Dockerfile runs it)
│   ├── root_agent.py       agent definition, tools, instructions
│   ├── rpc.py              best-effort RPC helper that drives the web UI
│   ├── portfolio.py        persona / portfolio knowledge wiring
│   ├── portfolio_kb.json   generated knowledge base (built from web/src/content/*)
│   ├── kb.py               knowledge-base loading
│   ├── cal_client.py       Cal.com v2 booking
│   ├── lead.py             lead model
│   ├── notify.py           lead-capture email (Resend)
│   ├── sheets.py           Google Sheets fallback
│   └── net.py              shared HTTP helpers
├── tests/                  pytest suite for tools and behavior
├── Dockerfile              production image for LiveKit Cloud
├── livekit.toml            LiveKit Cloud project + agent id
└── .env.example
```

## Function tools

The agent exposes tools the LLM can call mid-conversation, including: navigate to a section, open a route, open the contact form, download the resume, book a call, submit feedback, toggle captions, and end the call. Each tool drives the browser over RPC and/or performs a backend side effect. See `src/root_agent.py` for the registered set, and [architecture.md](architecture.md) for the RPC contract.

## Environment

Copy `.env.example` to `.env.local`. Required at minimum:

- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

Plus provider keys for the STT/LLM/TTS pipeline and the tools (Cal.com, Resend, Google Sheets). See [voice-agent/.env.example](../voice-agent/.env.example) for the full annotated list.

If you use the LiveKit CLI you can load LiveKit credentials automatically:

```bash
lk cloud auth
lk app env -w -d .env.local
```

## Run

This project uses the `uv` package manager.

```bash
cd voice-agent
uv sync
uv run python src/agent.py download-files   # one-time: VAD + turn-detector models
uv run python src/agent.py console          # talk to it directly in the terminal
uv run python src/agent.py dev              # run for use with the web frontend
uv run python src/agent.py start            # production
```

## Tests and linting

```bash
uv run pytest          # behavior + tool tests
uv run ruff check      # lint
uv run ruff format     # format
```

CI runs `pytest` and `ruff` on push (`.github/workflows/`). If the tests need live LiveKit credentials in CI, add `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` as repository secrets.

## Deploy (LiveKit Cloud)

The worker ships a production `Dockerfile` and a `livekit.toml`. Deploy with the LiveKit CLI from `voice-agent/`:

```bash
lk agent deploy
```

Or run the Docker image on any host. See the LiveKit [deploying to production](https://docs.livekit.io/deploy/agents/) guide. The dispatch name the worker registers under must match the one the site requests in `web/src/app/api/voice/token/route.ts`.

## More

The [voice-agent/README.md](../voice-agent/README.md) retains the upstream LiveKit starter guide, which covers the CLI, model downloads, telephony, and self-hosting in more depth.
