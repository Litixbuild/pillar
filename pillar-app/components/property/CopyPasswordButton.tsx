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
      className="rounded-full border border-[#98C1D9]/20 bg-[#1F2933]/60 px-3.5 py-1.5 text-sm font-medium text-[#98C1D9]/75 transition-all duration-200 hover:border-[#98C1D9]/35 hover:bg-[#1F2933]/80 hover:text-[#98C1D9] focus:outline-none focus:ring-1 focus:ring-[#98C1D9]/20"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
