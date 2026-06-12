# Contributing

Thanks for your interest in improving **AI Voice Portfolio**. Bug fixes, features, docs, and ideas are all welcome.

## Ways to contribute

- 🐛 **Report a bug** or 💡 **request a feature** via [Issues](https://github.com/Neeraj-2311/ai-voice-portfolio/issues).
- 📖 **Improve the docs** in `docs/` or the READMEs.
- 🔧 **Open a pull request** for a fix or enhancement.

## Project layout

This is a monorepo with two apps:

- [`web/`](web/) — the Next.js site and browser voice UI.
- [`voice-agent/`](voice-agent/) — the Python LiveKit Agents worker.

See the [README](README.md) for a full quickstart, and [`docs/`](docs/) for architecture and per-app guides.

## Development setup

**Web:**

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

**Voice agent:**

```bash
cd voice-agent
uv sync
cp .env.example .env.local
uv run python src/agent.py dev
```

If you change site content under `web/src/content/*`, regenerate the agent knowledge base so the two stay in sync:

```bash
cd web && npm run build:voice-kb
```

## Before you open a PR

Please make sure your change passes the same checks CI runs.

**Web:**

```bash
npm run lint
npm run typecheck
npm run build
```

**Voice agent:**

```bash
uv run ruff check
uv run ruff format
uv run pytest
```

When you change core agent behavior (instructions, tool descriptions, workflows), add or update a test in `voice-agent/tests/` rather than guessing. The agent is built test-first.

## Guidelines

- Keep pull requests focused: one logical change per PR.
- Match the style of the surrounding code; do not reformat unrelated files.
- **Never commit secrets.** Every real `.env*` file is gitignored; only `*.example` files belong in git.
- Write clear commit messages in the imperative mood ("Add X", "Fix Y").

## Branch and PR flow

1. Fork the repo and branch off `main`: `git checkout -b feature/your-thing`.
2. Make your change, with tests where it matters.
3. Push and open a Pull Request against `main` with a short description of what and why.

## Code of conduct

Be respectful, constructive, and welcoming. Assume good intent, keep feedback about the work, and help make this a friendly project to contribute to.
