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
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), serial=(), bluetooth=(), payment=(), browsing-topics=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
          // The dashboard holds customers' records. It is no business of a search engine.
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          // Nothing shown here should be kept by a shared computer's browser.
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
