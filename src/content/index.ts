/**
 * Re-export barrel for content. Components and the Phase 2 RAG layer can
 * import from `@/content` instead of touching individual files.
 */
export { site } from './site';
export { navLinks, footerLinkGroups } from './nav';
export { services } from './services';
export { experience } from './experience';
export { caseStudies } from './case-studies';
export { skillGroups } from './skills';
export {
  mentorshipSessions,
  mentorshipTestimonials,
  mentorshipCredibility,
} from './mentorship';
export { speakingTopics, speakingFormats, pastEvents } from './speaking';
export { hireEngagements, hireTrustLine } from './hire';
