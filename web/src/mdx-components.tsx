import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-12 text-balance" {...props} />,
    h3: (props) => <h3 className="mt-10 text-balance" {...props} />,
    p: (props) => <p className="text-muted mt-4 text-pretty" {...props} />,
    a: (props) => (
      <a className="text-accent hover:text-accent-hover underline-offset-4 hover:underline" {...props} />
    ),
    ul: (props) => <ul className="text-muted mt-4 list-disc space-y-2 pl-5" {...props} />,
    ol: (props) => <ol className="text-muted mt-4 list-decimal space-y-2 pl-5" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="border-accent text-fg my-6 border-l-2 pl-4 italic"
        {...props}
      />
    ),
    code: (props) => (
      <code
        className="bg-elevated text-fg rounded px-1.5 py-0.5 font-mono text-[0.9em]"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="bg-elevated border-line my-6 overflow-x-auto rounded-xl border p-4 font-mono text-small"
        {...props}
      />
    ),
    hr: () => <hr className="border-line my-10" />,
    img: (props) => (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        className="border-line my-8 w-full rounded-xl border"
        loading="lazy"
        {...props}
      />
    ),
    figure: (props) => <figure className="my-8" {...props} />,
    figcaption: (props) => (
      <figcaption className="text-subtle mt-3 text-center text-small" {...props} />
    ),
    ...components,
  };
}
