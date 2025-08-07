import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Only in production build and server-side
    if (!dev && isServer) {
      // Handle Prisma client generation
      config.externals = config.externals || [];
      config.externals.push({
        '@prisma/client': '@prisma/client'
      });
    }
    return config;
  },
};

export default nextConfig;
