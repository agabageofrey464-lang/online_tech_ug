"use client";

import Link from "next/link";
import { useEffect } from "react";
import { site, whatsappLink } from "@/lib/site";

/**
 * Shown when a page fails while it is being drawn.
 *
 * Without this a fault anywhere on a page left the visitor with a blank
 * screen and no way on. Here they are told plainly, can try the page again,
 * and can still reach the shop or us.
 */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">Something went wrong</p>
      <h1 className="mt-3 text-[32px] leading-tight text-ink-900 sm:text-[40px]">This page did not load properly</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-700/80">
        It is a fault on our side, not yours, and nothing you entered has been lost. Try it again, or carry on to the shop.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <button onClick={reset} className="bg-brand-500 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-brand-600">
          Try again
        </button>
        <Link href="/shop" className="border border-ink-900 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-ink-900 hover:text-white">
          Go to the shop
        </Link>
      </div>
      <p className="mt-6 text-[13px] text-ink-700/70">
        Still stuck?{" "}
        <a href={whatsappLink(`Hello ${site.name}, a page on your website would not load for me.`)} target="_blank" rel="noreferrer" className="font-bold text-brand-600 underline underline-offset-4">
          Tell us on WhatsApp
        </a>{" "}
        or call {site.phoneDisplay}.
      </p>
    </section>
  );
}
