# Web (`web/`)

The Next.js portfolio site and the in-browser voice UI.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (CSS-variable theme, dark default, server-rendered to avoid FOUC)
- Framer Motion for restrained motion
- MDX for case studies (`@next/mdx`)
- `@livekit/components-react` for the in-browser voice session
- Cal.com popup via `@calcom/embed-react`
- Resend for the contact-form fallback email (server action, env-gated)

> Note: this is Next.js 16. Several App Router APIs (async `params`, route handlers, cookies) differ from older versions. When in doubt, check the installed docs under `node_modules/next/dist/docs/`.

## Structure

```
web/
├── src/
│   ├── app/                 App Router routes
│   │   ├── layout.tsx       mounts Nav, Footer, ContactModal, VoiceSystem, CalProvider
│   │   ├── api/voice/token/ POST -> { token, url, room } + agent dispatch
│   │   ├── case-studies/[slug]/  MDX-driven case study route
│   │   └── hire, mentorship, speaking, privacy, resume, ...
│   ├── components/
│   │   ├── voice/           VoiceSystem (root mount), voice arc UI, captions, cards, useVoiceSession
│   │   ├── booking/         Cal.com popup entry points
│   │   ├── contact/         contact form + modal + intent picker
│   │   ├── sections/        Hero, Services, Experience, CaseStudies, Skills, ...
│   │   ├── layout/          Nav, Footer, theme + text-size toggles
│   │   └── seo/             Person JSON-LD, analytics
│   ├── content/             structured TS content (single source of truth)
│   ├── lib/                 events, intents, theme, storage keys, icons
│   └── types/               content shape
├── scripts/build-voice-kb.ts   generates voice-agent/src/portfolio_kb.json from content/
├── netlify.toml
└── .env.example
```

## Environment

Copy `.env.example` to `.env.local` and fill in what you have. See [web/.env.example](../web/.env.example) for the annotated list. Highlights:

- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL` — public site basics.
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `NEXT_PUBLIC_LIVEKIT_URL` — used by `/api/voice/token` to mint tokens and by the browser to join the room.
- `NEXT_PUBLIC_CAL_USERNAME` — Cal.com booking links resolve to `cal.com/<username>/hire` and `/mentor`.
- `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` — contact-form fallback email.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — optional analytics; unset disables the script.

Only `NEXT_PUBLIC_*` values are inlined into the client bundle. Everything else stays server-side.

## Run

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run build:voice-kb   # regenerate the agent KB after editing content/
```

## Deploy (Netlify)

Because the app lives in `web/` rather than the repo root, set the Netlify project's **Base directory** to `web` under Site configuration ▸ Build & deploy. Netlify then reads `web/netlify.toml`.

`netlify.toml` excludes the site's env-var names from Netlify's secret scanner so a deploy is never blocked. Real secrets are still protected: Next.js only inlines `NEXT_PUBLIC_*` into the client bundle, and every `.env*` file is gitignored.
