import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { services } from "@/lib/data";
import { fallbackImage } from "@/lib/image-fallback";
import { ugx } from "@/lib/site";

/**
 * Every service we offer, as a card: a photograph, what it is, and where the
 * price starts. It was a panel on the home page, in the middle of the shop's
 * product rails; it lives on the Develop Software page now, with the rest of
 * the work we do for clients.
 */
export function ServicesGrid() {
  return (
    <div className="grid-cards-fit gap-3">
      {services.map((s) => (
        <Link
          key={s.slug}
          href={`/services#${s.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-600/10 bg-white text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
        >
          {/* Service photo banner with the icon badge */}
          <div className="relative h-24 w-full overflow-hidden bg-ink-50">
            <Image
              src={s.image ?? fallbackImage(s.title)}
              alt={s.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/45 to-transparent" />
            <span className="absolute bottom-2 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-brand-600 shadow-md">
              <Icon name={s.icon} size={18} />
            </span>
          </div>
          <div className="flex flex-col items-center p-3">
            <p className="text-sm font-bold text-ink-900">{s.title}</p>
            <p className="clamp-2 mt-1 text-[11px] leading-snug text-ink-700/60">{s.summary}</p>
            <p className="mt-2 text-[11px] font-bold text-brand-600">
              {s.startingFrom ? `From ${ugx(s.startingFrom)}` : "Get a quote"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
