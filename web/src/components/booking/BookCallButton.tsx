'use client';

import type { ReactNode } from 'react';
import { Button, type ButtonVariant } from '@/components/primitives/Button';
import { useTheme } from '@/lib/theme';

type BookIntent = 'hire' | 'mentor';

const SLUG: Record<BookIntent, string> = {
  hire: 'hire',
  mentor: 'mentor',
};

const VOICE_ACTION: Record<BookIntent, string> = {
  hire: 'open-hire-discovery',
  mentor: 'open-mentorship-booking',
};

interface BookCallButtonProps {
  intent: BookIntent;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function BookCallButton({
  intent,
  children,
  variant = 'primary',
  className,
  leadingIcon,
  trailingIcon,
}: BookCallButtonProps) {
  const { theme } = useTheme();
  const username = process.env.NEXT_PUBLIC_CAL_USERNAME ?? 'hineeraj';
  const calLink = `${username}/${SLUG[intent]}`;

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      data-cal-link={calLink}
      data-cal-config={JSON.stringify({ theme })}
      data-voice-action={VOICE_ACTION[intent]}
    >
      {children}
    </Button>
  );
}
