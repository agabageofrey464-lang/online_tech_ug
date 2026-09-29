import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // A production build and `next dev` both write to .next, so running a build
  // while the dev server is up overwrites the chunks it is serving and every
  // page starts returning 500 until it recompiles. Set BUILD_DIR to send a
  // verification build somewhere else and leave the running dev server alone:
  //   BUILD_DIR=.next-verify pnpm build
  // Vercel sets nothing, so deploys still build to .next as usual.
  distDir: process.env.BUILD_DIR || ".next",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Every image is served straight from /public rather than through the
    // optimizer. The optimizer's monthly allowance ran out, and once it does
    // it answers /_next/image with 402 — so every picture the site had not
    // already cached rendered as a broken-image icon, across the whole site.
    //
    // That is safe here because the sources were rebuilt to suit it: all 692
    // files are webp, capped at 1200px, and the folder went from 184MB to
    // 39MB. A phone on mobile data now downloads less than it did through the
    // optimizer, and no picture depends on a paid quota.
    unoptimized: true,
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
    return [
      { source: "/_api/:path*", destination: `${API_ORIGIN}/api/v1/:path*` },

      // Every picture in /public was rebuilt as webp, which changed the file
      // names. Plenty of references live outside this repo and could not be
      // rewritten with it — product rows in the database, campaigns and
      // adverts created in the admin — and they still ask for the old .jpg or
      // .png. These map the old name onto the new file, so nothing that was
      // ever linked goes to a broken image.
      { source: "/products/:name.jpg", destination: "/products/:name.webp" },
      { source: "/products/:name.jpeg", destination: "/products/:name.webp" },
      { source: "/products/:name.png", destination: "/products/:name.webp" },
      { source: "/courses/:name.jpg", destination: "/courses/:name.webp" },
      { source: "/courses/:name.png", destination: "/courses/:name.webp" },
      { source: "/hero/:name.jpg", destination: "/hero/:name.webp" },
      { source: "/hero/:name.png", destination: "/hero/:name.webp" },
      { source: "/web/:name.jpg", destination: "/web/:name.webp" },
      { source: "/web/:name.png", destination: "/web/:name.webp" },
    ];
  },
  // Friendly aliases so common URLs never 404.
  async redirects() {
    return [{ source: "/vendors", destination: "/sell", permanent: false }];
  },
};

export default nextConfig;
