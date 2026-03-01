import type { NextConfig } from "next";

 


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 如果你使用的是 Next.js 12.3+，推荐使用 remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        port: '',
        pathname: '/**',
      },
      // 如果需要添加其他域名，继续添加
    ],
    // 或者使用旧的 domains 配置（同样有效）
    // domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig;