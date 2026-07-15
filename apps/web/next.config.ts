import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
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
