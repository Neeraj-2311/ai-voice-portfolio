import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { ThemeScript } from '@/components/layout/ThemeScript';
import { VoiceCTADock } from '@/components/voice/VoiceCTADock';
import { site } from '@/content/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Voice AI & Full-Stack Engineer`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    'Voice AI',
    'AI agents',
    'agentic systems',
    'full-stack engineer',
    'LiveKit',
    'Azure AI Foundry',
    'RAG',
    'Next.js',
    'mentorship',
    'speaking',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Voice AI & Full-Stack Engineer`,
    description: site.description,
    // OG image generation (next/og) will replace this with a generated route
    // in the SEO step. Leaving the URL static for now keeps social cards
    // working from first deploy.
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — Voice AI & Full-Stack Engineer`,
    description: site.description,
    images: ['/og-default.png'],
  },
  robots: { index: true, follow: true },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-fg flex min-h-full flex-col antialiased">
        <ThemeScript />
        <a
          href="#main-content"
          className="bg-accent text-accent-fg sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <VoiceCTADock />
      </body>
    </html>
  );
}
