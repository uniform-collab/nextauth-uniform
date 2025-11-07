/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "*" }],
  },
  serverExternalPackages: ['openid-client'],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add uniform.server.config.js as an alias for Uniform to resolve
    if (isServer) {
      config.resolve.alias['uniform.server.config'] = require.resolve('./uniform.server.config.js');
    }
    return config;
  },
};

module.exports = nextConfig;

