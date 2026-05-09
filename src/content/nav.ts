import type { NavLink } from '@/types/content';

/**
 * Primary navigation. On the homepage these resolve to smooth-scroll
 * anchors; on standalone routes they navigate to the matching pages.
 * The Contact button is rendered separately by the nav (it opens the
 * Contact Modal rather than navigating).
 */
export const navLinks: NavLink[] = [
  { href: '/#case-studies', label: 'Work', match: '/case-studies' },
  { href: '/mentorship', label: 'Mentorship', match: '/mentorship' },
  { href: '/hire', label: 'Hire', match: '/hire' },
  { href: '/speaking', label: 'Speaking', match: '/speaking' },
];

/** Footer link groups — broader than primary nav. */
export const footerLinkGroups: { title: string; links: NavLink[] }[] = [
  {
    title: 'Sections',
    links: [
      { href: '/#services', label: 'Services' },
      { href: '/#experience', label: 'Experience' },
      { href: '/#case-studies', label: 'Case studies' },
      { href: '/#skills', label: 'Skills' },
    ],
  },
  {
    title: 'Work with me',
    links: [
      { href: '/hire', label: 'Hire' },
      { href: '/mentorship', label: 'Mentorship' },
      { href: '/speaking', label: 'Speaking' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/resume', label: 'Resume' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
];
