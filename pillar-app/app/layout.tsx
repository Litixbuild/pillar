import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Playfair_Display } from "next/font/google";
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

// Luxury title serif.
const playfair = Playfair_Display({
  variable: "--font-lux-title",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pillar - Luxury Property Management Support",
  description: "Luxury property management support services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
