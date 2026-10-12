import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, LayoutDashboard, ShoppingCart, Smartphone } from "lucide-react";
import { caseStudies } from "@/lib/portfolio";
import { SERVICE_FROM } from "@/lib/service-prices";
import { ugx, whatsappLink } from "@/lib/site";

/**
 * "We build software too" — said on the home page, among the products.
 *
 * Someone who comes for a laptop does not go looking for a Software menu, so
 * most visitors never learned that the shop also builds websites and systems.
 * This says it where they already are, and proves it the only way that
 * counts: with pictures of things we built, each a link to its case study,
 * and marked Live where it is on the internet to visit. The figures are the floors the quotations start from.
 */

const WHAT = [
  { icon: Globe, title: "Websites", line: "For a business, school, church or NGO — fast, on your own domain.", from: SERVICE_FROM.website },
  { icon: ShoppingCart, title: "Online shops", line: "Products, cart, Mobile Money and card checkout, and a dashboard to run it.", from: SERVICE_FROM.ecommerce },
  { icon: LayoutDashboard, title: "Business systems", line: "School, POS, inventory and SACCO systems built around how you work.", from: SERVICE_FROM.managementSystem },
  { icon: Smartphone, title: "Mobile apps", line: "Android apps with an admin side, published to the Play Store.", from: SERVICE_FROM.mobileApp },
];

export function SoftwareBand() {
  const work = caseStudies().slice(0, 3);

  return (
    <section aria-label="Software development" className="bg-ink-800 text-white">
      <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:p-12">
        {/* The claim, and what to do about it. */}
        <div className="flex flex-col">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">Software development</p>
          <h2 className="mt-3 text-[30px] leading-[1.08] text-white sm:text-[40px]">
            We don&rsquo;t only sell computers. We build what runs on them.
          </h2>
          <p className="mt-4 font-display text-[19px] leading-[1.5] text-white/85">
            Websites, online shops, business systems and mobile apps — designed, built, hosted and looked after by the
            same team that built this site.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/development"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-brand-600"
            >
              Get a quote <ArrowRight size={14} />
            </Link>
            <a
              href={whatsappLink("Hello Online Tech Uganda 👋 I would like you to build something for me. Here is what I need: ")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center border border-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-ink-900"
            >
              Tell us what you need
            </a>
          </div>
          <p className="mt-6 border-t border-white/15 pt-5 text-[13px] leading-relaxed text-white/65">
            You get a written quotation before any work starts, your own domain and hosting, training for your staff,
            and support after launch.
          </p>
        </div>

        {/* What we build, each with where its price starts. */}
        <div className="grid grid-cols-2 gap-px self-start bg-white/15">
          {WHAT.map((w) => (
            <Link key={w.title} href="/development" className="group flex flex-col bg-ink-800 p-4 transition hover:bg-ink-700 sm:p-6">
              <w.icon size={24} strokeWidth={1.4} className="text-brand-400" />
              <h3 className="mt-3 text-[18px] leading-tight text-white sm:mt-4 sm:text-[22px]">{w.title}</h3>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-snug text-white/70 sm:text-[13.5px] sm:leading-relaxed">{w.line}</p>
              <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/60 sm:mt-4 sm:text-[12px] sm:tracking-[0.12em]">
                From <span className="text-brand-300">{ugx(w.from)}</span>
                <ArrowRight size={12} className="ml-2 inline-block -translate-y-px opacity-0 transition group-hover:opacity-100" />
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* The proof: things we built, as they look today. */}
      {work.length > 0 && (
        <div className="border-t border-white/15 px-6 pb-8 pt-7 sm:px-10 lg:px-12 lg:pb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-[20px] italic text-white/90">Work we have built</p>
            <Link href="/portfolio" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white underline-offset-4 hover:text-brand-300 hover:underline">
              See all our work →
            </Link>
          </div>
          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible">
            {work.map((c) => (
              <Link key={c.slug} href={`/portfolio/${c.slug}`} className="group block w-[78%] shrink-0 snap-start sm:w-auto">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
                  <Image
                    src={c.shots[0]}
                    alt={`${c.title} — built by Online Tech Uganda`}
                    fill
                    sizes="(max-width: 640px) 78vw, 30vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                  {c.demo && (
                    <span className="absolute left-0 top-0 flex items-center gap-1.5 bg-brand-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[17px] leading-tight text-white group-hover:text-brand-300">{c.title}</p>
                <p className="mt-1 text-[12.5px] text-white/60">{c.industry}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
