import type { Metadata } from "next";
import { ContactOptions } from "@/components/contact-options";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { OrderTracker } from "@/components/order-tracker";
import { ProjectTracker } from "@/components/project-tracker";
import { whatsappLink } from "@/lib/site";
import { share } from "@/lib/seo";

export const metadata: Metadata = share({
  title: "Track Your Project",
  description:
    "Track your website, mobile app or software project with Online Tech Uganda using your project code — or start a new project and choose the option that fits your budget.",
}, "/track");

const steps = [
  { n: 1, icon: "📝", title: "Request", text: "Tell us what you need — website, app, system or IT support." },
  { n: 2, icon: "🔑", title: "Get your code", text: "We send a project code (e.g. OTU-WEB-001) once work begins." },
  { n: 3, icon: "📈", title: "Track live", text: "Enter your code here anytime to see real progress & milestones." },
  { n: 4, icon: "🚀", title: "Delivery", text: "We hand over, deploy and support your finished project." },
];

const options = [
  { icon: "🌐", title: "Website", desc: "Business sites, portfolios, landing pages.", from: "1,000,000", type: "Website" },
  { icon: "📱", title: "Mobile App", desc: "Android/iOS apps for your business or idea.", from: "3,500,000", type: "Mobile App" },
  { icon: "⚙️", title: "Custom Software / System", desc: "Management systems, POS, dashboards, automation.", from: "2,500,000", type: "Custom Software" },
  { icon: "🛒", title: "E-commerce / Online Shop", desc: "Sell online with payments & delivery.", from: "1,800,000", type: "E-commerce store" },
  { icon: "🖥️", title: "IT Support & Setup", desc: "Networks, repairs, installations, maintenance.", from: "Quote", type: "IT Support" },
  { icon: "🎨", title: "Branding & Design", desc: "Logos, graphics, social media content.", from: "300,000", type: "Branding & Design" },
];

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Track" }]}
        eyebrow="Order & project tracking"
        title="Track your order or project"
        subtitle="Enter your order number to see live delivery status — or a project code to follow your software build."
      />

      {/* Order tracking — the main thing most customers want */}
      <section className="container-page max-w-3xl py-10">
        <div className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-center text-lg font-extrabold text-ink-900">Track your order</h2>
          <p className="mb-4 text-center text-sm text-ink-700/60">
            Enter the order number from your confirmation (e.g. OTU-AC4C98E1) to see its live status.
          </p>
          <OrderTracker initialRef={ref ?? ""} />
        </div>
      </section>

      {/* Project tracking — for software/website clients */}
      <section className="container-page max-w-3xl pb-4">
        <div className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-center text-lg font-extrabold text-ink-900">Track a software project</h2>
          <p className="mb-4 text-center text-sm text-ink-700/60">
            Building a website, app or system with us? Enter your project code (e.g. OTU-WEB-001).
          </p>
          <ProjectTracker />
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-6">
        <h2 className="mb-6 text-center text-xl font-extrabold text-ink-900">How project tracking works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-card border border-ink-600/10 bg-white p-5 text-center shadow-sm">
              <span className="absolute right-3 top-3 text-xs font-black text-ink-600/15">{s.n}</span>
              <div className="text-3xl">{s.icon}</div>
              <p className="mt-2 font-extrabold text-ink-900">{s.title}</p>
              <p className="mt-1 text-xs text-ink-700/60">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Start a new project — options */}
      <section className="container-page py-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-extrabold text-ink-900">Don&apos;t have a project yet?</h2>
          <p className="mt-1 text-sm text-ink-700/60">Choose the option that fits — we&apos;ll help you plan and budget it well.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((o) => (
            <div key={o.title} className="flex flex-col rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="text-3xl">{o.icon}</div>
              <h3 className="mt-2 font-extrabold text-ink-900">{o.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-700/65">{o.desc}</p>
              <p className="mt-2 text-sm font-bold text-brand-600">
                {o.from === "Quote" ? "Get a quote" : `From UGX ${o.from}`}
              </p>
              <div className="mt-3 flex gap-2">
                <Link href="/request" className="flex-1 rounded-md bg-brand-500 px-3 py-2 text-center text-xs font-bold text-white hover:bg-brand-600">
                  Request
                </Link>
                <a
                  href={whatsappLink(`Hi Online Tech Uganda! I'd like to start a ${o.type} project. Please guide me on options and budget.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-md border border-green-600 px-3 py-2 text-center text-xs font-bold text-green-700 hover:bg-green-50"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-card bg-ink-700 p-6 text-center text-white">
          <p className="font-bold">Not sure which option is right for you?</p>
          <p className="mt-1 text-sm text-white/80">Tell us your goal and budget — we&apos;ll recommend the best fit and a clear plan.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link href="/services" className="rounded-md bg-white px-5 py-2.5 text-sm font-bold text-ink-900 hover:bg-white/90">See all services</Link>
            <a
              href={whatsappLink("Hi Online Tech Uganda! I'd like advice on planning my project.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Chat with us
            </a>
          </div>
        </div>
      </section>
      <div className="container-page pb-10">
        <ContactOptions
          subject={"Project update"}
          heading={"Need an update?"}
          note={"Ask us where your project or order has reached."}
        />
      </div>

    </>
  );
}
