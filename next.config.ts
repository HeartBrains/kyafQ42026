import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  allowedDevOrigins: ["*.us-east-1-01.gitpod.dev"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
