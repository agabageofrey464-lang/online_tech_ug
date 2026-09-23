import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // See apps/web/next.config.ts — a build and `next dev` share .next, so a
  // verification build can take the running dev server down with it.
  distDir: process.env.BUILD_DIR || ".next",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
