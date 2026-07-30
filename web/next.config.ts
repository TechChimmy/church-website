import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.51", "192.168.0.104", "192.168.0.101", "192.168.0.102"],
  images: {
    unoptimized: process.env.NODE_ENV === "development",
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
      'react$': path.resolve(__dirname, 'src/lib/react-patch.js'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      react: "./src/lib/react-patch.js",
    },
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      return {
        afterFiles: [
          {
            source: "/studio/:path*",
            destination: "http://127.0.0.1:3333/studio/:path*",
          },
        ],
        fallback: [
          {
            source: "/:path*",
            destination: "http://127.0.0.1:3333/:path*",
          },
        ],
      };
    }

    return [
      {
        source: "/studio/:path*",
        destination: "http://127.0.0.1:3333/studio/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
