import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // See apps/web/next.config.ts — a build and `next dev` share .next, so a
  // verification build can take the running dev server down with it.
  distDir: process.env.BUILD_DIR || ".next",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Sent with every response. Nothing on the site is meant to be shown inside
  // another site's frame, and a browser should never guess at a file's type.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
