import Link from "next/link";
import Image from "next/image";
import { services } from "@/lib/data";
import { fallbackImage } from "@/lib/image-fallback";
import { ugx } from "@/lib/site";

/**
 * "Our Services" — a band of colour holding a row of tall photographs, each
 * with the service's name and a line about it underneath. The row scrolls
 * sideways when there are more services than fit.
 *
 * It lives on the Develop Software page, with the rest of the work we do for
 * clients; each photograph opens that service on the Services page.
 */
export function ServicesGrid() {
  return (
    <section aria-label="Our services" className="band-sand py-8 sm:py-10">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[30px] leading-none sm:text-[36px]">Our Services</h2>
          <Link
            href="/services"
            className="shrink-0 border-b border-white/70 pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:border-brand-300 hover:text-brand-200"
          >
            See all
          </Link>
        </div>

        <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-2 no-scrollbar">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services#${s.slug}`}
              className="group w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-2.25rem)/4)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-700">
                <Image
                  src={s.image ?? fallbackImage(s.title)}
                  alt={s.title}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 42vw, 24vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 text-[22px] leading-tight group-hover:text-brand-200">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/80">{s.summary}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">
                {s.startingFrom ? `From ${ugx(s.startingFrom)}` : "Get a quote"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
