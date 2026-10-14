import Link from "next/link";
import { SafeImage } from "@/components/safe-image";
import { listedProducts as products, productImage } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * Fills the filter column below the filters.
 *
 * The filter panel is only as tall as its own content, so on a long results
 * page the rest of that column was just empty background. This puts the space
 * to work with a trending list and two offers, rather than leaving a stripe of
 * flat colour running down the page.
 */
export function SidebarExtras() {
  // Best-rated in-stock items, varied by brand so it isn't five of the same.
  const seen = new Set<string>();
  const trending = [...products]
    .filter((p) => p.inStock !== false)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .filter((p) => {
      if (seen.has(p.brand)) return false;
      seen.add(p.brand);
      return true;
    })
    .slice(0, 5);

  // Each of the three offers is a picture with its words over it: a photograph
  // across the box, the crossing pattern, a large emoji and the button.
  const offer = (o: { href: string; img: string; emoji: string; title: string; line: string; cta: string; bg: string; fade: string }) => (
    <Link key={o.href} href={o.href} className={`stripes group relative flex min-h-[300px] flex-col overflow-hidden rounded-md text-white shadow-sm ${o.bg}`}>
      <span className="relative z-10 block p-5">
        <span aria-hidden className="block text-[34px] leading-none drop-shadow">{o.emoji}</span>
        <span className="mt-3 block font-display text-[24px] leading-tight">{o.title}</span>
        <span className="mt-1 block text-[14px] text-white/90">{o.line}</span>
        <span className="mt-4 inline-block rounded-full bg-white px-4 py-1.5 text-[12.5px] font-bold text-ink-900 transition group-hover:bg-ink-900 group-hover:text-white">{o.cta}</span>
      </span>
      {/* The photograph fills the lower part, fading up into the colour. */}
      <span className="relative mt-auto block h-[150px] overflow-hidden">
        <SafeImage src={o.img} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.06]" />
        <span className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${o.fade} to-transparent`} />
      </span>
    </Link>
  );

  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {offer({ href: "/find", img: "/web/photo-1496181133206-80ce9b88a853.webp", emoji: "🔎", title: "Not sure what to buy?", line: "Tell us your budget — we'll show what genuinely fits.", cta: "Find my laptop →", bg: "bg-brand-500", fade: "from-brand-500" })}

      {/* Trending: the list, with the top one's photograph as a header. */}
      <div className="overflow-hidden rounded-md bg-white shadow-sm">
        <div className="stripes flex items-center gap-2 bg-[#b07a06] px-4 py-3 text-white">
          <span aria-hidden className="text-[20px]">🔥</span>
          <span className="font-display text-[20px] leading-none">Trending now</span>
        </div>
        <ul className="space-y-2.5 p-4">
          {trending.map((p, i) => (
            <li key={p.id}>
              <Link href={`/shop/${p.id}`} className="group flex items-center gap-2.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${i === 0 ? "bg-brand-500" : i === 1 ? "bg-[#b07a06]" : "bg-ink-600/40"}`}>
                  {i + 1}
                </span>
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-ink-50">
                  <SafeImage src={productImage(p)} alt={p.name} fill sizes="44px" className="object-contain p-0.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="clamp-2 block text-[12px] leading-snug text-ink-800 group-hover:text-brand-600">{p.name}</span>
                  <span className="block text-[12px] font-bold text-ink-900">{ugx(p.price)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {offer({ href: "/learn", img: "/web/photo-1509062522246-3755977927d7.webp", emoji: "🎓", title: "Learn computer skills", line: "22 courses, physical or online, with a certificate.", cta: "Browse courses →", bg: "bg-green-600", fade: "from-green-600" })}
      {offer({ href: "/services#repairs-support", img: "/hero/hero-5.webp", emoji: "🛠️", title: "Laptop not working?", line: "Free diagnosis, repairs from UGX 30,000.", cta: "Book a repair →", bg: "bg-[#7a1f5c]", fade: "from-[#7a1f5c]" })}
    </div>
  );
}
