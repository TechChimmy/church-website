import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ["192.168.1.51", "192.168.0.104", "192.168.0.101", "192.168.0.102"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react$': path.resolve(__dirname, 'lib/react-patch.js'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      react: "./lib/react-patch.js",
    },
  },
  async rewrites() {
    return [
      {
        source: "/studio/:path*",
        destination: "http://localhost:3333/studio/:path*",
      },
    ];
  },
};

export default nextConfig;
