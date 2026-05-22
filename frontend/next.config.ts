import type { NextConfig } from "next";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  /* config options here */
  allowedDevOrigins: ['procryptic-remi-internidal.ngrok-free.dev'],
};

export default nextConfig;
