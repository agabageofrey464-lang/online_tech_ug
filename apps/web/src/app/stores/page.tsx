import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Navigation, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { share } from "@/lib/seo";
import { BRANCHES, directionsTo } from "@/lib/branches";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = share(
  {
    title: "Our Branches",
    description:
      "Where to find Online Tech Uganda in Kampala — Stagyon, Ivory Plaza and E-Tower — with a photo of each building's entrance so you know the door when you arrive.",
  },
  "/stores",
);

/**
 * The places we trade from, each with a photograph of the entrance.
 *
 * Kampala's arcades hold hundreds of shops behind one doorway, and "we are in
 * Ivory Plaza" gets a customer to the street, not to us. The picture is of the
 * way in, so the last fifty metres are the easy part. Floor and shop numbers
 * are given on the phone — they are not printed here until the owner supplies
 * them, rather than guessed.
 */

const tel = `tel:${site.phoneDisplay.replace(/\s/g, "")}`;

export default function StoresPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Our Branches" }]} />

      <header className="mx-auto mt-8 max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">Kampala</p>
        <h1 className="mt-3 text-[38px] leading-[1.1] text-ink-900 sm:text-[48px]">Our Branches</h1>
        <p className="mt-4 font-display text-[19px] leading-[1.5] text-ink-800">
          Three places in the city where you can see a machine, collect an order or bring one in for repair. The
          photographs show what to look for when you get there.
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {BRANCHES.map((b) => (
          <article key={b.name} className="flex flex-col bg-[var(--tile)]">
            <div className="relative aspect-square overflow-hidden">
              <Image src={b.photo} alt={`${b.label} — ${b.name}, Kampala`} fill sizes="(max-width: 768px) 100vw, 33vw" className={`object-cover ${b.focus}`} />
              <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap bg-ink-600 px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white">
                {b.label}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-[26px] leading-tight text-ink-900">{b.name}</h2>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-700/75">
                <MapPin size={14} strokeWidth={1.5} /> Kampala, Uganda
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-700/85">
                The photograph shows what to look for when you arrive. Call or message before you come and we will tell you the floor
                and shop number, and have what you want ready.
              </p>
              <div className="mt-5 flex gap-2 pt-1">
                <a
                  href={directionsTo(b.map)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 bg-ink-600 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-ink-700"
                >
                  <Navigation size={14} strokeWidth={1.5} /> Directions
                </a>
                <a
                  href={tel}
                  className="flex flex-1 items-center justify-center gap-2 border border-ink-700/30 bg-white px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-900 transition hover:border-ink-900"
                >
                  <Phone size={14} strokeWidth={1.5} /> Call first
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 bg-white px-6 py-8 text-center">
        <h2 className="text-[28px] text-ink-900">Not sure which branch has it?</h2>
        <p className="max-w-xl text-[14px] text-ink-700/80">
          Stock moves between branches. Tell us what you are looking for and we will say where it is today — or
          deliver it to you anywhere in Uganda.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={whatsappLink("Hi, which branch can I find this at?")} target="_blank" rel="noreferrer" className="bg-brand-500 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600">
            Ask on WhatsApp
          </a>
          <a href={tel} className="border border-ink-700/30 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:border-ink-900">
            {site.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
