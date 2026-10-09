import Image from "next/image";
import Link from "next/link";

/**
 * A photograph the full width of the page with a few words over it: an italic
 * line, a serif headline and one white button. Used between the product rows
 * on the home page, where an offer used to be a coloured strip.
 */
export function FeatureBanner({
  img,
  eyebrow,
  title,
  sub,
  cta,
  href,
  align = "center",
}: {
  img: string;
  eyebrow: string;
  title: string;
  sub?: string;
  cta: string;
  href: string;
  align?: "center" | "left";
}) {
  return (
    <section className="relative -mx-[clamp(1rem,3.5vw,2.5rem)] overflow-hidden md:mx-0">
      <div className="relative min-h-[390px] sm:min-h-[420px]">
        <Image src={img} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink-900/50" />
        <div
          className={`relative z-10 flex min-h-[390px] flex-col justify-center px-6 py-10 text-white sm:min-h-[420px] sm:px-12 ${
            align === "center" ? "items-center text-center" : "items-start text-left"
          }`}
        >
          <p className="font-display text-[19px] italic text-white/95">{eyebrow}</p>
          <h2 className="mt-2 max-w-2xl text-[36px] leading-[1.1] sm:text-[48px]">{title}</h2>
          {sub && <p className="mt-3 max-w-md text-[16px] text-white/95">{sub}</p>}
          <Link
            href={href}
            className="press mt-5 bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-white/90"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
