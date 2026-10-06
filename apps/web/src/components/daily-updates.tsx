"use client";

import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";

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
    // A strip, to match the offers strip higher up the page: what you get on
    // the left, the box to ask for it on the right. As a full panel with a
    // paragraph and two badges it took half a screen to ask for an email.
    <section className="stripes relative overflow-hidden rounded-lg bg-ink-700 text-white shadow-sm">
      <div className="grid items-center gap-3 px-3 py-3.5 sm:px-6 sm:py-4 lg:min-h-[6.5rem] lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/25 sm:h-14 sm:w-14">
            <BellRing size={22} className="text-[#FCDC04]" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-black leading-tight sm:text-2xl">
              Know what&apos;s new, <span className="text-[#FCDC04]">the day it lands</span>
            </h2>
            <p className="mt-0.5 text-xs leading-snug text-white/80 sm:text-[13px]">
              One email with new machines and price drops — and nothing on the days there is no news.
            </p>
          </div>
        </div>

        <div className="min-w-0">
          {state === "done" ? (
            <p className="flex items-start gap-2 rounded-lg bg-white/15 px-3 py-2.5 text-[13px] font-semibold leading-snug ring-1 ring-white/25">
              <Check size={18} className="mt-0.5 shrink-0 text-[#FCDC04]" />
              {msg}
            </p>
          ) : (
            <form onSubmit={submit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address for daily updates"
                className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/95 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/45 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#FCDC04] px-4 py-2.5 text-sm font-black text-ink-900 shadow-sm transition hover:brightness-105 disabled:opacity-60 sm:px-6"
              >
                {state === "sending" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> <span className="hidden sm:inline">Signing up…</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Subscribe</span>
                    <span className="hidden sm:inline">Keep me posted</span>
                  </>
                )}
              </button>
            </form>
          )}
          {state === "error" && <p className="mt-1.5 text-xs font-semibold text-[#FCDC04]">{msg}</p>}
          {state !== "done" && (
            <p className="mt-1.5 px-1 text-[11px] text-white/55">Unsubscribe from any email, in one click.</p>
          )}
        </div>
      </div>
    </section>
  );
}
