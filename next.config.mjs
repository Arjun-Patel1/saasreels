/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'api.microlink.io', 'logo.clearbit.com', 'image.pollinations.ai'],
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['node-edge-tts', 'ws', 'bufferutil', 'utf-8-validate'],
  },
};

export default nextConfig;
