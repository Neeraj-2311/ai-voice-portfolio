'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X as CloseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { TextSizeToggle } from '@/components/layout/TextSizeToggle';
import { navLinks } from '@/content/nav';
import { site } from '@/content/site';
import { openContactModal } from '@/lib/contact-modal-event';

/**
 * Sticky global navigation. Renders on every route. Spec section 6.1:
 *   - Left: wordmark
 *   - Center: nav links (smooth-scroll on homepage, route on others)
 *   - Right: theme toggle, text-size toggle, primary Contact button
 *   - Mobile: hamburger; Contact button stays visible
 *
 * The Contact button dispatches `open-contact-modal` (handled by the modal
 * mounted lower in the tree) — never scrolls. This keeps the "1 click to
 * contact from anywhere" promise even on case-study sub-pages.
 */
export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile sheet on route change. The set-state-in-effect lint
  // rule flags this, but reacting to a navigation by collapsing the sheet
  // is the canonical use case — there is no parent prop to derive from.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const isActive = (link: { href: string; match?: string }) => {
    if (link.match && pathname.startsWith(link.match)) return true;
    return false;
  };

  return (
    <header
      className="bg-bg/85 border-line sticky top-0 z-40 w-full border-b backdrop-blur-md"
      role="banner"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-6"
      >
        {/* Wordmark */}
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="text-fg hover:text-accent text-h3 font-semibold tracking-tight transition-colors"
        >
          {site.shortName}
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'nav-link text-fg hover:text-accent rounded-md text-small transition-colors',
                    active
                      ? 'text-accent border-accent border-b-2'
                      : 'border-b-2 border-transparent',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <TextSizeToggle />
          <button
            type="button"
            onClick={() => openContactModal()}
            data-voice-action="open-contact-modal"
            className="btn-secondary bg-accent text-accent-fg hover:bg-accent-hover ml-1 hidden items-center justify-center rounded-lg transition-colors md:inline-flex"
          >
            Contact
          </button>

          {/* Mobile menu trigger — hamburger expands the nav, Contact stays
              visible separately so the 1-click-to-contact rule still holds */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="btn-icon border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center justify-center rounded-lg border transition-colors md:hidden"
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile sheet — contains the nav links + a full-width contact CTA. */}
      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          className="border-line bg-bg border-t md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'block w-full rounded-md px-3 py-3 text-body transition-colors',
                      active ? 'text-accent bg-elevated' : 'text-fg hover:bg-elevated',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openContactModal();
                }}
                data-voice-action="open-contact-modal"
                className="btn-primary bg-accent text-accent-fg hover:bg-accent-hover flex w-full items-center justify-center rounded-lg transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
