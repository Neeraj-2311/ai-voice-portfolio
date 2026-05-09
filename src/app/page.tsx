import { CaseStudies } from '@/components/sections/CaseStudies';
import { Demos } from '@/components/sections/Demos';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Skills } from '@/components/sections/Skills';

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Experience />
      <CaseStudies />
      <Demos />
      <Skills />
    </>
  );
}
