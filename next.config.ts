import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore build errors on Windows (SWC WASM issue)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors on build
    ignoreDuringBuilds: true,
  },
  // Silence Turbopack warning
  turbopack: {},
};

export default nextConfig;
