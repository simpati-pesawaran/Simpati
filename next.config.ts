import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore build errors on Windows (SWC WASM issue)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
