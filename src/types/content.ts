/**
 * Shared content types. All /content/*.ts files conform to these so
 * Phase 2 voice/RAG layer can import structured data without parsing JSX.
 *
 * Conventions:
 *   - `id` is the stable identifier used for `data-highlight-id` and as
 *     the lookup key for the Phase 2 navigation tool.
 *   - `anchor` is the section-level URL fragment (without #).
 *   - Anything still pending real content from Neeraj uses `[TODO: Neeraj]`
 *     as the literal string and is filtered out of UI lists where needed.
 */

export type AnchorId =
  | 'hero'
  | 'services'
  | 'experience'
  | 'case-studies'
  | 'demos'
  | 'skills'
  | 'mentorship'
  | 'speaking'
  | 'hire'
  | 'contact';

export type Intent = 'hire' | 'mentorship' | 'speaking' | 'other';

export interface NavLink {
  /** Anchor (homepage smooth-scroll) or absolute path (separate route). */
  href: string;
  label: string;
  /** Optional path that should mark this link active when the route matches. */
  match?: string;
  /** Optional voice-action hook (Phase 2). */
  voiceAction?: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** Lucide icon name resolved at render time. Avoids importing icon components in content files. */
  icon: 'Github' | 'Linkedin' | 'Twitter' | 'Mail' | 'Phone' | 'Globe';
}

export interface ServiceItem {
  id: string;
  anchor: AnchorId;
  /** Lucide icon name resolved via the icon map at render time. */
  iconName: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  cta?: { label: string; href: string };
}

export interface ExperienceRole {
  id: string;
  anchor: string;
  company: string;
  title: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
  tech: string[];
  keyAchievement?: string;
  url?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  cover: string;
  coverAlt: string;
  heroMetric: { value: string; label: string };
  tech: string[];
  status: 'published' | 'draft' | 'placeholder';
  publishedAt?: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  skills: { name: string; note?: string }[];
}

export interface MentorshipSession {
  id: string;
  title: string;
  durationMinutes: number;
  /** Null when price is still [TODO: Neeraj]. */
  price: string | null;
  audience: string;
  summary: string;
  description: string;
  /** Cal.com event slug, falls back to generic booking link. */
  calEventSlug?: string;
}

export interface SpeakingTopic {
  id: string;
  label: string;
}

export interface SpeakingEvent {
  id: string;
  name: string;
  organizer?: string;
  date?: string;
  format: 'virtual' | 'in-person' | 'hybrid';
  url?: string;
}

export interface HireEngagement {
  id: string;
  title: string;
  summary: string;
  description: string;
  bullets: string[];
  cta: { label: string; href: string; voiceAction?: string };
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  source?: 'mentorship' | 'speaking' | 'hire';
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Resolved at runtime from env, never hardcoded. */
  url: string;
  email: string;
  phone?: string;
  location: string;
  current: { role: string; company: string; companyUrl?: string };
  socials: SocialLink[];
  /** Cal.com booking config. Slugs filled in once Neeraj provides them. */
  cal: {
    username: string | null;
    events: { id: string; eventSlug: string; label: string }[];
  };
}

