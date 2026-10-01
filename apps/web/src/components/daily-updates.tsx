"use client";

import { useState } from "react";
import { BellRing, Check, GraduationCap, Laptop, Loader2 } from "lucide-react";

/**
 * The standing offer: tell us your email, hear what is new.
 *
 * The only place to sign up was a box in the footer whose copy said "deals,
 * new arrivals & tech tips" — which tells a visitor nothing about how often
 * they will be written to, or what about. Most people never scrolled to it.
 *
 * It says plainly what the digest actually does, including the part most
 * sites leave out: nothing is sent on a day with nothing to say. Promising a
 * daily email and then sending one with no news in it is how a list turns
 * into a spam folder, and the sending side genuinely works that way, so the
 * promise here matches it.
 */
export function DailyUpdates() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/_api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "home-daily" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
        setMsg("You're on the list. The next update comes the day something new lands.");
        setEmail("");
      } else {
        setState("error");
        setMsg(data?.detail || "Couldn't sign you up. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network problem — please try again.");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-ink-700 via-ink-600 to-brand-600 text-white shadow-md ring-1 ring-black/5">
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 22px)",
        }}
      />
      <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/70 sm:text-[11px]">
            <BellRing size={15} className="text-[#FCDC04]" />
            Daily updates
          </p>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight drop-shadow-sm sm:text-3xl">
            Know what&apos;s new, <span className="text-[#FCDC04]">the day it lands</span>
          </h2>
          <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/85">
            One email with the machines that came in, the courses opening, and the intakes
            about to start. Sent the day there is something new — and nothing at all on the
            days there isn&apos;t.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold ring-1 ring-white/20">
              <Laptop size={13} className="text-[#FCDC04]" /> New arrivals &amp; price drops
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold ring-1 ring-white/20">
              <GraduationCap size={13} className="text-[#FCDC04]" /> Courses &amp; intake dates
            </span>
          </div>
        </div>

        <div>
          {state === "done" ? (
            <div className="flex items-start gap-3 rounded-xl bg-white/15 p-4 ring-1 ring-white/25">
              <Check size={20} className="mt-0.5 shrink-0 text-[#FCDC04]" />
              <p className="text-[14px] font-semibold leading-relaxed">{msg}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address for daily updates"
                className="min-w-0 flex-1 rounded-lg border border-white/25 bg-white/95 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-700/45 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FCDC04] px-6 py-3 text-sm font-black text-ink-900 shadow-sm transition hover:brightness-105 disabled:opacity-60"
              >
                {state === "sending" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Signing up…
                  </>
                ) : (
                  "Keep me posted"
                )}
              </button>
            </form>
          )}

          {state === "error" && (
            <p className="mt-2 text-[12.5px] font-semibold text-[#FCDC04]">{msg}</p>
          )}

          <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/60">
            Already have an account? You get these already. Unsubscribe from any email, in one
            click.
          </p>
        </div>
      </div>
    </section>
  );
}
