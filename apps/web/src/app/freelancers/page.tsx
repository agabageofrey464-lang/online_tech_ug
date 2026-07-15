"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, MapPin, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

const waFromPhone = (p: string) => `https://wa.me/${p.replace(/\D/g, "").replace(/^0/, "256")}`;

type Freelancer = {
  id: number;
  name: string;
  title: string;
  skills: string[];
  bio: string;
  rate: string;
  location: string;
  phone: string;
  email: string;
  portfolio_url: string;
  image_url: string;
};

export default function FreelancersPage() {
  const [list, setList] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/_api/careers/freelancers", { cache: "no-store" });
      if (res.ok) setList(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Freelancers" }]}
        eyebrow="Hire talent"
        title="Freelancers Directory"
        subtitle="Find skilled Ugandan freelancers — developers, designers, IT technicians, marketers and more."
      />

      <section className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-700/60">{list.length} freelancer(s) available</p>
          <Link href="/contact?subject=freelancer-listing" className="inline-flex items-center gap-2 rounded-md border border-brand-500 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50">
            Want to be listed? Contact us
          </Link>
        </div>

        {loading ? (
          <p className="py-16 text-center text-ink-700/50">Loading…</p>
        ) : list.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-12 text-center">
            <Briefcase className="mx-auto text-ink-700/30" size={36} />
            <p className="mt-3 font-bold text-ink-800">No freelancers listed yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/60">
              We&apos;re building our verified talent directory. Are you a skilled freelancer?{" "}
              <Link href="/contact?subject=freelancer-listing" className="font-semibold text-brand-600 hover:underline">Contact us to get listed.</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((f) => (
              <div key={f.id} className="flex flex-col rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-lg font-extrabold text-brand-600">
                    {f.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.image_url} alt={f.name} className="h-full w-full object-cover" />
                    ) : (
                      f.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-ink-900">{f.name}</p>
                    <p className="truncate text-sm font-semibold text-brand-600">{f.title}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-700/50"><MapPin size={11} /> {f.location}</p>
                  </div>
                </div>
                {f.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.skills.slice(0, 6).map((s) => (
                      <span key={s} className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-semibold text-ink-700">{s}</span>
                    ))}
                  </div>
                )}
                {f.bio && <p className="clamp-2 mt-2 text-sm text-ink-700/70">{f.bio}</p>}
                {f.rate && <p className="mt-2 text-sm font-bold text-ink-900">{f.rate}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* Hire → straight to the freelancer's own WhatsApp (or email if no phone) */}
                  {f.phone ? (
                    <a
                      href={`${waFromPhone(f.phone)}?text=${encodeURIComponent(`Hi ${f.name}, I found you on Online Tech Uganda and I'd like to hire you.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white hover:brightness-105"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  ) : f.email ? (
                    <a href={`mailto:${f.email}`} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600">Contact</a>
                  ) : null}
                  {f.phone && <a href={`tel:${f.phone}`} className="rounded-md border border-ink-600/20 p-1.5 text-ink-700 hover:bg-ink-50" aria-label="Call"><Phone size={14} /></a>}
                  {f.email && <a href={`mailto:${f.email}`} className="rounded-md border border-ink-600/20 p-1.5 text-ink-700 hover:bg-ink-50" aria-label="Email"><Mail size={14} /></a>}
                  {f.portfolio_url && <a href={f.portfolio_url} target="_blank" rel="noreferrer" className="rounded-md border border-ink-600/20 p-1.5 text-ink-700 hover:bg-ink-50" aria-label="Portfolio"><Globe size={14} /></a>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-card bg-ink-700 p-6 text-center text-white">
          <p className="font-bold">Are you a skilled freelancer?</p>
          <p className="mx-auto mt-1 max-w-lg text-sm text-white/80">
            We personally vet and add freelancers to keep quality high. Send us your details and we&apos;ll get you listed.
          </p>
          <Link href="/contact?subject=freelancer-listing" className="mt-4 inline-block rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
            Contact us to get listed
          </Link>
        </div>
      </section>
    </>
  );
}
