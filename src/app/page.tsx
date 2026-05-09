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

export default function Home() {
  return (
    <>
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
