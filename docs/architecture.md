# Architecture

The product is a portfolio site that doubles as a real-time voice agent. The two halves in this repo, `web/` and `voice-agent/`, never call each other directly. They meet inside a LiveKit room: the browser publishes microphone audio and subscribes to the agent's audio, and the agent drives the page over a data-channel RPC.

## End-to-end flow

1. **Visitor clicks "Talk to my portfolio."** The browser calls `POST /api/voice/token` in the Next.js app.
2. **The site mints a short-lived LiveKit access token.** The route uses the server-only `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` and attaches a `RoomAgentDispatch` so LiveKit summons the agent worker into the room by name.
3. **The browser joins the room** over `wss://` using `NEXT_PUBLIC_LIVEKIT_URL` and the minted token.
4. **The agent worker is dispatched** into the same room. It greets the visitor and runs its speech pipeline: speech-to-text, an LLM turn, then text-to-speech.
5. **The agent drives the UI over RPC** while it talks: scrolling to and highlighting sections, opening the contact form, showing confirmation cards. The browser keeps its layout mounted across soft route changes so the session never drops mid-conversation.
6. **Side effects run on the agent backend**, not on the site: real Cal.com bookings, lead-capture email, a spreadsheet fallback, callback notifications.

Keeping the heavy, credentialed work (booking APIs, email, sheets) on the Python worker keeps the site itself a thin, free-tier-friendly frontend.

## Token + dispatch

- Endpoint: `web/src/app/api/voice/token/route.ts`.
- The agent is summoned by a fixed dispatch name. The same name is configured on the worker so LiveKit knows which worker to place in the room.
- Tokens are short-lived and minted per session. Server secrets stay server-side; only `NEXT_PUBLIC_*` values reach the browser.

## Knowledge base bridge

The agent narrates from the same content the site renders, so the two can never disagree.

- `web/scripts/build-voice-kb.ts` imports the structured content under `web/src/content/*` and writes `voice-agent/src/portfolio_kb.json`.
- The agent loads that JSON at startup to build its system prompt, its catalog of navigable sections and routes, and the set of `highlightId`s it is allowed to scroll to.
- Two invariants hold at build time: every emitted `highlightId` matches a rendered `data-highlight-id` in the matching component, and every id/section/route passes the frontend's RPC allowlist.

Regenerate after editing content:

```bash
cd web && npm run build:voice-kb
```

## RPC contract (agent ▸ frontend)

The agent calls these methods on the browser participant via `room.local_participant.perform_rpc(...)`. All calls are best-effort: the agent's helper returns an error object rather than throwing, so an unimplemented or failed method never breaks the call.

| Method | Payload | Effect |
|--------|---------|--------|
| `navigateTo` | `{ sectionId, highlightId?, text? }` | Scroll to a section and highlight it. `text` is the sentence being spoken, used to pace the scroll. |
| `openRoute` | `{ path, anchor?, highlightId? }` | Soft-navigate to a route (layout stays mounted). |
| `openContactForm` | `{ intent?, prefill? }` | Open the contact modal. |
| `prefillContactForm` | `{ intent?, name?, email?, message? }` | Fill the open form field by field. |
| `openBooking` | `{ intent }` | Open the Cal.com popup (booking fallback). |
| `downloadResume` | `{}` | Trigger the resume download. |
| `toggleCaptions` | `{ on? }` | Show or hide captions. |
| `bookingConfirmed` | `{ slotIso, eventTitle, calEventLink?, addToCalendarUrl?, attendeeEmail? }` | Show the booking confirmation card. |
| `voiceMessageSent` | `{ intent?, email? }` | Show the "message sent" card. |
| `callbackRequested` | `{ name? }` | Show the "will call you back" card. |
| `wrapUpWarning` | `{}` | Subtle "wrapping up soon" cue. |
| `submitFeedback` | `{ rating, quote? }` | Record session feedback. |
| `endCall` | `{}` | End the session and snap the UI to idle. |

### Safety

- Section ids and highlight ids must match `^[a-zA-Z0-9_-]+$`; route paths must match `^/[a-zA-Z0-9/_-]*$`. Anything outside the allowlist is rejected.
- `text` is free-form but length-capped and is never injected as HTML.

## Where side effects live

| Concern | Location |
|---------|----------|
| Mint LiveKit token + dispatch agent | web: `src/app/api/voice/token/route.ts` |
| Voice pipeline (STT ▸ LLM ▸ TTS) | voice-agent: `src/agent.py` and friends |
| Drive the UI (scroll, forms, cards) | voice-agent ▸ RPC ▸ web |
| Real booking (Cal.com v2) | voice-agent: `src/cal_client.py` |
| Lead-capture email (Resend) | voice-agent: `src/notify.py`, `src/lead.py` |
| Spreadsheet fallback (Google Sheets) | voice-agent: `src/sheets.py` |
| Contact-form fallback email | web: server action with Resend (env-gated) |

The contact form on the site has its own Resend-backed server action as a non-voice fallback. The richer, voice-driven booking and lead flows run on the agent.
