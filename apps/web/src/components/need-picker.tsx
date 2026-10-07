"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Icon } from "@/components/icon";

export type Need = {
  key: string;
  icon: string;
  label: string;
  /** One sentence: what we do about it. */
  answer: string;
  points: string[];
  cta: string;
  href: string;
  tone: string;
};

/**
 * "What do you need today?" — pick one, and see what we do about it.
 *
 * An About page usually lists what a company does and leaves the reader to
 * work out which part is for them. This turns it round: the visitor says what
 * they came for, and the page answers that one thing — what they get, and the
 * button that takes them there.
 */
export function NeedPicker({ needs }: { needs: Need[] }) {
  const [active, setActive] = useState(needs[0].key);
  const need = needs.find((n) => n.key === active) ?? needs[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-600/10 bg-white shadow-sm">
      <div role="tablist" aria-label="What do you need today?" className="flex gap-2 overflow-x-auto border-b border-ink-600/10 bg-ink-50/60 p-3 no-scrollbar">
        {needs.map((n) => (
          <button
            key={n.key}
            role="tab"
            aria-selected={n.key === active}
            onClick={() => setActive(n.key)}
            className={`press flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
              n.key === active ? `${n.tone} text-white shadow-sm` : "bg-white text-ink-800 ring-1 ring-ink-600/10 hover:ring-brand-300"
            }`}
          >
            <Icon name={n.icon} size={16} />
            {n.label}
          </button>
        ))}
      </div>

      <div key={need.key} role="tabpanel" className="ad-fade grid gap-5 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-display text-xl font-black leading-snug text-ink-900 sm:text-2xl">{need.answer}</p>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {need.points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-ink-700/85">
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={need.href}
          className={`press inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 ${need.tone}`}
        >
          {need.cta} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
