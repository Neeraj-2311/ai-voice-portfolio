import type { Metadata } from 'next';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${site.name} handles your data on this site, including the voice tour audio.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <article className="section-y mx-auto w-full max-w-3xl px-4 md:px-6">
      <header>
        <p className="text-accent text-small font-medium uppercase tracking-wide">Legal</p>
        <h1 className="mt-3 text-balance">Privacy policy</h1>
        <p className="text-muted mt-4">Last updated 9 May 2026</p>
      </header>

      <div className="text-fg/95 mt-10 space-y-8 [&_h2]:mt-10 [&_h2]:text-h3 [&_p]:text-pretty [&_p]:text-muted [&_p]:mt-3 [&_a]:text-accent [&_a:hover]:text-accent-hover [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted [&_ul_li]:mt-1.5">
        <section>
          <p>
            This site is a personal portfolio operated by {site.name} ({site.email}). It is not
            a commercial service. The notes below cover what is collected, how it is used,
            and how to ask for it to be deleted.
          </p>
        </section>

        <section>
          <h2>What is collected</h2>
          <ul>
            <li>
              <strong>Contact form submissions.</strong> Name, email, and the body of the
              message you submit, along with the intent (hire / mentorship / speaking / other)
              and any optional fields you fill in.
            </li>
            <li>
              <strong>Booking data.</strong> When you book a call, your name, email, and the
              chosen time slot are processed by Cal.com under their privacy terms.
            </li>
            <li>
              <strong>Aggregate analytics.</strong> If Plausible is configured, page views and
              referrers are recorded without cookies and without personal identifiers.
            </li>
            <li>
              <strong>Theme and text-size preferences.</strong> Stored in cookies and local
              storage on your device only, never sent anywhere.
            </li>
          </ul>
        </section>

        <section>
          <h2>Voice tour and audio</h2>
          <p>
            When the voice tour ships, audio captured during a session is processed in real
            time by LiveKit to power the live conversation. Audio is not retained after the
            session ends unless you explicitly take an action that requires it (for example
            booking a slot or submitting a form). Transcripts of voice sessions, if produced,
            follow the same retention rules as contact form submissions.
          </p>
          <p>
            Microphone access is requested only when you press the voice CTA. Until that
            point, no audio is captured.
          </p>
        </section>

        <section>
          <h2>How the data is used</h2>
          <ul>
            <li>To reply to your message or schedule the booking you requested.</li>
            <li>To improve the site (aggregate metrics only, never tied to identity).</li>
            <li>For nothing else. There is no advertising, no data sale, no profiling.</li>
          </ul>
        </section>

        <section>
          <h2>Third parties</h2>
          <ul>
            <li>
              <strong>Cal.com</strong> for scheduling. Their privacy policy applies to anything
              you submit through their booking form.
            </li>
            <li>
              <strong>Resend</strong> as the email transport that delivers contact form
              submissions to {site.email}.
            </li>
            <li>
              <strong>LiveKit</strong> as the voice transport when the voice tour is enabled.
            </li>
            <li>
              <strong>Vercel</strong> for hosting and serving the site.
            </li>
            <li>
              <strong>Plausible</strong> (optional) for cookieless analytics if enabled in
              the deployment.
            </li>
          </ul>
        </section>

        <section>
          <h2>Retention</h2>
          <p>
            Contact form submissions are retained in the inbox at {site.email} until the
            conversation is over and a reasonable archive period has passed. You can ask
            for your submission to be deleted at any time by emailing the same address.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            If you are in the UK, EEA, or another jurisdiction with similar protections,
            you can request access, correction, or deletion of your data, and you can lodge
            a complaint with your local data protection authority. Email{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a> to make any of these requests.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            This page is updated when the site changes materially. The date at the top of
            the page reflects the latest revision.
          </p>
        </section>
      </div>
    </article>
  );
}
