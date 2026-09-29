import Link from "next/link";
import { SERVICE_FROM } from "@/lib/service-prices";
import { Check, Star } from "lucide-react";
import { site, whatsappLink, ugx } from "@/lib/site";

export type Plan = {
  name: string;
  price: string;
  per?: string;
  desc: string;
  features: string[];
  popular?: boolean;
};

const sub = (plan: string) =>
  whatsappLink(`Hi ${site.name}! I'd like to subscribe to the "${plan}" plan. Please guide me on payment.`);

// --- Shared plan data (single source of truth, used across category pages) ---
export const vendorPlans: Plan[] = [
  { name: "Vendor Weekly", price: ugx(20000), per: "/week", desc: "Short-term listing — great for trying it out.", features: ["List your products for 7 days", "0% sales commission", "Verified vendor badge", "We publish for you"] },
  { name: "Vendor Monthly", price: ugx(60000), per: "/month", desc: "Flat fee, keep 100% of every sale.", features: ["0% sales commission", "Unlimited product listings", "Verified vendor badge", "Priority support"], popular: true },
  { name: "Vendor Yearly", price: ugx(600000), per: "/year", desc: "2 months free vs monthly.", features: ["Everything in Monthly", "Save ~17%", "Featured vendor slots", "Homepage exposure"] },
];

export const freelancerPlans: Plan[] = [
  { name: "Freelancer Weekly", price: ugx(7000), per: "/week", desc: "Get listed for a week.", features: ["Listed for 7 days", "Contact & hire buttons", "Show your skills & rate", "Portfolio link"] },
  { name: "Freelancer Monthly", price: ugx(20000), per: "/month", desc: "Get listed and receive hire requests.", features: ["Listed in the directory", "Contact & hire buttons", "Show your skills & rate", "Portfolio link"], popular: true },
  { name: "Freelancer Yearly", price: ugx(200000), per: "/year", desc: "Best value — save ~17%.", features: ["Everything in Monthly", "Priority listing", "Featured freelancer badge", "2 months free"] },
];

// Advertising priced by business size — yearly subscriptions.
export const advertPlans: Plan[] = [
  { name: "Weekly Advert", price: ugx(30000), per: "/week", desc: "Run a homepage advert for a week.", features: ["Rotating homepage banner", "Designed & posted by us", "Links to your page", "Runs for 7 days"] },
  { name: "Monthly Advert", price: ugx(100000), per: "/month", desc: "A homepage advert for the whole month.", features: ["Rotating homepage banner", "Featured listing", "Links to your page", "Runs for 30 days"] },
  { name: "Startup / Small Business", price: ugx(250000), per: "/year", desc: "For shops, startups & small businesses.", features: ["Rotating homepage banner", "Featured listing", "Links to your page", "Quarterly performance report"] },
  { name: "Company / SME", price: ugx(700000), per: "/year", desc: "For established companies & brands.", features: ["Prime homepage banner", "Featured across categories", "2 sponsored articles + socials", "Priority placement"], popular: true },
  { name: "Institution / Corporate", price: ugx(1500000), per: "/year", desc: "For schools, universities, banks & large institutions.", features: ["Homepage hero + all placements", "Year-round featured branding", "Monthly sponsored content", "Dedicated account manager"] },
];

export const contentPlans: Plan[] = [
  { name: "Sponsored Blog Post", price: ugx(20000), per: "/post", desc: "A promotional article about your business.", features: ["Published on our blog", "Shared on our socials", "Stays permanently", "Image + links"] },
  { name: "News Feature", price: ugx(50000), per: "/feature", desc: "Announce your news or event to our readers.", features: ["Featured on the News page", "Headline + image", "Social share", "Homepage headline slot"] },
];

// Per-post charges — you pay once, our team designs & publishes it for you.
// (Edit the amounts here anytime — it's the single source of truth.)
export const postingCharges: Plan[] = [
  { name: "Homepage Advert", price: ugx(30000), per: "/post", desc: "A rotating banner advert on the homepage.", features: ["Designed & posted by our team", "Seen by every visitor", "Links to your page", "Runs for 30 days"], popular: true },
  { name: "Marketplace Product", price: ugx(20000), per: "/product", desc: "List one product on the marketplace.", features: ["We design the listing", "Photo, price & details", "Add-to-cart enabled", "Shown in its category"] },
  { name: "Freelancer Listing", price: ugx(20000), per: "/listing", desc: "Get listed in the freelancers directory.", features: ["Profile with skills & rate", "Hire / call / email buttons", "Portfolio link", "Verified badge"] },
  { name: "Sponsored Blog Post", price: ugx(20000), per: "/post", desc: "A promotional article on our blog.", features: ["Published on our blog", "Shared on our socials", "Stays permanently", "Image + links"] },
  { name: "News Feature", price: ugx(50000), per: "/feature", desc: "Announce your news or event.", features: ["Featured on the News page", "Headline + image", "Social share", "Homepage slot"] },
];

// Software / development services — project-based "from" prices.
export const servicePlans: Plan[] = [
  { name: "Website", price: `From ${ugx(SERVICE_FROM.website)}`, desc: "Business sites, portfolios & landing pages.", features: ["Responsive design", "Up to ~6 pages", "Contact & WhatsApp", "1 year support"], popular: true },
  { name: "E-commerce / Online Shop", price: `From ${ugx(SERVICE_FROM.ecommerce)}`, desc: "Sell online with payments & delivery.", features: ["Product catalog & cart", "Mobile Money / card", "Orders dashboard", "Training included"] },
  { name: "Custom Software / System", price: `From ${ugx(SERVICE_FROM.managementSystem)}`, desc: "Management systems, POS, dashboards.", features: ["Tailored to your workflow", "User accounts & roles", "Reports & analytics", "Deployment & support"] },
  { name: "Mobile App", price: `From ${ugx(SERVICE_FROM.mobileApp)}`, desc: "Android/iOS apps for your business.", features: ["Android & iOS", "Backend & admin", "Play Store publishing", "Maintenance plan"] },
  { name: "Branding & Design", price: `From ${ugx(300000)}`, desc: "Logos, graphics & social media content.", features: ["Logo & brand kit", "Social media designs", "Business cards / flyers", "Revisions included"] },
  { name: "IT Support & Setup", price: `From ${ugx(30000)}`, desc: "Networks, repairs, installations.", features: ["Onsite & remote", "Repairs & upgrades", "Network setup", "Per-visit or contract"] },
];

function PlanCard({ p }: { p: Plan }) {
  return (
    <div className={`relative flex flex-col rounded-card border bg-white p-6 shadow-sm ${p.popular ? "border-brand-400 ring-1 ring-brand-400" : "border-ink-600/10"}`}>
      {p.popular && (
        <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white"><Star size={12} /> Popular</span>
      )}
      <h3 className="text-lg font-extrabold text-ink-900">{p.name}</h3>
      <p className="mt-1 text-sm text-ink-700/65">{p.desc}</p>
      <p className="mt-4">
        <span className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{p.price}</span>
        {p.per && <span className="text-sm text-ink-700/60"> {p.per}</span>}
      </p>
      <ul className="mt-4 flex-1 space-y-2">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-700/80"><Check size={15} className="mt-0.5 shrink-0 text-brand-500" /> {f}</li>
        ))}
      </ul>
      <a href={sub(p.name)} target="_blank" rel="noreferrer" className={`mt-5 rounded-md px-4 py-2.5 text-center text-sm font-bold ${p.popular ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-ink-600/20 text-ink-700 hover:bg-ink-50"}`}>
        Get started
      </a>
    </div>
  );
}

/** Drop-in pricing section for a category page. */
export function PricingSection({ title, subtitle, plans, cols = 3, showPay = true }: { title: string; subtitle?: string; plans: Plan[]; cols?: 2 | 3; showPay?: boolean }) {
  return (
    <section className="mt-4">
      <div className="rounded-card border border-brand-100 bg-brand-50/50 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-700/60">{subtitle}</p>}
        <div className={`mt-6 grid gap-5 ${cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {plans.map((p) => <PlanCard key={p.name} p={p} />)}
        </div>
        {showPay && (
          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-ink-600/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <span className="font-bold text-ink-900">Pay via Mobile Money:</span>{" "}
              <span className="text-ink-700/80">{site.payment.momo.number} ({site.payment.momo.provider}) · {site.payment.momoAlt.number} ({site.payment.momoAlt.provider})</span>
            </div>
            <div className="flex shrink-0 gap-2">
              <a href={sub("a plan (need advice)")} target="_blank" rel="noreferrer" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">Chat to subscribe</a>
              <Link href="/contact" className="rounded-md border border-ink-600/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">Contact</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
