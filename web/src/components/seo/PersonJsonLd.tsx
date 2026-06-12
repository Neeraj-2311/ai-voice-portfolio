import { site } from '@/content/site';

const ADDRESS_LOCALITY = 'Delhi';
const ADDRESS_REGION = 'Delhi';
const ADDRESS_COUNTRY = 'IN';

/**
 * Escape a JSON payload for safe inline embedding in a <script> tag.
 * Without escaping the `<` character, payload containing the literal
 * `</script>` would terminate the tag early. Static today; defense in depth.
 */
function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function PersonJsonLd() {
  const ogImage = `${site.url.replace(/\/$/, '')}/og-default.png`;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    image: ogImage,
    jobTitle: site.current.role,
    worksFor: {
      '@type': 'Organization',
      name: site.current.company,
      ...(site.current.companyUrl ? { url: site.current.companyUrl } : {}),
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      addressCountry: ADDRESS_COUNTRY,
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

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.shortName,
    url: site.url,
    inLanguage: 'en',
    publisher: { '@type': 'Person', name: site.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonForScript(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonForScript(website) }}
      />
    </>
  );
}
