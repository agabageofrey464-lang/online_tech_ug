import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Building2, GraduationCap, Store, Users, Check, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { HomeAdverts } from "@/components/home-adverts";
import { site, whatsappLink, ugx } from "@/lib/site";
import { share } from "@/lib/seo";
import { VendorPlans } from "@/components/vendor-plans";

export const metadata: Metadata = share({
  title: "Advertise & Grow With Us",
  description:
    "Advertise your business, school, institution or company on Online Tech Uganda. Banner ads, featured listings, sponsored posts — or sell with a flat monthly subscription instead of commission.",
}, "/advertise");

const audience = [
  { icon: Store, label: "Businesses & Shops" },
  { icon: GraduationCap, label: "Schools & Institutions" },
  { icon: Building2, label: "Companies & Brands" },
  { icon: Users, label: "NGOs & Events" },
];

const adPackages = [
  {
    name: "Homepage Banner",
    price: 150000,
    per: "/month",
    desc: "Your banner on our homepage — seen by every visitor.",
    features: ["Prime homepage slot", "Links to your page/site", "Monthly performance update"],
  },
  {
    name: "Featured Listing",
    price: 80000,
    per: "/month",
    desc: "Get your product or service featured at the top of its category.",
    features: ["Top of category & search", "“Featured” badge", "Priority placement"],
    popular: true,
  },
  {
    name: "Sponsored Post",
    price: 100000,
    per: "/post",
    desc: "A dedicated article about your business on our blog + socials.",
    features: ["Written & published for you", "Shared on our socials", "Stays on the blog"],
  },
];

function reqLink(what: string) {
  return whatsappLink(`Hi ${site.name}! I'd like to advertise on your site — I'm interested in: ${what}. Please share the details.`);
}

type Advert = { id: number; title: string; advertiser: string; description: string; image_url: string; link_url: string; category: string };

async function getAdverts(): Promise<Advert[]> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/adverts`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export const revalidate = 300; // ISR: rebuild every 5 min instead of on every request

export default async function AdvertisePage() {
  const adverts = await getAdverts();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Advertise" }]}
        eyebrow="Advertise & grow"
        title="Put your business in front of our customers"
        subtitle="Put your business, school, institution or company in front of our shoppers and learners across Uganda — with banners, featured listings, sponsored posts, or a simple monthly subscription."
      />

      <section className="container-page py-12">
        {/* Who it's for */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {audience.map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-2 rounded-card border border-ink-600/10 bg-white p-5 text-center shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600"><a.icon size={22} /></span>
              <p className="text-sm font-bold text-ink-800">{a.label}</p>
            </div>
          ))}
        </div>

        {/* Advertise-with-us CTA (admin designs & publishes the advert) */}
        <Link
          href="/contact?subject=advertise"
          className="mt-8 flex items-center justify-between gap-3 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-base font-extrabold text-ink-900">📣 Advertise with us</p>
            <p className="mt-0.5 text-sm text-ink-700/65">Tell us about your business — our team designs and publishes your advert for you.</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white">Contact us →</span>
        </Link>

        {/* Featured advertisers — rotating banner (admin-managed) */}
        {adverts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-ink-900">Featured advertisers</h2>
            <p className="mt-1 text-sm text-ink-700/60">Businesses, schools and institutions advertising with us.</p>
            <div className="mt-6">
              <HomeAdverts />
            </div>
          </div>
        )}

        {/* Advertising packages */}
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
            <Megaphone className="text-brand-500" /> Advertising packages
          </h2>
          <p className="mt-1 text-sm text-ink-700/60">Simple, transparent pricing. Cancel anytime.</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {adPackages.map((p) => (
              <div key={p.name} className={`relative flex flex-col rounded-card border bg-white p-6 shadow-sm ${p.popular ? "border-brand-400 ring-1 ring-brand-400" : "border-ink-600/10"}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
                    <Star size={12} /> Most popular
                  </span>
                )}
                <h3 className="text-lg font-extrabold text-ink-900">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-700/65">{p.desc}</p>
                <p className="mt-4">
                  <span className="text-3xl font-extrabold text-ink-900">{ugx(p.price)}</span>
                  <span className="text-sm text-ink-700/60">{p.per}</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-700/80"><Check size={15} className="shrink-0 text-brand-500" /> {f}</li>
                  ))}
                </ul>
                <a href={reqLink(p.name)} target="_blank" rel="noreferrer" className="mt-5 rounded-md bg-brand-500 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-600">
                  Request this
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor plans */}
        <div className="mt-14">
          <VendorPlans />
        </div>

        {/* Content promotions — pricing lives on the dedicated Pricing page */}
        <Link
          href="/pricing"
          className="mt-12 flex items-center justify-between gap-3 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-extrabold text-ink-900">See advertising & content pricing</p>
            <p className="text-xs text-ink-700/60">Banners, featured slots & sponsored articles — clear plans, all in one place.</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">View pricing →</span>
        </Link>

        {/* CTA */}
        <div className="mt-12 rounded-card bg-ink-700 p-8 text-center text-white">
          <h2 className="text-xl font-extrabold">Ready to advertise with us?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
            Tell us your goal and budget — we&apos;ll recommend the best package and get you live fast.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <a href={reqLink("advertising options")} target="_blank" rel="noreferrer" className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
              Chat on WhatsApp
            </a>
            <a href={`mailto:${site.email}?subject=${encodeURIComponent("Advertising enquiry")}`} className="rounded-md bg-white px-6 py-2.5 text-sm font-bold text-ink-900 hover:bg-white/90">
              Email us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
