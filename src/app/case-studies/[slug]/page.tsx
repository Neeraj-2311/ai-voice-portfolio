import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TechBadge } from '@/components/primitives/TechBadge';
import { caseStudies } from '@/content/case-studies';
import type { ComponentType } from 'react';

const mdxModules: Record<string, () => Promise<{ default: ComponentType }>> = {
  'talk-to-my-portfolio': () => import('@/content/case-studies/talk-to-my-portfolio.mdx'),
  'enterprise-voice-ai': () => import('@/content/case-studies/enterprise-voice-ai.mdx'),
  goreach: () => import('@/content/case-studies/goreach.mdx'),
  'sheets-voice-automation': () =>
    import('@/content/case-studies/sheets-voice-automation.mdx'),
};

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/case-studies/${slug}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) notFound();
  const importer = mdxModules[slug];
  if (!importer) notFound();
  const mod = await importer();
  const Body = mod.default;

  return (
    <article className="bg-bg">
      <div className="section-y mx-auto w-full max-w-3xl px-4 md:px-6">
        <Link
          href="/#case-studies"
          className="text-muted hover:text-fg inline-flex items-center gap-1 text-small transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to case studies
        </Link>

        <header className="mt-8">
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            Case study
          </p>
          <h1 className="mt-3 text-balance">{study.title}</h1>
          <p className="text-muted mt-5 max-w-2xl text-pretty text-h3 font-normal">
            {study.summary}
          </p>

          <div className="border-line mt-8 grid gap-6 rounded-2xl border p-6 sm:grid-cols-2 md:p-8">
            <div>
              <p className="text-subtle text-small font-medium uppercase tracking-wide">
                Headline metric
              </p>
              <p className="text-fg mt-2 text-h1 font-semibold leading-none">
                {study.heroMetric.value}
              </p>
              <p className="text-muted mt-1 text-small">{study.heroMetric.label}</p>
            </div>
            <div>
              <p className="text-subtle text-small font-medium uppercase tracking-wide">
                Stack
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {study.tech.map((t) => (
                  <li key={t}>
                    <TechBadge name={t} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {study.status === 'placeholder' && (
            <p className="text-warning bg-warning/10 border-warning/30 mt-6 rounded-md border px-3 py-2 text-small">
              Write-up in progress. Concrete metrics and the architecture diagram drop in
              soon.
            </p>
          )}
        </header>

        <div className="mt-12">
          <Body />
        </div>
      </div>
    </article>
  );
}
