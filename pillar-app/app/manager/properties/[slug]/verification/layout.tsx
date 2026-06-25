import type { ReactNode } from 'react';
import VerificationPageShell from './VerificationPageShell';

export default function VerificationLayout({ children }: { children: ReactNode }) {
  return <VerificationPageShell>{children}</VerificationPageShell>;
}
