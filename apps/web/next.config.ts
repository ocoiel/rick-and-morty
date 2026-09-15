import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  ...(process.env.BUILD_STANDALONE === 'true' && { output: 'standalone' as const }),
  transpilePackages: ['@zrp/core'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'rickandmortyapi.com', pathname: '/api/character/avatar/**' },
    ],
    minimumCacheTTL: 31_536_000,
    /**
     * A origem serve avatares de 300x300 e limita requisições por janela de
     * tempo. Cada largura pedida é uma busca nova lá, então viewports e DPRs
     * diferentes multiplicavam o tráfego e derrubavam as imagens com 429 —
     * inclusive pedindo w=750, que só faz upscale de uma imagem de 300px.
     * Com uma única variante, cada avatar é buscado uma vez na vida.
     */
    deviceSizes: [320],
    imageSizes: [320],
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query'],
  },
};

export default nextConfig;
