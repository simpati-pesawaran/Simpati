import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Webpack for Windows compatibility
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
