import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "media.istockphoto.com",
      },{
        hostname: "res.cloudinary.com",
      }
    ],
  },
};

export default nextConfig;
