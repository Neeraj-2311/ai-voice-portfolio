import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

const base =
  'bg-elevated border-line rounded-xl border p-6 md:p-7 transition-colors transition-transform';

const interactiveClasses =
  'hover:border-line-strong hover:-translate-y-0.5 hover:shadow-sm focus-within:border-line-strong';

export function Card({ interactive, className, children, ...rest }: CardProps) {
  const cls = [base, interactive ? interactiveClasses : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['flex items-start gap-3', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={['text-h3 text-fg font-medium', className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['text-muted mt-3 text-body', className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['mt-5 flex items-center gap-3', className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
