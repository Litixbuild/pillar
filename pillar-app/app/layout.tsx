import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat, Cormorant_Garamond } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Pillar — Guest Experience for Property Managers",
  description: "Pillar gives rental hosts a branded guest portal, home amenity guides, 24/7 AI concierge & maintenance tools — one QR code scan.",
  icons: {
    icon: '/images/pillarlogowhite.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Synchronously apply saved theme + dark background before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var r=document.documentElement;r.style.backgroundColor='#0a0908';if(localStorage.getItem('pillar-theme')==='dark')r.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
