import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Serve modern, much smaller formats (AVIF ~50% smaller than JPEG) and cache
    // the optimized results for 30 days so repeat visits are instant.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.onlinetech.ug" },
    ],
  },
  // Same-origin proxy to the API so the browser never makes a cross-origin
  // request (avoids CORS entirely, in local dev and production).
  async rewrites() {
    return [{ source: "/_api/:path*", destination: `${API_ORIGIN}/api/v1/:path*` }];
  },
  // Friendly aliases so common URLs never 404.
  async redirects() {
    return [{ source: "/vendors", destination: "/sell", permanent: false }];
  },
};

export default nextConfig;
