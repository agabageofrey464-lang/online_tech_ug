"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, GraduationCap, Laptop, MapPin, Users } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { courses, courseTotal, REGISTRATION_FEE } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * The academy, given the room it earns.
 *
 * Training had one rotating slide inside a shared promo carousel, competing
 * with laptop deals for three and a half seconds at a time. It is now the
 * largest thing on the page after the hero: a standing board for the school,
 * with the courses themselves moving through it.
 *
 * The prices are the real programme totals from the course list, so a
 * prospective student is never quoted one figure here and another at
 * registration.
 */

const ROTATE_MS = 2600;
const SHOWN = 4;

const FACTS = [
  { icon: Users, label: "22 courses", sub: "Beginner to advanced" },
  { icon: MapPin, label: "Kampala or online", sub: "Your choice, same tutors" },
  { icon: Award, label: "Certificate", sub: "Issued on completion" },
  { icon: Laptop, label: "Real machines", sub: "Practical from day one" },
];

export function AcademyFestival() {
  const [i, setI] = useState(0);

  // Cheapest first, so the window opens on what most people can afford.
  const featured = [...courses].sort((a, b) => courseTotal(a) - courseTotal(b));

  useEffect(() => {
    if (featured.length <= SHOWN) return;
    const t = setInterval(() => setI((v) => (v + 1) % featured.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [featured.length]);

  const window = Array.from(
    { length: Math.min(SHOWN, featured.length) },
    (_, n) => featured[(i + n) % featured.length],
  );
  const from = Math.min(...featured.map(courseTotal));

  return (
    <section className="overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
      {/* ── The board ───────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-green-700 via-teal-700 to-ink-700 text-white">
        {/* Printed-banner texture, the same device the offer strips use */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 22px)",
          }}
        />
        <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-9">
          {/* Left — what the school is */}
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 sm:text-xs">
              <GraduationCap size={16} className="text-[#FCDC04]" />
              Online Tech Academy
            </p>

            <h2 className="mt-2.5 font-display text-3xl font-black leading-[1.05] drop-shadow-sm sm:text-4xl lg:text-5xl">
              Learn a skill
              <br />
              <span className="text-[#FCDC04]">that pays you back</span>
            </h2>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-[15px]">
              Twenty-two courses taught by people who do the work — computers,
              Microsoft Office, design, networking, accounting and code. Study at our
              Kampala centre or online, and leave with a certificate.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-[#FCDC04] px-4 py-2 text-[13px] font-black uppercase tracking-wide text-ink-900 shadow-sm">
                Full programmes from {ugx(from)}
              </span>
              <span className="rounded-full bg-white/15 px-3.5 py-2 text-[12px] font-bold ring-1 ring-white/25">
                Or single lessons from {ugx(5000)}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/learn"
                className="press inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-black text-ink-900 shadow-sm transition hover:bg-white/90"
              >
                Browse all 22 courses <ArrowRight size={16} />
              </Link>
              <Link
                href="/learn"
                className="press inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-brand-600"
              >
                Register for the next intake
              </Link>
            </div>

            <p className="mt-3 text-[11.5px] text-white/65">
              Registration {ugx(REGISTRATION_FEE)} once, then the training fee for your course.
            </p>
          </div>

          {/* Right — the courses themselves, moving */}
          <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3">
            {window.map((c, n) => (
              <Link
                key={`${i}-${n}`}
                href={`/learn/${c.slug}`}
                className="ad-fade group overflow-hidden rounded-lg bg-white/95 shadow-sm ring-1 ring-white/30 transition hover:ring-2 hover:ring-[#FCDC04]"
              >
                <span className="relative block h-20 w-full overflow-hidden sm:h-24">
                  <SafeImage
                    src={c.cover ?? `/courses/${c.slug}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, 20vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/55 to-transparent" />
                </span>
                <span className="block p-2.5">
                  <span className="line-clamp-2 block text-[12.5px] font-extrabold leading-tight text-ink-900">
                    {c.title}
                  </span>
                  <span className="mt-1 block text-[13px] font-black text-brand-600">
                    {ugx(courseTotal(c))}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-700/55">
                    {c.durationMonths
                      ? `${c.durationMonths} month${c.durationMonths > 1 ? "s" : ""} · ${c.level}`
                      : c.level}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── The facts strip along the foot ──────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-white/10 bg-ink-700 text-white sm:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.label} className="flex items-center gap-2.5 px-3 py-3 sm:px-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#FCDC04]">
              <f.icon size={15} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[12.5px] font-extrabold">{f.label}</span>
              <span className="block truncate text-[10.5px] text-white/60">{f.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
