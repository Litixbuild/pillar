import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geometric sans-serif for the mobile webapp.
const montserrat = Montserrat({
  variable: "--font-geo-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});

// Luxury title serif — Cormorant Garamond: ultra-high contrast hairline strokes, editorial elegance.
const cormorant = Cormorant_Garamond({
  variable: "--font-lux-title",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Pillar — Guest Experience for Property Managers",
  description: "Pillar gives rental hosts a branded guest portal, home amenity guides, 24/7 AI concierge & maintenance tools — one QR code scan.",
  icons: {
    icon: '/images/pillarlogowhite.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Synchronously apply saved theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('pillar-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
