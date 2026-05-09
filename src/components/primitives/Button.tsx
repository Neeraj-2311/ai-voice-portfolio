import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface BaseProps {
  variant?: ButtonVariant;
  className?: string;
  /** Optional Lucide icon node placed before the label. */
  leadingIcon?: ReactNode;
  /** Optional Lucide icon node placed after the label (e.g. ArrowRight). */
  trailingIcon?: ReactNode;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href'> & {
    href: string;
    /** Forces an external <a> with target="_blank" + rel="noreferrer". */
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function variantClasses(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return 'btn-primary bg-accent text-accent-fg hover:bg-accent-hover focus-visible:bg-accent-hover';
    case 'secondary':
      return 'btn-secondary border-line text-fg hover:border-line-strong hover:text-accent border';
    case 'ghost':
      return 'btn-secondary text-fg hover:text-accent';
  }
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

/**
 * Button primitive. Renders a <button> by default; if `href` is provided
 * renders a Next.js <Link> (or a raw <a> for external) with identical
 * styling. Sizing/padding comes from the btn-primary / btn-secondary CSS
 * utilities so default vs. larger text-size both work automatically.
 *
 * Disabled state is signalled via opacity + cursor-not-allowed AND
 * aria-disabled — never color alone.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', className, leadingIcon, trailingIcon, children } = props;
  const cls = [baseClasses, variantClasses(variant), className ?? ''].filter(Boolean).join(' ');

  const content = (
    <>
      {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
    </>
  );

  if ('href' in props && props.href !== undefined) {
    const { href, external, leadingIcon: _li, trailingIcon: _ti, variant: _v, className: _c, children: _ch, ...rest } =
      props;
    void _li; void _ti; void _v; void _c; void _ch;
    if (external || /^https?:\/\//.test(href)) {
      return (
        <a
          {...rest}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cls}
        >
          {content}
        </a>
      );
    }
    return (
      <Link {...rest} href={href} className={cls}>
        {content}
      </Link>
    );
  }

  const { leadingIcon: _li, trailingIcon: _ti, variant: _v, className: _c, children: _ch, type = 'button', ...rest } =
    props;
  void _li; void _ti; void _v; void _c; void _ch;
  return (
    <button {...rest} type={type} className={cls}>
      {content}
    </button>
  );
}
