'use client';

import { useState } from 'react';

interface CopyPasswordButtonProps {
  password: string;
}

export default function CopyPasswordButton({ password }: CopyPasswordButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg border border-white/25 bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      {copied ? 'Copied!' : 'Tap to Copy'}
    </button>
  );
}
