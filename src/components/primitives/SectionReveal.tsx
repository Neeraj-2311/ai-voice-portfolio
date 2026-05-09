'use client';

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionRevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Trigger threshold (fraction of element in viewport). Spec: 0.2. */
  amount?: number;
  /** Optional stagger delay before the reveal kicks off. */
  delay?: number;
  /** Renders inline (display: contents) so layout isn't disturbed. */
  asContents?: boolean;
}

/**
 * Wraps content in a one-shot scroll reveal:
 *   - opacity 0 -> 1
 *   - 12px Y-translate
 *   - 400ms ease-out
 *   - fires once when 20% of the element enters the viewport (spec)
 *
 * Honours prefers-reduced-motion via Framer's useReducedMotion hook —
 * when set, the element renders in its final state with no animation.
 */
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
