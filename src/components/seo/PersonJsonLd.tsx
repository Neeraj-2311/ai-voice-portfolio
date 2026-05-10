import { site } from '@/content/site';

export function PersonJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    jobTitle: site.current.role,
    worksFor: {
      '@type': 'Organization',
      name: site.current.company,
      ...(site.current.companyUrl ? { url: site.current.companyUrl } : {}),
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location,
    },
    sameAs: site.socials
      .filter((s) => s.href.startsWith('http'))
      .map((s) => s.href),
    knowsAbout: [
      'Voice AI',
      'Agentic systems',
      'Full-stack engineering',
      'LiveKit',
      'Azure AI Foundry',
      'RAG',
      'Next.js',
      'FastAPI',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
