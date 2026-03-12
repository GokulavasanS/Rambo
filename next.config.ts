import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to suppress the warning
  turbopack: {},

  // Keep webpack config for production builds (next build)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'tesseract.js',
        'canvas',
      ];
    }
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    return config;
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
