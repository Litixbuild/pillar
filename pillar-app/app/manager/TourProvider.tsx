'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TOUR_STEPS, stepMatchesPath, type TourStep } from '@/lib/tourSteps';
import TourPromptModal from './TourPromptModal';
import TourSpotlight from './TourSpotlight';

const STORAGE_KEY = 'pillar_tour_progress';

type StoredProgress = { stepIndex: number; demoSlug: string };

function readStoredProgress(): StoredProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    if (typeof parsed.stepIndex !== 'number' || typeof parsed.demoSlug !== 'string' || !parsed.demoSlug) return null;
    if (parsed.stepIndex < 0 || parsed.stepIndex >= TOUR_STEPS.length) return null;
    return { stepIndex: parsed.stepIndex, demoSlug: parsed.demoSlug };
  } catch {
    return null;
  }
}

function writeStoredProgress(progress: StoredProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable — tour simply won't resume across reloads
  }
}

function clearStoredProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface TourContextValue {
  active: boolean;
  step: TourStep | null;
  busy: boolean;
  advance: () => void;
  exitTour: () => void;
  finishTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  return useContext(TourContext);
}

export default function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [promptOpen, setPromptOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const initialized = useRef(false);

  const isAuthPage = ['/manager/login', '/manager/signup', '/manager/forgot-password', '/manager/reset-password'].some(
    (p) => pathname.startsWith(p)
  );

  useEffect(() => {
    if (initialized.current || isAuthPage) return;
    initialized.current = true;

    fetch('/api/manager/tour')
      .then((r) => r.json())
      .then((data: { status?: string }) => {
        if (data.status === 'pending') {
          setTimeout(() => setPromptOpen(true), 600);
        }
        if (data.status === 'in_progress') {
          const stored = readStoredProgress();
          if (stored) {
            setStepIndex(stored.stepIndex);
            setActive(true);
          } else {
            // Orphaned tour (different device/browser, or cache cleared) — clean up silently.
            void fetch('/api/manager/tour/finish', { method: 'POST' });
          }
        }
      })
      .catch(() => null);
  }, []);

  const startTour = useCallback(() => {
    setBusy(true);
    fetch('/api/manager/tour/start', { method: 'POST' })
      .then((r) => r.json())
      .then((data: { ok?: boolean; slug?: string }) => {
        if (data.ok && data.slug) {
          writeStoredProgress({ stepIndex: 0, demoSlug: data.slug });
          setStepIndex(0);
          setActive(true);
          setPromptOpen(false);
          router.refresh();
        }
      })
      .finally(() => setBusy(false));
  }, [router]);

  const declineTour = useCallback(() => {
    setBusy(true);
    fetch('/api/manager/tour/skip', { method: 'POST' })
      .then(() => setPromptOpen(false))
      .finally(() => setBusy(false));
  }, []);

  const advance = useCallback(() => {
    setStepIndex((i) => {
      const next = Math.min(i + 1, TOUR_STEPS.length - 1);
      const stored = readStoredProgress();
      if (stored) writeStoredProgress({ ...stored, stepIndex: next });
      return next;
    });
  }, []);

  const exitTour = useCallback(() => {
    setBusy(true);
    setActive(false);
    clearStoredProgress();
    fetch('/api/manager/tour/skip', { method: 'POST' })
      .then(() => router.refresh())
      .finally(() => setBusy(false));
  }, [router]);

  const finishTour = useCallback(() => {
    setBusy(true);
    setActive(false);
    clearStoredProgress();
    fetch('/api/manager/tour/finish', { method: 'POST' })
      .then(() => router.refresh())
      .finally(() => setBusy(false));
  }, [router]);

  const step = active ? TOUR_STEPS[stepIndex] ?? null : null;
  const pathReady = step ? stepMatchesPath(step, pathname) : false;

  const contextValue = useMemo<TourContextValue>(
    () => ({ active, step, busy, advance, exitTour, finishTour }),
    [active, step, busy, advance, exitTour, finishTour]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {promptOpen ? <TourPromptModal busy={busy} onStart={startTour} onDecline={declineTour} /> : null}
      {active && step && pathReady ? <TourSpotlight step={step} /> : null}
    </TourContext.Provider>
  );
}
