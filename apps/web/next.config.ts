import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Webpack config to copy pdf-lib worker files to public if needed
    return config;
  },
};

export default nextConfig;
