import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { site } from '@/content/site';

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="section-y bg-section"
    >
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">Get in touch</p>
          <h2 id="contact-title" className="mt-3 text-balance">
            Tell me what you&apos;re working on.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            Pick a reason and I&apos;ll get the right context up front. Replies usually within
            a few days.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="border-line bg-elevated mt-10 rounded-2xl border p-6 md:mt-14 md:p-8">
            <ContactForm />
          </div>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="text-subtle mt-8 text-center text-small">
            Just want to say hi or share something interesting? My DMs on{' '}
            {site.socials
              .filter((s) => s.icon === 'Linkedin' || s.icon === 'Twitter')
              .map((s, i, arr) => (
                <span key={s.href}>
                  <Link
                    href={s.href}
                    target="_blank"
                    rel="noreferrer me"
                    className="text-fg hover:text-accent underline-offset-4 hover:underline transition-colors"
                  >
                    {s.label}
                  </Link>
                  {i < arr.length - 1 ? ' and ' : ''}
                </span>
              ))}{' '}
            are open.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
