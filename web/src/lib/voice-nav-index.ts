/**
 * Transcript-driven navigation index.
 *
 * Instead of the agent calling a scroll tool (which forces a tool round-trip
 * BEFORE it can speak, adding latency), the page follows what the agent is
 * actually saying. As the agent's speech transcript streams in, we match it
 * against distinctive triggers here and scroll + spotlight the matching block in
 * real time. Zero added latency, and it highlights exactly what's being said.
 *
 * Triggers are deliberately distinctive (company / project names, explicit
 * section phrases) to avoid false matches on generic words. Block-level matches
 * (with a highlightId) win over bare section matches.
 */

import { experience } from '@/content/experience';

export interface NavTarget {
  sectionId: string;
  highlightId?: string;
}

/**
 * Each case study describes work done at a company, so naming that company while
 * reading the case-study page is on-topic, the page must NOT bounce to the
 * experience section. Maps a case-study slug to its experience block id.
 */
export const caseStudyHomeCompany: Record<string, string> = {
  'enterprise-voice-ai': 'intellifyai',
  'sheets-voice-automation': 'mindcraft',
};

interface NavEntry {
  triggers: string[];
  target: NavTarget;
}

const ENTRIES: NavEntry[] = [
  // Experience — company names are very distinctive.
  ...experience.map((role) => ({
    triggers: [role.company.toLowerCase(), role.company.toLowerCase().split(' ')[0]],
    target: { sectionId: 'experience', highlightId: role.id },
  })),

  // Case studies — only distinctive PRODUCT names that don't overlap with the
  // experience narration. (The enterprise-voice and sheets-to-call work is also
  // described under IntellifyAI / Mindcraft experience, so a company name beats
  // its own case study on a near-tie (see matchNavTarget) to avoid jumping to a
  // card while narrating experience.)
  { triggers: ['goreach', 'go reach'], target: { sectionId: 'case-studies', highlightId: 'case-goreach' } },
  {
    triggers: ['talk to my portfolio'],
    target: { sectionId: 'case-studies', highlightId: 'case-talk-to-my-portfolio' },
  },
  {
    triggers: ['sheets to call', 'sheet to call', 'sheets automation', 'sheets pipeline', 'spreadsheet'],
    target: { sectionId: 'case-studies', highlightId: 'case-sheets-voice-automation' },
  },
  {
    triggers: ['enterprise voice ai platform', 'enterprise voice platform', 'enterprise voice ai'],
    target: { sectionId: 'case-studies', highlightId: 'case-enterprise-voice-ai' },
  },

  // Explicit section names (a visitor's "show me your X" maps straight here).
  { triggers: ['work experience', 'work history', 'my background', 'roles i', 'my journey'], target: { sectionId: 'experience' } },
  { triggers: ['case stud', 'proof of work', 'projects i'], target: { sectionId: 'case-studies' } },
  {
    triggers: ['skill', 'tech stack', 'my stack', 'the stack', 'stack i use', 'technology', 'languages', 'frameworks', 'ai and ml', 'machine learning', 'llms', 'embeddings', 'i work with', 'i build with', 'tools i use', 'strong in', 'strongest in', 'specialize', 'good with', 'fluent in', 'mostly work'],
    target: { sectionId: 'skills' },
  },
  { triggers: ['mentorship', 'mentor', 'mentoring'], target: { sectionId: 'mentorship' } },
  {
    triggers: ['speaking', 'speak at', 'give talks', 'guest lecture', 'hackathon', 'bootcamp', 'keynote', 'on stage', 'a panel', 'workshop', 'college talk'],
    target: { sectionId: 'speaking' },
  },
  { triggers: ['hire me', 'hiring', 'work with me', 'engagement', 'bring me on'], target: { sectionId: 'hire' } },
  { triggers: ['what i do', 'my services', 'service lane', 'three lanes'], target: { sectionId: 'services' } },
  { triggers: ['contact form', 'get in touch', 'reach out', 'send a message', 'drop me a'], target: { sectionId: 'contact' } },
];

// Topical words that point at a section only as a LAST resort, so an explicit
// section word (e.g. "skills") always wins over an incidental "voice AI" mention.
const TOPICAL: NavEntry[] = [
  { triggers: ['voice ai', 'voice agent', 'agentic'], target: { sectionId: 'services' } },
];

const EXP_BLOCKS = ENTRIES.filter((e) => e.target.highlightId && e.target.sectionId === 'experience');
const CASE_BLOCKS = ENTRIES.filter((e) => e.target.highlightId && e.target.sectionId === 'case-studies');
const SECTIONS = ENTRIES.filter((e) => !e.target.highlightId);

function latestMatch(entries: NavEntry[], text: string): { pos: number; target: NavTarget } | null {
  let best: { pos: number; target: NavTarget } | null = null;
  for (const entry of entries) {
    for (const trig of entry.triggers) {
      const pos = text.lastIndexOf(trig);
      if (pos >= 0 && (!best || pos > best.pos)) best = { pos, target: entry.target };
    }
  }
  return best;
}

/**
 * The block/section the agent is currently talking about, or null.
 *
 * `allowTopical` (default true) lets generic topic words (voice AI, agentic)
 * route to a section. Turn it OFF while the visitor is reading a case-study
 * page, so an incidental "voice agent" mention doesn't yank them back home.
 */
export function matchNavTarget(text: string, allowTopical = true): NavTarget | null {
  // Hyphen/underscore-insensitive: the agent may say "talk-to-my-portfolio".
  const t = text.toLowerCase().replace(/[-_]+/g, ' ');
  const exp = latestMatch(EXP_BLOCKS, t);
  const cs = latestMatch(CASE_BLOCKS, t);
  // A company name beats its own case study on a near-tie, so "at Mindcraft I
  // built the sheets-to-call automation" stays on Mindcraft, while "show me the
  // sheets-to-call case study" (no company) highlights the card.
  let block: { pos: number; target: NavTarget } | null;
  if (exp && cs) block = cs.pos > exp.pos + 30 ? cs : exp;
  else block = exp ?? cs;

  const section = latestMatch(SECTIONS, t);
  // Named block beats a section word on a near-tie ("at IntellifyAI I built
  // voice agents" stays on IntellifyAI), but a section named clearly later wins
  // (a real topic switch like "...now, my speaking"). If the section IS the
  // block's own section ("the sheets-to-call case study"), the block (card) is
  // the more specific target and wins outright.
  let primary: { pos: number; target: NavTarget } | null;
  if (block && section) {
    if (section.target.sectionId === block.target.sectionId) primary = block;
    else primary = section.pos > block.pos + 25 ? section : block;
  } else {
    primary = block ?? section;
  }
  if (primary) return primary.target;
  // Nothing explicitly named: fall back to a topical word (e.g. voice AI).
  return allowTopical ? (latestMatch(TOPICAL, t)?.target ?? null) : null;
}
