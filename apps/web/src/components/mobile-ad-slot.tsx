"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Code2, GraduationCap, ShoppingBag } from "lucide-react";

/**
 * On a phone: one slim advert under the header, which changes every two hours.
 *
 * A phone's first screen was carrying four bars of offers at once — the
 * internship banner, the festival strip, the slim offer bar and the hero —
 * and between them the shop itself was hard to find. There is one strip above
 * the header now, and this one beneath it. It takes turns between the three
 * things the business does — the shop, the software we build, and the
 * academy's intake — two hours each, so each has the place to itself and none
 * is forgotten.
 *
 * Every turn is one line: an icon, what it is, and a button.
 */

/** The intake starts on 2 November; a fortnight in, there is no place left to announce. */
const INTAKE_UNTIL = "2026-11-15";
const TURN_MS = 2 * 60 * 60 * 1000;

const TURNS = [
  {
    key: "shop",
    icon: ShoppingBag,
    bar: "bg-brand-500",
    button: "bg-white text-ink-900",
    label: "🛒 Shop",
    text: "Phones & laptops, delivered today",
    cta: "Shop now",
    href: "/shop",
  },
  {
    key: "software",
    icon: Code2,
    bar: "bg-[#7a1f5c]",
    button: "bg-brand-500 text-white",
    label: "💻 Software",
    text: "Websites, apps & systems built",
    cta: "Get a quote",
    href: "/development",
  },
  {
    key: "intake",
    icon: GraduationCap,
    bar: "bg-[#067a39]",
    button: "bg-brand-500 text-white",
    label: "💼 Internship",
    text: "Starts 2 Nov · UGX 150,000",
    cta: "Apply",
    href: "/apply",
  },
] as const;

export function MobileAdSlot() {
  // The shop's turn is drawn first, so the server's copy and the browser's
  // agree; the browser then moves to whichever turn the clock has reached.
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    const pick = () => {
      const open = new Date().toISOString().slice(0, 10) <= INTAKE_UNTIL;
      const list = open ? [0, 1, 2] : [0, 1];
      setTurn(list[Math.floor(Date.now() / TURN_MS) % list.length]);
    };
    pick();
    // Looked at again each minute, so a page left open changes on the hour.
    const t = setInterval(pick, 60_000);
    return () => clearInterval(t);
  }, []);

  const a = TURNS[turn];
  return (
    <div className={`stripes lg:hidden ${a.bar} text-white`}>
      <Link href={a.href} className="container-wide flex items-center gap-2.5 py-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
          <a.icon size={15} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[9.5px] font-black uppercase tracking-[0.18em] text-white/75">{a.label}</span>
          <span className="block truncate text-[13px] font-bold">{a.text}</span>
        </span>
        <span className={`shrink-0 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] ${a.button}`}>{a.cta}</span>
      </Link>
    </div>
  );
}
