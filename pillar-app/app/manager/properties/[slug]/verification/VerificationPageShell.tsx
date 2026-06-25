import type { ReactNode } from 'react';
import ManagerBottomNav from '@/app/manager/ManagerBottomNav';

export default function VerificationPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-5 pb-24 pt-6 sm:px-8">
        {children}
      </div>

      <ManagerBottomNav />
    </div>
  );
}
