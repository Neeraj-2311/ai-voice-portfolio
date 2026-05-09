'use client';

import { intentMeta, intents } from '@/lib/intents';
import type { Intent } from '@/types/content';

interface IntentPickerProps {
  value: Intent;
  onChange: (intent: Intent) => void;
  compact?: boolean;
}

export function IntentPicker({ value, onChange, compact }: IntentPickerProps) {
  return (
    <div>
      <fieldset>
        <legend className="text-fg text-small font-medium">I&apos;m reaching out about</legend>
        <div role="radiogroup" aria-label="Reason for contact" className="mt-2 flex flex-wrap gap-2">
          {intents.map((intent) => {
            const active = intent === value;
            const meta = intentMeta[intent];
            return (
              <button
                key={intent}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(intent)}
                className={[
                  'rounded-full border px-4 py-2 text-small transition-colors',
                  active
                    ? 'border-accent bg-accent text-accent-fg font-semibold'
                    : 'border-line text-fg hover:border-line-strong hover:text-accent font-medium',
                ].join(' ')}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      {!compact && (
        <p className="text-subtle mt-2 text-small">{intentMeta[value].description}</p>
      )}
    </div>
  );
}
