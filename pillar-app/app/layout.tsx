import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat, Cormorant_Garamond } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";
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
    icon: [
      { url: '/images/pillarlogogoogleblack.png', media: '(prefers-color-scheme: light)' },
      { url: '/images/pillarlogowhite.png',       media: '(prefers-color-scheme: dark)'  },
    ],
    shortcut: '/images/pillarlogogoogleblack.png',
    apple: '/images/pillarlogogoogleblack.png',
  },
  openGraph: {
    title: "Pillar — Guest Experience for Property Managers",
    description: "Pillar gives rental hosts a branded guest portal, home amenity guides, 24/7 AI concierge & maintenance tools — one QR code scan.",
    url: 'https://pmpillar.com',
    siteName: 'Pillar',
    images: [{ url: 'https://pmpillar.com/images/pillarlogogoogle.png', width: 512, height: 512, alt: 'Pillar' }],
    type: 'website',
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
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('pillar-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Pillar",
          "url": "https://pmpillar.com",
          "logo": "https://pmpillar.com/images/pillarlogogoogle.png",
        })}} />
      </head>
      <body className="min-h-full flex flex-col">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-K21Y4LBPG9" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-K21Y4LBPG9');
        `}} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
