import Image from 'next/image';
import Link from 'next/link';
import { footerLinkGroups } from '@/content/nav';
import { site } from '@/content/site';
import { getIcon } from '@/lib/icons';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-line bg-bg border-t"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12 md:px-6 md:py-16">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[2fr_3fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/user.jpg"
                alt={site.name}
                width={44}
                height={44}
                className="border-line h-11 w-11 shrink-0 rounded-full border object-cover"
              />
              <Link
                href="/"
                className="text-fg hover:text-accent text-h3 font-semibold tracking-tight transition-colors"
              >
                {site.shortName}
              </Link>
            </div>
            <p className="text-muted mt-3 max-w-sm text-small">{site.tagline}</p>
            <ul className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
              {site.socials.map((social) => {
                const Icon = getIcon(social.icon);
                return (
                  <li key={social.href}>
                    <Link
                      href={social.href}
                      aria-label={social.label}
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noreferrer me' : undefined}
                      className="btn-icon border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center justify-center rounded-lg border transition-colors"
                    >
                      {Icon ? (
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true">{social.label[0]}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {footerLinkGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-fg text-small font-medium uppercase tracking-wide">
                  {group.title}
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted hover:text-fg text-small transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-line text-subtle mt-10 flex flex-col gap-2 border-t pt-5 text-small sm:mt-12 sm:pt-6 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {site.name}. Built with Next.js + LiveKit voice AI.
          </p>
          <p>
            <Link href="/privacy" className="hover:text-fg transition-colors">
              Privacy policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
