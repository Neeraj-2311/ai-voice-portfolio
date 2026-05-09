import { CaseStudies } from '@/components/sections/CaseStudies';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Experience />
      <CaseStudies />
    </>
  );
}
