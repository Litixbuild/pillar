import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Prevent noisy Windows file events from triggering unnecessary restarts
    config.watchOptions = {
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
      aggregateTimeout: 500,
    };
    return config;
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "font-src 'self' data:",
      "frame-src https: blob: data:",
      "media-src 'self' https: blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    const securityHeaders: Array<{ key: string; value: string }> = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    // CSP and HSTS only in production — dev mode has too many internal
    // Next.js requirements (HMR websockets, eval source maps) to whitelist precisely
    if (isProd) {
      securityHeaders.push(
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }
      );
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
