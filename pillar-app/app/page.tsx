import type { Metadata } from 'next';
import HomeDarkWrapper from './HomeDarkWrapper';

export const metadata: Metadata = {
  title: 'Pillar — Guest Experience Platform for Rental Hosts',
  description: 'Give your guests a premium experience from the moment they arrive. QR guest portal, 24/7 AI concierge, digital property guides, and work orders — all in one platform. Starting at $14.99/month.',
};

export default function Home() {
  return <HomeDarkWrapper />;
}
