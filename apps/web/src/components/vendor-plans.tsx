import { Check, RefreshCw } from "lucide-react";
import { site, ugx, whatsappLink } from "@/lib/site";
import { SECOND_CHANCE, VENDOR_MONTHLY, VENDOR_PLAN_INCLUDES, VENDOR_PLANS } from "@/lib/vendor-plans";

/**
 * The three ways a vendor pays to be listed, and the second chance.
 *
 * Set out like the rest of the shop: square white panels on the page's own
 * ground, the serif for the figure a vendor is looking for, the one in the
 * middle in charcoal, and orange kept for what they press.
 */
export function VendorPlans({ vendor, heading = true }: { vendor?: string; heading?: boolean }) {
  const ask = (plan: string, price: number) =>
    whatsappLink(
      vendor
        ? `Hello ${site.name}, I am the vendor "${vendor}". I would like to pay for the ${plan} plan (${ugx(price)}).`
        : `Hello ${site.name}, I would like to sell on your site on the ${plan} plan (${ugx(price)}). How do I start?`,
    );

  return (
    <section id="plans" className="scroll-mt-44">
      {heading && (
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">Vendor plans</p>
          <h2 className="mt-3 text-[32px] leading-[1.1] text-ink-900 sm:text-[40px]">One price, three ways to pay it</h2>
          <p className="mt-4 font-display text-[19px] leading-[1.5] text-ink-800">
            {ugx(VENDOR_MONTHLY)} a month keeps everything you sell on the site. Pay for a month, half a year or a
            year — we take nothing from a sale on any of them.
          </p>
        </header>
      )}

      <div className={`grid gap-4 md:grid-cols-3 ${heading ? "mt-10" : ""}`}>
        {VENDOR_PLANS.map((p) => {
          const dark = !!p.featured;
          return (
            <div key={p.id} className={`relative flex flex-col p-7 sm:p-8 ${dark ? "bg-ink-800 text-white" : "bg-white text-ink-900"}`}>
              {dark && (
                <span className="absolute right-0 top-0 bg-brand-500 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  Most chosen
                </span>
              )}
              <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? "text-brand-300" : "text-brand-600"}`}>{p.name}</p>
              <p className="mt-4 font-display text-[40px] leading-none sm:text-[44px]">{ugx(p.price)}</p>
              <p className={`mt-2 text-[13px] ${dark ? "text-white/70" : "text-ink-700/70"}`}>
                {p.period}
                {p.months > 1 && <> · {ugx(p.price / p.months)} a month</>}
              </p>
              <p className={`mt-5 font-display text-[18px] italic leading-snug ${dark ? "text-white" : "text-ink-800"}`}>{p.line}</p>

              <ul className={`mt-6 flex-1 space-y-2.5 border-t pt-6 ${dark ? "border-white/15" : "border-ink-600/15"}`}>
                {VENDOR_PLAN_INCLUDES.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-[13.5px] leading-snug ${dark ? "text-white/85" : "text-ink-700/85"}`}>
                    <Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-brand-500" />
                    {f}
                  </li>
                ))}
                <li className={`flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug ${dark ? "text-white" : "text-ink-900"}`}>
                  <RefreshCw size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-brand-500" />
                  No sale? One more month, free
                </li>
              </ul>

              <a
                href={ask(p.name, p.price)}
                target="_blank"
                rel="noreferrer"
                className="mt-7 block bg-brand-500 px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-brand-600"
              >
                Choose {p.name}
              </a>
            </div>
          );
        })}
      </div>

      {/* The second chance, said once and plainly. */}
      <div className="mt-4 flex flex-col gap-4 border-l-4 border-brand-500 bg-white p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink-800 text-white">
          <RefreshCw size={20} strokeWidth={1.5} />
        </span>
        <div>
          <h3 className="text-[22px] leading-tight text-ink-900">No sale? Your products stay.</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-700/85">{SECOND_CHANCE}</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] text-ink-700/70">
        Pay by {site.payment.momo.provider} <b className="text-ink-900">{site.payment.momo.number}</b> or {site.payment.momoAlt.provider}{" "}
        <b className="text-ink-900">{site.payment.momoAlt.number}</b>, then send us the confirmation.
      </p>
    </section>
  );
}
