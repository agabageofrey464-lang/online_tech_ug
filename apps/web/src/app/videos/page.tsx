import type { Metadata } from "next";
import Link from "next/link";
import { VideoGrid } from "@/components/video-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Video Showcase — OnlineTech Studio",
  description:
    "Watch product showcases, unboxings and in-store reels from Online Tech Uganda. See the devices in action before you buy.",
};

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-[#100f33] text-white">
      {/* Distinct cinematic branding for the videos side */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#282363] via-[#1b1a4d] to-[#100f33]">
        <div className="container-wide py-10 sm:py-14">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: "Videos" }]} light />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-300">
            ▶ OnlineTech Studio
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Video <span className="text-brand-400">Showcase</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            Real devices in action — unboxings, performance demos and in-store reels.
            Tap any clip to play.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Shop the devices →
            </Link>
            <a
              href={whatsappLink("Hi, I watched your video showcase and I'm interested.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="container-wide py-6 sm:py-8">
        <VideoGrid />
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex items-center justify-center gap-2 py-6 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Online Tech Uganda · OnlineTech Studio</p>
        </div>
      </div>
    </div>
  );
}
