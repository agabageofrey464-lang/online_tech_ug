"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/page-header";

// Gradient themes with built-in illustration (blurred blobs + pattern), so an
// advert looks great even without an uploaded image.
const THEMES = [
  { id: "indigo", label: "Indigo", from: "#2e2d38", to: "#5b5a66" },
  { id: "sunset", label: "Sunset", from: "#e0451c", to: "#f4632e" },
  { id: "midnight", label: "Midnight", from: "#16151d", to: "#3a3945" },
  { id: "ember", label: "Ember", from: "#b3340a", to: "#f15a29" },
];

const empty = {
  advertiser: "",
  title: "Your headline goes here",
  description: "A short, punchy line about your offer or business.",
  cta: "Learn more",
  link_url: "",
  image_url: "",
  phone: "",
  email: "",
};

export default function CreateAdvertPage() {
  const [f, setF] = useState(empty);
  const [theme, setTheme] = useState(THEMES[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      // 1) Create the advert as PENDING (hidden until you approve it in admin).
      const res = await fetch("/_api/adverts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          advertiser: f.advertiser,
          description: f.description,
          image_url: f.image_url,
          link_url: f.link_url,
          category: "Business",
        }),
      });
      // 2) Alert the owner by email + dashboard (so it's not missed).
      fetch("/_api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.advertiser || "Advertiser",
          phone: f.phone,
          email: f.email,
          subject: "🆕 New advert submission",
          message:
            `New ADVERT submitted — review & approve in the Adverts tab.\n` +
            `Advertiser: ${f.advertiser}\nHeadline: ${f.title}\nLink: ${f.link_url}\n` +
            `Theme: ${theme.label}\nContact: ${f.phone}${f.email ? " · " + f.email : ""}`,
        }),
      }).catch(() => {});
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const input = "w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (status === "done") {
    return (
      <>
        <PageHeader crumbs={[{ label: "Advertise", href: "/advertise" }, { label: "Create advert" }]} eyebrow="Advertise" title="Advert submitted" />
        <section className="container-page py-14">
          <div className="mx-auto max-w-lg rounded-card border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2 className="mx-auto text-green-600" size={48} />
            <h2 className="mt-3 text-xl font-extrabold text-ink-900">Advert submitted for review!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-700/75">
              Our team will review your advert, arrange payment, and publish it on the homepage. We&apos;ll
              contact you on the details you provided.
            </p>
            <Link href="/advertise" className="mt-5 inline-block rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
              Back to Advertise
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Advertise", href: "/advertise" }, { label: "Create advert" }]}
        eyebrow="Advertise"
        title="Design your advert"
        subtitle="Type your details and watch your advert come to life. Submit it and we'll review, arrange payment and publish it."
      />

      <section className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_1.1fr]">
        {/* Builder form */}
        <form onSubmit={submit} className="order-2 space-y-4 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm lg:order-1">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
            <Megaphone size={18} className="text-brand-500" /> Advert details
          </h2>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Business / advertiser name *</span>
            <input required value={f.advertiser} onChange={(e) => set("advertiser", e.target.value)} className={input} placeholder="e.g. Bright Future Academy" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Headline *</span>
            <input required maxLength={60} value={f.title} onChange={(e) => set("title", e.target.value)} className={input} placeholder="Your main message" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Short description</span>
            <input maxLength={90} value={f.description} onChange={(e) => set("description", e.target.value)} className={input} placeholder="One line about your offer" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">Button text</span>
              <input maxLength={20} value={f.cta} onChange={(e) => set("cta", e.target.value)} className={input} placeholder="Learn more" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">Link (where it goes)</span>
              <input value={f.link_url} onChange={(e) => set("link_url", e.target.value)} className={input} placeholder="https://…" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Background image URL (optional)</span>
            <input value={f.image_url} onChange={(e) => set("image_url", e.target.value)} className={input} placeholder="https://…/photo.jpg" />
          </label>

          {/* Theme picker */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Colour theme</span>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t)}
                  aria-label={t.label}
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${theme.id === t.id ? "ring-ink-900" : "ring-transparent hover:ring-ink-300"}`}
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-ink-600/10 pt-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">Your phone *</span>
              <input required value={f.phone} onChange={(e) => set("phone", e.target.value)} className={input} placeholder="07xx xxx xxx" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink-700">Your email</span>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={input} placeholder="you@example.com" />
            </label>
          </div>

          {status === "error" && <p className="text-sm font-semibold text-red-500">Couldn&apos;t submit. Please try again.</p>}

          <button type="submit" disabled={status === "sending"} className="w-full rounded-md bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
            {status === "sending" ? "Submitting…" : "Submit advert for review"}
          </button>
          <p className="text-center text-[11px] text-ink-700/50">We review every advert before it goes live.</p>
        </form>

        {/* Live preview */}
        <div className="order-1 lg:order-2">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink-700">
            <Sparkles size={15} className="text-brand-500" /> Live preview
          </p>
          <AdvertPreview data={f} theme={theme} />
          <p className="mt-3 text-xs text-ink-700/55">
            This is how your advert appears on the homepage banner. It updates as you type.
          </p>
        </div>
      </section>
    </>
  );
}

function AdvertPreview({ data, theme }: { data: typeof empty; theme: (typeof THEMES)[number] }) {
  return (
    <div
      className="relative h-[150px] overflow-hidden rounded-xl text-white shadow-lg sm:h-[180px]"
      style={{ background: `linear-gradient(120deg, ${theme.from}, ${theme.to})` }}
    >
      {data.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* Illustrations: soft blobs + diagonal texture for depth */}
      <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 16px)" }}
      />
      {data.image_url && <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />}

      <div className="relative flex h-full flex-col justify-center px-5 sm:px-7">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/85 sm:text-[11px]">
          Sponsored{data.advertiser ? ` · ${data.advertiser}` : ""}
        </span>
        <h3 className="mt-1 line-clamp-2 max-w-[80%] text-lg font-extrabold leading-tight drop-shadow-sm sm:text-2xl">
          {data.title || "Your headline goes here"}
        </h3>
        {data.description && (
          <p className="mt-1 line-clamp-1 max-w-md text-xs text-white/85 sm:text-sm">{data.description}</p>
        )}
        <span className="mt-2.5 inline-flex w-fit items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-ink-900 shadow-sm sm:text-sm">
          {data.cta || "Learn more"} <span aria-hidden>→</span>
        </span>
      </div>
    </div>
  );
}
