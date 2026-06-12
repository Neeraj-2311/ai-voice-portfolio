# web

The Next.js portfolio site and the in-browser voice UI, one half of [ai-voice-portfolio](../README.md). The other half is the Python worker in [`../voice-agent`](../voice-agent).

## Quickstart

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:3000
```

To talk to the portfolio locally, also run the voice agent (see [../voice-agent](../voice-agent)).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run build:voice-kb` — regenerate `../voice-agent/src/portfolio_kb.json` from `src/content/*`

## Docs

- [../docs/web.md](../docs/web.md) — stack, structure, env, deploy
- [../docs/architecture.md](../docs/architecture.md) — how the site and the agent talk
