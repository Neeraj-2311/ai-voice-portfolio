import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeScript } from '@/components/layout/ThemeScript';
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
  title: 'Neeraj — Voice AI & Full-Stack Engineer',
  description:
    'Voice AI and full-stack engineer building agentic systems for enterprise. Available for hire, mentorship, and speaking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="bg-bg text-fg flex min-h-full flex-col antialiased">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
