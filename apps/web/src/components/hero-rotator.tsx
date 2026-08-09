import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck } from "lucide-react";

// Bright, sharp hero photos (people-on-computers + product shots) that scroll
// continuously behind the message, like a marquee.
const IMAGES = [
  "/hero/hero-4.jpg", // office team on computers
  "/hero/hero-1.jpg", // bright laptop on a light desk
  "/hero/hero-5.jpg", // two colleagues, bright office
  "/hero/hero-3.jpg", // tech flat-lay
  "/hero/hero-6.jpg", // team on laptops
];

export function HeroRotator() {
  // Two copies so the marquee loops seamlessly (translate -50% == one full set).
  const loop = [...IMAGES, ...IMAGES];

  return (
    <div className="group/hero relative min-h-[300px] overflow-hidden text-white sm:min-h-[320px] sm:rounded-lg sm:shadow-md sm:ring-1 sm:ring-black/5 lg:h-[400px]">
      {/* Continuously scrolling image band (pauses on hover). */}
      <div className="absolute inset-0 flex w-max animate-hero-marquee group-hover/hero:[animation-play-state:paused]">
        {loop.map((src, idx) => (
          <div key={idx} className="relative h-full w-[58vw] shrink-0 sm:w-[46vw] lg:w-[34vw]">
            <Image
              src={src}
              alt=""
              fill
              priority={idx === 0}
              sizes="(max-width: 640px) 58vw, (max-width: 1024px) 46vw, 34vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Scrim — even base plus a soft centred pool so the message stays readable
          over the moving bright photos, without darkening the whole band. */}
      <div className="absolute inset-0 bg-ink-900/40" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 68% at 50% 48%, rgba(12,10,26,0.62) 0%, rgba(12,10,26,0.16) 55%, transparent 78%)",
        }}
      />

      {/* Static message overlay. */}
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center sm:p-10">
        <div className="mx-auto max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Online Tech Uganda
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.65)] sm:text-4xl">
            Powering Uganda, One Device at a Time
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] sm:text-base">
            Genuine laptops, desktops &amp; accessories — warranty included, countrywide delivery and easy Mobile Money.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link
              href="/shop"
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-600 hover:shadow-brand-900/50"
            >
              Shop now →
            </Link>
            <Link
              href="/learn"
              className="rounded-lg border border-white/40 bg-white/5 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Learn computer skills
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-white/80">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-brand-300" /> Genuine &amp; warranted</span>
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-brand-300" /> Countrywide delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
