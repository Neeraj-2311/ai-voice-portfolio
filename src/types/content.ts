/**
 * Shared content types. All /content/*.ts files conform to these so the
 * voice/RAG layer can import structured data without parsing JSX.
 *   - `id` is the stable identifier used for `data-highlight-id` and as
 *     the lookup key for the voice navigation tool.
 *   - `anchor` is the section-level URL fragment (without #).
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
  /** When true, the section component renders this as the asymmetric feature card. */
  featured?: boolean;
  /** Optional proof-pill highlights surfaced on the featured card. */
  highlights?: string[];
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

export interface MentorshipTopic {
  id: string;
  label: string;
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

export interface HireEngagementType {
  id: string;
  title: string;
  description: string;
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
  url: string;
  email: string;
  phone?: string;
  location: string;
  availability: string;
  mostRecentLine: string;
  current: { role: string; company: string; companyUrl?: string };
  socials: SocialLink[];
  cal: {
    username: string | null;
  };
}

