import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds (optional, but recommended for now)
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
