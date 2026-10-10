import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import { CopyNumber } from "@/components/copy-number";

/**
 * The Airtel Money mark, drawn here: a red tile with the name in white. It
 * says which network the number is on at a glance; it is not Airtel's own
 * artwork, which is theirs.
 */
export function AirtelMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Airtel Money" className={className}>
      <rect width="64" height="64" rx="14" fill="#E4002B" />
      {/* a ribbon rising left to right, for money on the move */}
      <path d="M12 26c8-12 22-14 30-7 5 4 5 10 0 13-5 3-11 1-11-4 0-4 4-6 8-5" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      <text x="32" y="48" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="12.5" fill="#fff" letterSpacing="0.2">
        airtel
      </text>
      <text x="32" y="58" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="7.5" fill="#fff" opacity="0.92" letterSpacing="1.4">
        MONEY
      </text>
    </svg>
  );
}

const pay = site.payment.momoAlt;

/**
 * Where to send money, said the same way everywhere a price is quoted.
 *
 * One number for everything — an order, a vendor's plan, an advert, a blog
 * post, a course: the shop's Airtel Money line. `purpose` names what is being
 * paid for, so the WhatsApp message a customer sends afterwards says it too.
 */
export function PayPanel({ purpose, amount, className = "" }: { purpose?: string; amount?: string; className?: string }) {
  const message = `Hello ${site.name}, I have paid${amount ? ` ${amount}` : ""}${purpose ? ` for ${purpose}` : ""} by Airtel Money to ${pay.number}. Here is my confirmation.`;
  return (
    <section className={`bg-ink-800 text-white ${className}`} aria-label="How to pay">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">How to pay</p>
          <div className="mt-4 flex items-center gap-4">
            <AirtelMark size={64} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] text-white/70">Airtel Money · pay to</p>
              <p className="whitespace-nowrap font-display text-[30px] leading-none sm:text-[36px]">{pay.number}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-px bg-white/15 text-[13px]">
            <div className="bg-ink-800 py-3 pr-3">
              <dt className="text-white/60">Name you will see</dt>
              <dd className="mt-0.5 font-semibold">{pay.name}</dd>
            </div>
            <div className="bg-ink-800 py-3 pl-4">
              <dt className="text-white/60">Merchant ID</dt>
              <dd className="mt-0.5 font-semibold">{pay.merchantId}</dd>
            </div>
          </dl>
          <CopyNumber number={pay.number} />
        </div>

        <div className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <ol className="space-y-3.5">
            {[
              <>Dial <b>*185#</b> or open the Airtel Money app.</>,
              <>
                Choose to pay a merchant and enter Merchant ID <b>{pay.merchantId}</b> — or send to <b>{pay.number}</b>.
              </>,
              <>
                Enter the amount{amount ? <> (<b>{amount}</b>)</> : ""} and check the name reads <b>{pay.name}</b>.
              </>,
              <>Approve with your PIN, then send us the confirmation message.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-[14px] leading-snug text-white/90">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-brand-500 text-[11px] font-bold text-white">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 bg-brand-500 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600"
            >
              <MessageCircle size={15} /> I have paid — send confirmation
            </a>
            <Link
              href="/pay"
              className="inline-flex flex-1 items-center justify-center border border-white px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-ink-900"
            >
              Record my payment
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-white/60">
            On MTN? Send to {site.payment.momo.number} ({site.payment.momo.name}) and tell us the same way.
          </p>
        </div>
      </div>
    </section>
  );
}

/** The same number as one line, for the foot of every page. */
export function PayStrip() {
  return (
    <div className="bg-ink-800 text-white">
      <div className="container-wide flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:gap-5">
        <AirtelMark size={44} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">Pay us on Airtel Money</p>
          <p className="mt-1 text-[14px] text-white/85">
            <span className="font-display text-[24px] leading-none text-white">{pay.number}</span>
            <span className="mx-2 text-white/40">·</span>
            {pay.name}
            <span className="mx-2 text-white/40">·</span>
            Merchant ID <b className="text-white">{pay.merchantId}</b>
          </p>
          <p className="mt-1 text-[12px] text-white/60">For orders, courses, vendor plans, adverts, blog posts and every other payment.</p>
        </div>
        <Link
          href="/pay"
          className="shrink-0 bg-brand-500 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600"
        >
          How to pay
        </Link>
      </div>
    </div>
  );
}
