import Image from "next/image";
import Link from "next/link";
import { BRANCHES } from "@/lib/branches";

/**
 * "Find a branch" — a band that says how many places there are, over a row of
 * tall photographs of their entrances. Each photo opens the branches page,
 * where the directions and phone number are.
 */
export function BranchShowcase() {
  return (
    <section aria-label="Our branches">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 band-sand px-5 py-6 text-center">
        <p className="font-display text-[22px] italic text-white/90 sm:text-[26px]">{BRANCHES.length} Locations in Kampala</p>
        <p className="font-display text-[24px] sm:text-[30px]">Discover A Branch Near You</p>
        <Link
          href="/stores"
          className="border-white/40 text-[12px] font-bold uppercase tracking-[0.16em] underline underline-offset-4 hover:text-brand-200 sm:border-l sm:pl-8"
        >
          Find your branch
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BRANCHES.map((b) => (
          <Link key={b.name} href="/stores" className="group block bg-[var(--tile)]">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={b.photo}
                alt={`${b.label} — ${b.name}, Kampala`}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className={`object-cover ${b.focus} transition duration-500 group-hover:scale-[1.03]`}
              />
              <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap bg-ink-600 px-6 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white">
                {b.label}
              </span>
            </div>
            <p className="px-4 py-3.5 font-display text-[22px] text-ink-900 group-hover:text-brand-600">{b.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
