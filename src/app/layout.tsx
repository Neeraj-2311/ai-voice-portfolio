import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';
import { CalProvider } from '@/components/booking/CalProvider';
import { ContactModal } from '@/components/contact/ContactModal';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PlausibleAnalytics } from '@/components/seo/PlausibleAnalytics';
import { VoiceSystem } from '@/components/voice/VoiceSystem';
import { site } from '@/content/site';
import { THEME_STORAGE_KEY, TEXT_SIZE_STORAGE_KEY } from '@/lib/storage-keys';
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
    default: `${site.name} · Full-Stack AI Engineer & Voice AI Developer`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    // Voice AI
    'Voice AI engineer',
    'Voice AI developer',
    'Voice agents',
    'Voice agent developer',
    'Conversational AI engineer',
    'Realtime voice AI',
    'Production voice AI',
    'LiveKit engineer',
    'LiveKit developer',
    'Deepgram',
    'Cartesia',
    'ElevenLabs',
    'Retell AI',
    'STT TTS LLM pipeline',

    // AI / agentic
    'AI engineer',
    'AI developer',
    'Agentic AI engineer',
    'Agentic systems',
    'AI agents',
    'LLM engineer',
    'RAG engineer',
    'Prompt engineering',
    'Azure AI Foundry',
    'OpenAI engineer',

    // Full-stack
    'Full-stack engineer',
    'Full-stack AI engineer',
    'Full-stack developer',
    'TypeScript engineer',
    'Next.js engineer',
    'Node.js engineer',
    'Express engineer',
    'React engineer',
    'Python engineer',
    'FastAPI engineer',

    // Geography & availability
    'AI engineer Delhi',
    'AI engineer India',
    'Voice AI engineer Delhi',
    'Voice AI engineer India',
    'Full-stack engineer Delhi',
    'Full-stack engineer India',
    'Remote AI engineer',
    'Remote full-stack engineer',
    'Hire AI engineer',
    'Fractional AI engineer',
    'Contract AI engineer',

    // Other
    'Mentorship',
    'AI mentorship',
    'Tech speaker',
    'AI speaker',
    'Neeraj AI',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: site.url,
    siteName: site.name,
    title: `${site.name} · Full-Stack AI Engineer & Voice AI Developer`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} · Full-Stack AI Engineer & Voice AI Developer`,
    description: site.description,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_STORAGE_KEY)?.value;
  const textSizeCookie = cookieStore.get(TEXT_SIZE_STORAGE_KEY)?.value;
  const theme = themeCookie === 'light' ? 'light' : 'dark';
  const textSize = textSizeCookie === 'larger' ? 'larger' : 'default';

  return (
    <html
      lang="en"
      data-theme={theme}
      data-text-size={textSize}
      style={{ colorScheme: theme }}
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-fg flex min-h-full flex-col antialiased">
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
        <ScrollToTop />
        <VoiceSystem />
        <ContactModal />
        <CalProvider />
        <PlausibleAnalytics />
      </body>
    </html>
  );
}
