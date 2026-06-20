import TourProvider from './TourProvider';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <TourProvider>{children}</TourProvider>;
}
