/**
 * Voice KB generator. Single source of truth for the voice agent's knowledge.
 *
 * Reads the same structured content the site renders (src/content/*) and emits
 * voice-agent/src/portfolio_kb.json. The agent loads that JSON at startup to
 * build its system prompt, its navigable section / route catalogs, and the
 * catalog of highlight ids it can scroll-and-highlight while narrating.
 *
 * Two invariants this script must hold:
 *  1. Every `highlightId` it emits must equal the rendered `data-highlight-id`
 *     in the matching section component, so the agent can target real DOM nodes.
 *     The id derivation here mirrors each component exactly (see comments).
 *  2. Every id / section / route must pass the frontend's RPC allowlist
 *     (`^[a-zA-Z0-9_-]+$` for ids, `^/[a-zA-Z0-9/_-]*$` for paths). A build-time
 *     assertion enforces this so a bad id can never ship.
 *
 * `note` fields are short, paraphrasable grounding, NOT lines for the agent to
 * read verbatim. The agent is instructed to speak conversational summaries.
 *
 * Run: `npm run build:voice-kb` (also runs in `prebuild`).
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { caseStudies } from '../src/content/case-studies';
import { experience } from '../src/content/experience';
import { hireEngagementTypes } from '../src/content/hire';
import { mentorshipTopics } from '../src/content/mentorship';
import { services } from '../src/content/services';
import { site } from '../src/content/site';
import { skillGroups } from '../src/content/skills';
import { speakingTopics } from '../src/content/speaking';

const ID_RE = /^[a-zA-Z0-9_-]+$/;
const PATH_RE = /^\/[a-zA-Z0-9/_-]*$/;

interface Highlight {
  highlightId: string;
  sectionId: string;
  route: string;
  label: string;
  note: string;
  details?: string[];
}

interface VoiceKb {
  version: string;
  generatedAt: string;
  bio: string;
  voiceDisclaimer: string;
  intros: string[];
  sections: { sectionId: string; label: string }[];
  routes: { path: string; label: string }[];
  highlights: Highlight[];
  facts: string[];
}

/** Collapse whitespace and trim. Keeps notes tidy for the prompt. */
const tidy = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** First sentence of a longer blurb, for a compact paraphrasable note. */
function firstSentence(s: string): string {
  const m = tidy(s).match(/^.*?[.!?](?:\s|$)/);
  return tidy(m ? m[0] : s);
}

// Homepage section anchors the agent can scroll to (must match the `id="..."`
// on each section wrapper in src/components/sections/*).
const SECTIONS: { sectionId: string; label: string }[] = [
  { sectionId: 'hero', label: 'the top of the page, who I am at a glance' },
  { sectionId: 'services', label: 'what I do, my three service lanes' },
  { sectionId: 'experience', label: 'my work experience timeline' },
  { sectionId: 'case-studies', label: 'case studies and proof of work' },
  { sectionId: 'skills', label: 'my skill stack' },
  { sectionId: 'mentorship', label: 'free thirty minute mentorship calls' },
  { sectionId: 'speaking', label: 'speaking at events, hackathons, colleges' },
  { sectionId: 'hire', label: 'the hire me section' },
  { sectionId: 'contact', label: 'the contact form' },
];

const ROUTES: { path: string; label: string }[] = [
  { path: '/', label: 'homepage' },
  { path: '/hire', label: 'dedicated hire page with engagement details' },
  { path: '/mentorship', label: 'dedicated mentorship page with the booking calendar' },
  { path: '/speaking', label: 'dedicated speaking page' },
  { path: '/case-studies/talk-to-my-portfolio', label: 'the talk-to-my-portfolio case study' },
  { path: '/case-studies/enterprise-voice-ai', label: 'the enterprise voice AI case study' },
  { path: '/case-studies/goreach', label: 'the GoReach case study' },
  { path: '/case-studies/sheets-voice-automation', label: 'the sheets voice automation case study' },
  { path: '/resume', label: 'my resume PDF' },
];

function buildHighlights(): Highlight[] {
  const out: Highlight[] = [];

  // Services. Component: src/components/sections/Services.tsx renders
  // data-highlight-id={service.id} (already prefixed `services-...`).
  for (const s of services) {
    out.push({
      highlightId: s.id,
      sectionId: 'services',
      route: '/',
      label: s.title,
      note: firstSentence(s.summary),
      details: s.highlights ? s.highlights.map(tidy) : undefined,
    });
  }

  // Experience. Component: Experience.tsx renders data-highlight-id={role.id}.
  for (const r of experience) {
    out.push({
      highlightId: r.id,
      sectionId: 'experience',
      route: '/',
      label: `${r.company}, ${r.title} (${r.start} to ${r.end})`,
      note: firstSentence(r.bullets[0] ?? ''),
      details: r.bullets.map(tidy),
    });
  }

  // Case studies. Component: CaseStudies.tsx renders data-highlight-id={`case-${slug}`}.
  for (const c of caseStudies) {
    out.push({
      highlightId: `case-${c.slug}`,
      sectionId: 'case-studies',
      route: '/',
      label: `${c.title} (${c.heroMetric.value} ${c.heroMetric.label})`,
      note: firstSentence(c.summary),
      details: [tidy(c.summary)],
    });
  }

  // Skills. Component: Skills.tsx renders data-highlight-id={`skills-${group.id}`}.
  for (const g of skillGroups) {
    out.push({
      highlightId: `skills-${g.id}`,
      sectionId: 'skills',
      route: '/',
      label: g.title,
      note: `My ${g.title.toLowerCase()} stack.`,
      details: g.skills.map((sk) => sk.name),
    });
  }

  // Mentorship topics. Component: Mentorship.tsx renders
  // data-highlight-id={`mentorship-${topic.id}`}.
  for (const t of mentorshipTopics) {
    out.push({
      highlightId: `mentorship-${t.id}`,
      sectionId: 'mentorship',
      route: '/',
      label: firstSentence(t.label),
      note: tidy(t.label),
    });
  }

  // Hire engagement types. Component: Hire.tsx renders
  // data-highlight-id={`hire-${type.id}`}.
  for (const h of hireEngagementTypes) {
    out.push({
      highlightId: `hire-${h.id}`,
      sectionId: 'hire',
      route: '/',
      label: h.title,
      note: firstSentence(h.description),
      details: [tidy(h.description)],
    });
  }

  // Speaking topics live on the /speaking route; they have no homepage
  // data-highlight-id, so we expose them as route-level grounding only,
  // pointing the agent at the speaking section anchor for scroll.
  for (const t of speakingTopics) {
    out.push({
      highlightId: `speaking-${t.id}`,
      sectionId: 'speaking',
      route: '/',
      label: firstSentence(t.label),
      note: tidy(t.label),
    });
  }

  return out;
}

function buildFacts(): string[] {
  return [
    tidy(site.description),
    tidy(site.mostRecentLine),
    `I am based in ${tidy(site.location)}.`,
    tidy(site.availability) + '.',
    'I have three service lanes: voice AI engineering, AI agents and full-stack, and mentorship and speaking.',
    'Mentorship calls are free, thirty minutes, for students and early-career devs building AI. Not paid, just a real call.',
    'Hire me for project work, fractional AI engineering, or a free discovery call.',
  ];
}

function build(): VoiceKb {
  const bio = tidy(
    `I am Neeraj, a full-stack AI engineer based in Delhi, India, working remote or hybrid worldwide. ` +
      `I build production voice agents, agentic backends, and the full-stack systems behind them. ` +
      `Most recently I shipped an enterprise voice AI platform at IntellifyAI at around 1.2 second ` +
      `median full-turn latency, multi-tenant and GDPR-grade. I am open to full-time, fractional, and contract work.`,
  );

  return {
    version: '1',
    generatedAt: new Date().toISOString(),
    bio,
    voiceDisclaimer: 'This is a clone of my voice, and audio is not stored.',
    intros: [
      "Hey, I'm Neeraj. Want a quick tour of my work, or is there something specific you're after?",
      'Hi, this is Neeraj. Curious about my work, looking to hire, or want to book a mentorship call?',
    ],
    sections: SECTIONS,
    routes: ROUTES,
    highlights: buildHighlights(),
    facts: buildFacts(),
  };
}

function assertSafe(kb: VoiceKb): void {
  const problems: string[] = [];
  for (const s of kb.sections) if (!ID_RE.test(s.sectionId)) problems.push(`sectionId ${s.sectionId}`);
  for (const r of kb.routes) if (!PATH_RE.test(r.path)) problems.push(`route ${r.path}`);
  for (const h of kb.highlights) {
    if (!ID_RE.test(h.highlightId)) problems.push(`highlightId ${h.highlightId}`);
    if (!ID_RE.test(h.sectionId)) problems.push(`highlight.sectionId ${h.sectionId}`);
    if (!PATH_RE.test(h.route)) problems.push(`highlight.route ${h.route}`);
  }
  const ids = kb.highlights.map((h) => h.highlightId);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`duplicate highlightIds: ${[...new Set(dupes)].join(', ')}`);
  if (problems.length) {
    throw new Error(`Voice KB failed safety checks:\n  - ${problems.join('\n  - ')}`);
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../../voice-agent/src/portfolio_kb.json');

const kb = build();
assertSafe(kb);
writeFileSync(OUT, JSON.stringify(kb, null, 2) + '\n', 'utf8');
console.log(`Voice KB written: ${OUT} (${kb.highlights.length} highlights, ${kb.sections.length} sections)`);
