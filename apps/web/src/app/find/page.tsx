"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, AlertTriangle, MessageCircle, Wallet, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { findLaptops, entryPrice, USE_CASES, type UseCase } from "@/lib/finder";
import { ugx, whatsappLink } from "@/lib/site";

/**
 * "What can I get for my money?"
 *
 * Every other shop makes you browse a grid and work the specs out yourself.
 * People here start from a budget, so this starts there too — and tells the
 * truth when the budget genuinely will not do the job.
 */

const STEPS = [500000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000, 8000000];

export default function FindPage() {
  const [budget, setBudget] = useState(1500000);
  const [use, setUse] = useState<UseCase>("study");

  const matches = useMemo(() => findLaptops(budget, use), [budget, use]);
  const floor = useMemo(() => entryPrice(use), [use]);

  const clean = matches.filter((m) => m.warnings.length === 0);
  const compromises = matches.filter((m) => m.warnings.length > 0);
  const shortBudget = clean.length === 0 && floor > budget;
  const chosen = USE_CASES.find((u) => u.key === use)!;

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Find my laptop" }]} />
      </div>

      <header className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
          <Sparkles size={13} /> Only at Online Tech
        </span>
        <h1 className="mt-2 text-2xl font-black text-ink-900 sm:text-3xl">
          What laptop can I get for my money?
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-700/70">
          Tell us your budget and what you&apos;ll use it for. We&apos;ll show what genuinely fits
          — and say so honestly when it doesn&apos;t.
        </p>
      </header>

      {/* ── Budget ── */}
      <section className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <Wallet size={17} className="text-brand-600" /> My budget
        </label>

        <p className="mt-2 text-3xl font-black text-brand-600">{ugx(budget)}</p>

        <input
          type="range"
          min={500000}
          max={8000000}
          step={100000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-3 w-full accent-[#f15a29]"
          aria-label="Budget in Uganda shillings"
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {STEPS.map((v) => (
            <button
              key={v}
              onClick={() => setBudget(v)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                budget === v
                  ? "bg-brand-500 text-white"
                  : "border border-ink-600/15 text-ink-700 hover:border-brand-400"
              }`}
            >
              {v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}K`}
            </button>
          ))}
        </div>

        {/* ── Use ── */}
        <p className="mt-5 text-sm font-bold text-ink-900">What will you use it for?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {USE_CASES.map((u) => (
            <button
              key={u.key}
              onClick={() => setUse(u.key)}
              className={`rounded-lg border p-3 text-left transition ${
                use === u.key
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                  : "border-ink-600/15 bg-white hover:border-brand-300"
              }`}
            >
              <span className="text-xl" aria-hidden>
                {u.icon}
              </span>
              <p className="mt-1 text-sm font-bold text-ink-900">{u.label}</p>
              <p className="text-[11px] leading-snug text-ink-700/60">{u.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Honest answer when the budget won't do the job ── */}
      {shortBudget && (
        <div className="mt-5 flex items-start gap-3 rounded-card border border-amber-300 bg-amber-50 p-5">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold text-ink-900">
              Honestly, {ugx(budget)} won&apos;t do {chosen.label.toLowerCase()} well
            </p>
            <p className="mt-1 text-sm text-ink-700/75">
              For {chosen.blurb.toLowerCase()} you really want to start around{" "}
              <b className="text-ink-900">{ugx(floor)}</b>. We&apos;d rather tell you that than
              sell you a machine that frustrates you in a month.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setBudget(floor)}
                className="rounded-md bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
              >
                Show me {ugx(floor)} options
              </button>
              <a
                href={whatsappLink(
                  `Hi, my budget is ${ugx(budget)} and I need a laptop for ${chosen.label.toLowerCase()}. What do you advise?`,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-green-600 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-50"
              >
                <MessageCircle size={14} /> Ask us anyway
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Good matches ── */}
      {clean.length > 0 && (
        <section className="mt-7">
          <h2 className="text-lg font-extrabold text-ink-900">
            Good for {chosen.label.toLowerCase()}{" "}
            <span className="text-sm font-semibold text-ink-700/50">({clean.length})</span>
          </h2>
          <p className="text-sm text-ink-700/65">These meet everything the job needs.</p>

          <div className="mt-4 grid-cards gap-3">
            {clean.slice(0, 12).map((m) => (
              <div key={m.product.id} className="flex flex-col">
                <ProductCard product={m.product} />
                <ul className="mt-1 space-y-0.5 px-1">
                  {m.reasons.slice(0, 3).map((r) => (
                    <li key={r} className="flex items-start gap-1 text-[10.5px] text-green-700">
                      <Check size={11} className="mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Works, with a caveat ── */}
      {compromises.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-ink-900">Will work, with a compromise</h2>
          <p className="text-sm text-ink-700/65">
            Within your budget, but something falls short. We&apos;ve said what.
          </p>

          <div className="mt-4 grid-cards gap-3">
            {compromises.slice(0, 8).map((m) => (
              <div key={m.product.id} className="flex flex-col">
                <ProductCard product={m.product} />
                <ul className="mt-1 space-y-0.5 px-1">
                  {m.warnings.slice(0, 2).map((w) => (
                    <li key={w} className="flex items-start gap-1 text-[10.5px] text-amber-700">
                      <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && !shortBudget && (
        <div className="mt-6 rounded-card border border-dashed border-ink-600/15 bg-white px-6 py-12 text-center">
          <p className="font-bold text-ink-900">Nothing in stock at that budget yet</p>
          <p className="mt-1 text-sm text-ink-700/65">
            Tell us what you need and we&apos;ll source it for you.
          </p>
          <a
            href={whatsappLink(`Hi, I'm looking for a laptop around ${ugx(budget)}. Can you source one?`)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
          >
            <MessageCircle size={15} /> Ask us to source it
          </a>
        </div>
      )}

      <div className="mt-8 rounded-card bg-ink-700 p-6 text-center text-white">
        <p className="font-bold">Still not sure?</p>
        <p className="mt-1 text-sm text-white/80">
          Tell us what you do and we&apos;ll recommend honestly — including telling you to spend
          less if that&apos;s the right answer.
        </p>
        <a
          href={whatsappLink("Hi, I need help choosing a laptop. Here's what I'll use it for:")}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
        >
          <MessageCircle size={16} /> Talk to a real person
        </a>
        <p className="mt-4 text-xs text-white/60">
          Buying for a team or a school?{" "}
          <Link href="/contact" className="font-bold text-white underline">
            Ask about bulk pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
