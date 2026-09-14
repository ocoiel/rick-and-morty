import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  ...(process.env.BUILD_STANDALONE === 'true' && { output: 'standalone' as const }),
  transpilePackages: ['@zrp/core'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'rickandmortyapi.com', pathname: '/api/character/avatar/**' },
    ],
    minimumCacheTTL: 31_536_000,
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query'],
  },
};

export default nextConfig;
