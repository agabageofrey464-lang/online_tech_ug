"use client";

import { CheckCircle2, Mail, Phone } from "lucide-react";
import { site } from "@/lib/site";

/**
 * What a client sees after sending us a request.
 *
 * The old version said "we've opened WhatsApp with your request", which was
 * true and useless: it made the client responsible for delivering their own
 * enquiry. This says what we have, what we'll do and by when.
 */
export function RequestSent({
  title,
  reference,
  emailed,
  next,
  onAgain,
  againLabel = "Send another request",
}: {
  title: string;
  reference: string;
  emailed: boolean;
  next: string;
  onAgain?: () => void;
  againLabel?: string;
}) {
  return (
    <div className="rounded-card border border-green-200 bg-white p-7 text-center shadow-sm sm:p-9">
      <CheckCircle2 className="mx-auto text-green-600" size={46} />
      <h2 className="mt-3 text-xl font-black text-ink-900">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-700/75">{next}</p>

      {reference && (
        <div className="mx-auto mt-5 inline-block rounded-xl bg-brand-50 px-6 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700/55">
            Your reference
          </p>
          <p className="text-xl font-black tracking-wide text-brand-700">{reference}</p>
        </div>
      )}

      {emailed && (
        <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-ink-700/70">
          <Mail size={14} className="text-brand-600" />
          We&apos;ve emailed you a copy — check your spam folder if it&apos;s not there.
        </p>
      )}

      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-ink-600/10 pt-4 text-[13px] text-ink-700/65">
        <span className="flex items-center gap-1.5">
          <Phone size={13} className="text-brand-500" /> {site.phoneDisplay}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone size={13} className="text-brand-500" /> {site.phoneAlt}
        </span>
      </p>

      {onAgain && (
        <button
          onClick={onAgain}
          className="press mt-5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          {againLabel}
        </button>
      )}
    </div>
  );
}
