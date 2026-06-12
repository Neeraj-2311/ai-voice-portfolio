import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

export default function NotFound() {
  return (
    <section
      className="bg-bg flex min-h-[70vh] items-center justify-center"
      aria-labelledby="nf-title"
    >
      <div className="section-y mx-auto w-full max-w-xl px-6 text-center">
        <p className="text-accent text-small font-medium uppercase tracking-wide">404</p>
        <h1 id="nf-title" className="mt-3 text-balance">
          That page doesn&apos;t exist.
        </h1>
        <p className="text-muted mt-4 text-pretty">
          The link might be old, the page might have moved, or you might be looking for a
          case study that hasn&apos;t shipped yet. Head back to the homepage or jump straight
          to the work.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary" leadingIcon={<Home className="h-4 w-4" />}>
            Homepage
          </Button>
          <Button
            href="/#case-studies"
            variant="secondary"
            leadingIcon={<ArrowLeft className="h-4 w-4" />}
          >
            See case studies
          </Button>
        </div>
      </div>
    </section>
  );
}
