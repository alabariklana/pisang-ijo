/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-markdown', 'remark-gfm'],
  },
  images: {
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
