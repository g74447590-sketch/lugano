import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [320, 480, 640, 800, 1200],
    imageSizes: [64, 104, 128, 208, 256],
  },
};

export default nextConfig;
