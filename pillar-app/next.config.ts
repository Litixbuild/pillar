import type { NextConfig } from "next";

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
};

export default nextConfig;
