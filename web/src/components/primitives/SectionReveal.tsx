'use client';

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionRevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  amount?: number;
  delay?: number;
  asContents?: boolean;
}

export function SectionReveal({
  children,
  amount = 0.2,
  delay = 0,
  asContents,
  className,
  ...rest
}: SectionRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    if (asContents) {
      return <>{children}</>;
    }
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
