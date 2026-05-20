import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Next.js 15 specific property
  allowedDevOrigins: ['192.168.100.70', 'localhost:3000']
};

export default nextConfig;
