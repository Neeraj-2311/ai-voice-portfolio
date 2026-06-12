import type { Metadata } from 'next';
import { PersonJsonLd } from '@/components/seo/PersonJsonLd';
import { CaseStudies } from '@/components/sections/CaseStudies';
import { Contact } from '@/components/sections/Contact';
import { Demos } from '@/components/sections/Demos';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Hire } from '@/components/sections/Hire';
import { Mentorship } from '@/components/sections/Mentorship';
import { Services } from '@/components/sections/Services';
import { Skills } from '@/components/sections/Skills';
import { Speaking } from '@/components/sections/Speaking';

export const metadata: Metadata = {
  title: 'Neeraj · Full-Stack AI Engineer & Voice AI Developer (Delhi, India)',
  description:
    'Full-stack AI engineer based in Delhi, India. Production voice agents, agentic backends, and Next.js / Node.js / Python systems. Hire, mentor, or invite to speak. Remote or hybrid worldwide.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <PersonJsonLd />
      <Hero />
      <Services />
      <Experience />
      <CaseStudies />
      <Demos />
      <Skills />
      <Mentorship />
      <Speaking />
      <Hire />
      <Contact />
    </>
  );
}
