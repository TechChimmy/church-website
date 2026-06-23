import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.51"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Supabase Storage public URLs: https://<project-ref>.supabase.co/storage/v1/object/public/cms-images/...
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        // Legacy: existing images uploaded before the Cloudinary → Supabase migration.
        // Safe to remove once all CMS images have been re-uploaded via the new uploader.
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
    ],
  },
};

export default nextConfig;
