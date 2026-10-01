"use client";

import { useState } from "react";

/** Footer newsletter box — joins the offers/discounts list. */
export function NewsletterSignup() {
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
        body: JSON.stringify({ email: email.trim(), source: "website" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
        setMsg("You're in. The next update comes the day something new lands.");
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
    <div className="text-center sm:text-left">
      {/* Says what arrives and how often. "Deals, new arrivals & tech tips"
          told a visitor neither, and the honest part — that nothing is sent on
          a quiet day — is the part that makes signing up easy. */}
      <p className="text-base font-extrabold text-ink-900">Get the daily update</p>
      <p className="mt-0.5 text-sm text-ink-700/60">
        New machines, new courses and intake dates — emailed the day they land, and not
        at all on the days nothing does.
      </p>
      <form onSubmit={submit} className="mx-auto mt-3 flex max-w-md gap-2 sm:mx-0">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your e-mail address"
          aria-label="Email address"
          className="min-w-0 flex-1 rounded-md border border-ink-600/20 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="press shrink-0 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {state === "sending" ? "…" : "Subscribe"}
        </button>
      </form>
      {msg && (
        <p className={`mt-2 text-xs font-semibold ${state === "done" ? "text-green-600" : "text-red-500"}`}>
          {state === "done" ? "✓ " : ""}
          {msg}
        </p>
      )}
    </div>
  );
}
