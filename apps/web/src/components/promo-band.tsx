import Link from "next/link";

/**
 * The one band directly under the hero: a short label, a line in the serif,
 * and a single button — the shop's standing promise, said once and plainly
 * before the range begins.
 */
export function PromoBand({ eyebrow, title, cta, href }: { eyebrow: string; title: string; cta: string; href: string }) {
  return (
    <section className="bleed-wide bg-ink-800 text-white">
      <div className="container-wide flex flex-col items-center gap-3 py-6 text-center sm:py-7 lg:flex-row lg:justify-center lg:gap-8 lg:text-left">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-300">{eyebrow}</p>
        <p className="font-display text-[23px] leading-tight sm:text-[28px]">{title}</p>
        <Link
          href={href}
          className="shrink-0 rounded-full bg-white px-7 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-brand-500 hover:text-white"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
