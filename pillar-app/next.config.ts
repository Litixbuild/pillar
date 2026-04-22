import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Netlify/CI builds should not fail due to local lint config issues.
    // Run `npm run lint` separately when you want lint enforcement.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
