/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable static export for Electron to allow API routes for web version
  // Electron will use IPC instead of API routes
  output: undefined,
  // Disable server-side features for Electron build
  ...(process.env.BUILD_TARGET === "electron" && {
    experimental: {
      esmExternals: false,
    },
  }),
};

module.exports = nextConfig;
