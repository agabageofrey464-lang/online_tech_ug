"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { whatsappLink } from "@/lib/site";

/**
 * The space beside the page's name, kept for adverts: one strip at a time,
 * each giving way to the next every few seconds.
 *
 * Adverts placed from the dashboard are shown first. Our own follow them — the
 * software we build, the courses, the internship, and the offer of the space
 * itself — so the place is never empty and always moving.
 */

type Advert = { id: number; title: string; advertiser: string; description: string; image_url: string; link_url: string; category: string };
type Strip = { key: string; label: string; title: string; text: string; cta: string; href: string; img?: string; bar: string };

// Only a real web address opens from the button — never an image or upload URL.
const isWebLink = (url: string) => /^https?:\/\//i.test(url) && !/\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(url) && !/\/uploads\/|\/_next\/image/i.test(url);

const HOUSE: Strip[] = [
  { key: "software", label: "💻 Software", title: "We build websites, apps & systems", text: "Designed, built, hosted and looked after for your business.", cta: "Get a quote", href: "/development", img: "/portfolio/online-tech-uganda-1.webp", bar: "bg-[#7a1f5c]" },
  { key: "courses", label: "🎓 Learn Academy", title: "22 computer courses, with a certificate", text: "In class or online, in short lessons. Pay per lesson.", cta: "Browse courses", href: "/learn", img: "/cards/courses/microsoft-office.webp", bar: "bg-[#067a39]" },
  { key: "intern", label: "💼 Internships", title: "Industrial training, on real client work", text: "Online placements for university and college students.", cta: "Apply", href: "/internship", img: "/internship-photo.jpg", bar: "bg-brand-500" },
  { key: "space", label: "📣 Advertise here", title: "Put your business in this space", text: "Seen by everyone who opens the shop. Ask us for the rates.", cta: "Advertise", href: "/advertise", bar: "bg-[#b07a06]" },
];

const STAY = 5000;

export function AdvertStrips({ className = "" }: { className?: string }) {
  const [ads, setAds] = useState<Strip[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    let live = true;
    fetch("/_api/adverts?placement=hero", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Advert[]) => {
        if (!live || !Array.isArray(d)) return;
        setAds(
          d.slice(0, 8).map((a) => ({
            key: `ad-${a.id}`,
            label: `⭐ Sponsored · ${a.advertiser || a.category || "Advert"}`,
            title: a.title,
            text: a.description,
            cta: "Learn more",
            href: isWebLink(a.link_url)
              ? a.link_url
              : whatsappLink(`Hello Online Tech Uganda, I saw the advert "${a.title}" by ${a.advertiser || "an advertiser"} on your site and would like to know more.`),
            img: a.image_url,
            bar: "bg-[#b3122e]",
          })),
        );
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const strips = [...ads, ...HOUSE];
  const n = strips.length;
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % n), STAY);
    return () => clearInterval(t);
  }, [n]);

  const s = strips[i % n];
  const outside = /^https?:/i.test(s.href);
  const inner = (
    <>
      <span className="relative ml-2 block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/80 sm:h-[84px] sm:w-[84px]">
        {s.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-white/70">
            <Megaphone size={34} strokeWidth={1.3} />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 py-3 pr-2 leading-tight">
        <span className="block truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{s.label}</span>
        <span className="mt-1 line-clamp-2 font-display text-[16px] leading-[1.15] sm:text-[19px]">{s.title}</span>
        <span className="mt-1 hidden truncate text-[12.5px] text-white/85 sm:block">{s.text}</span>
      </span>
      <span className="mr-4 shrink-0 rounded-full bg-white px-3.5 py-2.5 sm:mr-5 sm:px-5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-900">{s.cta}</span>
    </>
  );
  // A capsule, not a box: rounded right round, with the picture as a disc at its head.
  const box = `stripes flex h-[88px] items-center gap-3 overflow-hidden rounded-full text-white shadow-[0_10px_26px_-14px_rgba(22,21,29,0.7)] sm:h-[100px] sm:gap-4 ${s.bar}`;

  return (
    <aside aria-label="Adverts" className={className}>
      <div key={s.key} className="strip-rise">
      {outside ? (
        <a href={s.href} target="_blank" rel="noopener sponsored" className={box}>
          {inner}
        </a>
      ) : (
        <Link href={s.href} className={box}>
          {inner}
        </Link>
      )}
      </div>
      {/* One dot per advert; the one on show is the long one. */}
      <div className="mt-2.5 flex justify-center gap-1.5">
        {strips.map((x, k) => (
          <button key={x.key} type="button" onClick={() => setI(k)} aria-label={`Show advert ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i % n ? "w-6 bg-brand-500" : "w-2 bg-ink-700/25"}`} />
        ))}
      </div>
    </aside>
  );
}
