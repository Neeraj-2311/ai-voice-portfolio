'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';

interface TextFallbackProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function TextFallback({ onSubmit, disabled }: TextFallbackProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask me anything…"
        disabled={disabled}
        className="border-line bg-bg text-fg placeholder:text-subtle focus-visible:border-accent focus-visible:ring-accent/20 hover:border-line-strong h-10 flex-1 rounded-full border px-4 text-small transition-colors focus-visible:outline-none focus-visible:ring-2"
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={disabled || !value.trim()}
        className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
