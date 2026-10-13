"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { site, ugx, whatsappLink } from "@/lib/site";

const POSTER = "/adverts/kiu-internship-nov-dec-2026-v2.jpg";
const STORY = "/adverts/kiu-internship-nov-dec-2026-story-v2.jpg";
/** The intake starts on 1 November; a fortnight in, there is no place left to advertise. */
const UNTIL = "2026-11-15";

/**
 * The November–December internship advert, on the home page.
 *
 * The poster as it is shared on WhatsApp, beside the few facts a student
 * needs and the way to apply. It takes itself down once the intake is under
 * way, so the page never advertises a placement that has already begun.
 */
export function InternshipAdvert() {
  // Shown by default, so the server's copy and the browser's agree; removed
  // in the browser once the date has passed.
  const [over, setOver] = useState(false);
  useEffect(() => setOver(new Date().toISOString().slice(0, 10) > UNTIL), []);
  if (over) return null;

  return (
    <section aria-label="Internship for Kampala International University students" className="overflow-hidden bg-[#067a39] text-white">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Link href="/internship" className="group relative block bg-white">
          <Image
            src={POSTER}
            alt="Internship opportunity for Kampala International University students: 1 November to 18 December 2026, online, UGX 150,000, with Online Tech Uganda"
            width={1080}
            height={1350}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="h-auto w-full transition duration-500 group-hover:scale-[1.01]"
          />
        </Link>

        <div className="flex flex-col justify-center border-l-0 border-t-8 border-brand-500 p-6 sm:p-10 lg:border-l-8 lg:border-t-0 lg:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#fcdc04]">Internship opportunity · KIU students</p>
          <h2 className="mt-3 text-[30px] leading-[1.08] text-white sm:text-[42px]">
            Your November–December internship, <em className="text-[#fcdc04]">secured.</em>
          </h2>
          <p className="mt-4 font-display text-[19px] leading-[1.45] text-white/90">
            A supervised seven-week placement on real client work, done online, with every letter your faculty asks for.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-px bg-white/20 text-[13px]">
            {[
              ["Dates", "1 Nov – 18 Dec 2026"],
              ["Duration", "7 weeks"],
              ["Mode", "100% online"],
              ["Placement fee", ugx(150000)],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#067a39] px-0 py-3 odd:pr-3 even:pl-4">
                <dt className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/65">{k}</dt>
                <dd className="mt-0.5 font-display text-[21px] leading-tight text-white">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/internship"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-brand-600"
            >
              Apply for a place <ArrowRight size={14} />
            </Link>
            <a
              href={whatsappLink(`Hello ${site.name} 👋 I am a KIU student and I would like an internship place from 1 November to 18 December 2026. My course is: `)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center border border-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-[#067a39]"
            >
              Ask on WhatsApp
            </a>
          </div>

          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-white/80">
            <a href={POSTER} download className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-white">
              <Download size={13} /> Save the poster for your group
            </a>
            <a href={STORY} download className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-white">
              <Download size={13} /> Save it for your Status
            </a>
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-white/55">
            {site.name} is an independent IT company. This is our own placement offer and not an official notice of Kampala International University.
          </p>
        </div>
      </div>
    </section>
  );
}
