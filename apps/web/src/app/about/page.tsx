import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icon";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stats, whyUs, listedProducts, courses, REGISTRATION_FEE } from "@/lib/data";
import { site, ugx } from "@/lib/site";
import { DELIVERY_TOWNS } from "@/lib/delivery";
import { SERVICE_FROM } from "@/lib/service-prices";
import { INTERNSHIP_FEE, INTERNSHIP_WEEKS } from "@/components/internship-panel";
import { NeedPicker, type Need } from "@/components/need-picker";
import { share } from "@/lib/seo";

export const metadata: Metadata = share({
  title: "About Us",
  description:
    "Online Tech Uganda Ltd is an integrated technology company — an online computer store, digital agency, software company, online learning platform and IT services provider.",
}, "/about");

/**
 * Everything the site offers, with the figures taken from the same data the
 * rest of the site sells from — so this page cannot drift out of date.
 */
const OFFERS = [
  {
    icon: "laptop",
    tone: "bg-brand-500",
    title: "Computer store",
    href: "/shop",
    cta: "Open the shop",
    body: `${listedProducts.length} products in stock — laptops, desktops, phones, components, storage, power, accessories and networking gear.`,
    points: ["Brand new, UK-used and refurbished", "Tested before it leaves the shop", `Delivery to ${DELIVERY_TOWNS.length} towns, from ${ugx(10000)}`],
  },
  {
    icon: "learn",
    tone: "bg-green-700",
    title: "Learn Academy",
    href: "/learn",
    cta: "Browse courses",
    body: `${courses.length} computer courses — from switching a computer on to Excel, design, coding and networking.`,
    points: ["A certificate with every course", "In class in Kampala, or online", `Registration ${ugx(REGISTRATION_FEE)}, then pay per lesson`],
  },
  {
    icon: "graduation",
    tone: "bg-teal-700",
    title: "Internships",
    href: "/internship",
    cta: "See the programme",
    body: "Industrial training for university and college students, on real client work, supervised online.",
    points: [`${ugx(INTERNSHIP_FEE)} for the whole ${INTERNSHIP_WEEKS} weeks`, "Acceptance and completion letters", "Every university and college welcome"],
  },
  {
    icon: "software",
    tone: "bg-ink-600",
    title: "Software development",
    href: "/development",
    cta: "See what we build",
    body: "Websites, mobile apps, online shops and the systems schools, clinics, SACCOs and shops run on.",
    points: [`Websites from ${ugx(SERVICE_FROM.website)}`, "Mobile Money built in", "A written quote before any work"],
  },
  {
    icon: "wrench",
    tone: "bg-brand-700",
    title: "Repairs & IT support",
    href: "/services#repairs-support",
    cta: "Book a repair",
    body: "Laptops, desktops and networks — repaired, upgraded and looked after, in the shop or on site.",
    points: ["Free diagnosis", `Repairs from ${ugx(SERVICE_FROM.repairs)}`, "RAM and SSD upgrades fitted while you wait"],
  },
  {
    icon: "package",
    tone: "bg-ink-700",
    title: "Marketplace",
    href: "/sell",
    cta: "Sell with us",
    body: "Other businesses sell through our site and reach the customers already shopping here.",
    points: ["No commission on your sales", "A flat subscription", "Paid by Mobile Money once the customer has the order"],
  },
];

/** The picker near the top: what the visitor came for, and what we do about it. */
const NEEDS: Need[] = [
  {
    key: "buy", icon: "laptop", label: "Buy a computer", tone: "bg-brand-500",
    answer: "Tell us your budget and what it is for — we will say honestly which machine fits.",
    points: [`${listedProducts.length} products in stock`, "Every device tested before dispatch", `Delivered to ${DELIVERY_TOWNS.length} towns`, "Pay by Mobile Money, bank, card or at the shop"],
    cta: "Find my laptop", href: "/find",
  },
  {
    key: "learn", icon: "learn", label: "Learn a skill", tone: "bg-green-700",
    answer: "Start from wherever you are — a first lesson or a full programme, with a certificate at the end.",
    points: [`${courses.length} courses to choose from`, "Classes in Kampala or online", "Notes you keep", "Intakes through the year"],
    cta: "See the courses", href: "/learn",
  },
  {
    key: "build", icon: "software", label: "Build software", tone: "bg-ink-600",
    answer: "Describe the problem. We design it, quote it in writing, build it and train your staff to use it.",
    points: ["Websites, apps and online shops", "School, POS, clinic and SACCO systems", "Mobile Money and Airtel Money checkout", "You own the code and the accounts"],
    cta: "Request a quote", href: "/request",
  },
  {
    key: "fix", icon: "wrench", label: "Fix a device", tone: "bg-brand-700",
    answer: "Bring it in or call us out. We find the fault for free and tell you the cost before we touch it.",
    points: ["Free diagnosis", `Repairs from ${ugx(SERVICE_FROM.repairs)}`, "Screens, batteries, keyboards and software", "Networks set up and supported"],
    cta: "Book a repair", href: "/services#repairs-support",
  },
  {
    key: "train", icon: "graduation", label: "Do my internship", tone: "bg-teal-700",
    answer: "Spend your industrial training doing real work online, with a supervisor and the letters your school needs.",
    points: [`${ugx(INTERNSHIP_FEE)} for ${INTERNSHIP_WEEKS} weeks`, "Entirely online", "Acceptance and completion letters", "Software, design, networking and more"],
    cta: "Apply for a place", href: "/internship",
  },
  {
    key: "sell", icon: "package", label: "Sell my products", tone: "bg-ink-700",
    answer: "Open a shop on our marketplace and put your products in front of the people already buying here.",
    points: ["No commission on sales", "A flat monthly, half-year or yearly plan", "Your own vendor dashboard", "Verified businesses only"],
    cta: "Become a vendor", href: "/sell",
  },
];

/** How an order actually travels, in the order it happens. */
const JOURNEY = [
  { n: 1, title: "You order", body: "On the site, by phone or on WhatsApp — whichever is easiest for you." },
  { n: 2, title: "We call you", body: "A person confirms what you ordered, the total and where it is going." },
  { n: 3, title: "We test it", body: "The device is checked — battery, screen, ports — before it is packed." },
  { n: 4, title: "It reaches you", body: "Delivered to your town, or collected from our shop in Kampala." },
  { n: 5, title: "We stay", body: "Warranty, upgrades and support afterwards, from the same people." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "About" }]}
        eyebrow="About"
        title="One brand. Your complete tech partner."
        subtitle="We bring computers, software, learning and support together under one integrated system — built for Uganda."
      />

      {/* Our story */}
      {/* Built only from what is true and already on this page: the founder's
          three jobs, and the three sides of the company that came out of them. */}
      <section className="container-page pt-12 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-600">
              <span className="h-4 w-1.5 rounded-full bg-brand-500" /> Our story
            </p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-ink-900 sm:text-4xl">
              Three jobs that became <span className="text-brand-600">one company</span>
            </h2>
            <div className="mt-4 space-y-3.5 text-[15.5px] leading-relaxed text-ink-700/85">
              <p>
                Most technology companies do one thing. One sells you a laptop. Another builds your
                website. A third teaches you to use them, and a fourth repairs the laptop when it
                stops. In Kampala that usually means four shops, four phone numbers, and nobody who
                knows the whole picture.
              </p>
              <p>
                {site.name} is shaped the way it is because of where its founder worked before it
                existed. He kept computers running in a hardware and software department. He built
                and administered a company&apos;s systems and databases. And he made educational
                videos, turning technical subjects into lessons people could follow.
              </p>
              <p>
                <b className="text-ink-900">Hardware, software and teaching</b> — those three jobs
                are the three sides of this company. We sell the machine, we build what runs on it,
                we teach you to use it, and we fix it when it breaks. The person who sold you the
                laptop can tell you which course to take next, and the team that built your system
                will still pick up the phone a year later.
              </p>
            </div>
            <p className="mt-5 font-display text-2xl font-black tracking-tight text-ink-900">
              Buy. <span className="text-brand-600">Build.</span> Learn. <span className="text-brand-600">Repair.</span>
            </p>
          </div>

          {/* The three jobs, as the three sides */}
          <ol className="space-y-3">
            {[
              { from: "Keeping computers running", to: "The shop and the repair bench", icon: "wrench", tone: "bg-brand-500" },
              { from: "Building systems and databases", to: "Software development", icon: "software", tone: "bg-ink-600" },
              { from: "Making lessons people can follow", to: "Learn Academy and internships", icon: "learn", tone: "bg-green-700" },
            ].map((x) => (
              <li key={x.to} className="flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10">
                <span className={`flex w-16 shrink-0 items-center justify-center text-white ${x.tone}`}>
                  <Icon name={x.icon} size={26} />
                </span>
                <span className="min-w-0 flex-1 p-4">
                  <span className="block text-[12px] font-bold uppercase tracking-wide text-ink-700/55">{x.from}</span>
                  <span className="mt-0.5 flex items-center gap-2 font-display text-lg font-black leading-snug text-ink-900">
                    <span className="text-brand-500">→</span> {x.to}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What do you need today? */}
      <section className="container-page pt-12">
        <h2 className="font-display text-2xl font-black text-ink-900 sm:text-3xl">What do you need today?</h2>
        <p className="mt-1 text-[15px] text-ink-700/70">Pick one, and see exactly what we do about it.</p>
        <div className="mt-4">
          <NeedPicker needs={NEEDS} />
        </div>
      </section>

      {/* Mission / vision */}
      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-card border border-ink-600/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink-600">Our mission</h2>
            <p className="mt-3 text-ink-700/75">
              To make quality technology and digital skills affordable and accessible to every
              Ugandan — selling reliable computers, building world-class software, and teaching the
              skills people need to thrive in a digital world.
            </p>
          </div>
          <div className="rounded-card border border-ink-600/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink-600">Our vision</h2>
            <p className="mt-3 text-ink-700/75">
              To become Uganda&apos;s leading integrated technology company — an online computer store,
              a digital agency, a software company, an online learning platform and an IT services
              company, all under one trusted brand.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-6 rounded-card bg-ink-600 p-8 text-white sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Everything we offer */}
      <section className="bg-ink-50/60 py-14 sm:py-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-600">
              <span className="h-4 w-1.5 rounded-full bg-brand-500" /> What we give you
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-ink-900 sm:text-3xl">
              Six things, under one roof
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-700/75">
              Each of these is a full part of the business with its own page — not a line on a list.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERS.map((o) => (
              <Link
                key={o.title}
                href={o.href}
                className="card-lift group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10"
              >
                <div className={`stripes flex items-center gap-3 px-5 py-4 text-white ${o.tone}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <Icon name={o.icon} size={22} />
                  </span>
                  <h3 className="font-display text-xl font-black">{o.title}</h3>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[14.5px] leading-relaxed text-ink-700/85">{o.body}</p>
                  <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-700/80">
                    {o.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-4 text-sm font-bold text-brand-600 group-hover:underline">{o.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How an order travels */}
      <section className="container-page py-14">
        <h2 className="font-display text-2xl font-black text-ink-900 sm:text-3xl">What happens after you order</h2>
        <p className="mt-1 text-[15px] text-ink-700/70">From the first message to long after the box is opened.</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY.map((j) => (
            <li key={j.n} className="relative rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-600/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 font-display text-lg font-black text-white">
                {j.n}
              </span>
              <h3 className="mt-3 font-display text-[17px] font-black text-ink-900">{j.title}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-700/75">{j.body}</p>
            </li>
          ))}
        </ol>

      </section>

      {/* Leadership */}
      <section className="bg-ink-50/60 py-16">
        <div className="container-page">
          <div className="text-center">
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
              Our leadership
            </span>
            <h2 id="founder" className="mt-3 scroll-mt-40 text-2xl font-extrabold text-ink-900 sm:text-3xl">
              Meet the Founder
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            {/* Name + quote lead the section */}
            <div className="relative overflow-hidden rounded-2xl bg-ink-700 p-7 text-white shadow-lg sm:p-9">
              <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/25 blur-3xl" />
              <div className="relative">
                <span className="inline-block rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  Founder &amp; CEO
                </span>
                <div className="mt-4 flex items-center gap-4">
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40">
                    <Image src="/people/agaba-geofrey-ceo-portrait.jpg" alt="Agaba Geofrey, founder and CEO of Online Tech Uganda" fill sizes="80px" className="object-cover" />
                  </span>
                  <Link href="/about/agaba-geofrey" className="text-[13px] font-semibold text-brand-200 underline underline-offset-4 hover:text-white">
                    Read his full profile
                  </Link>
                </div>
                <h3 className="mt-3 text-2xl font-black sm:text-3xl">{site.ceo.name}</h3>
                <p className="text-sm font-semibold text-brand-200">{site.ceo.title}</p>

                <blockquote className="mt-5 max-w-2xl border-l-4 border-brand-400 pl-4 text-[15px] leading-relaxed text-white/90">
                  &ldquo;My mission is to make quality technology and digital skills affordable and
                  accessible to every Ugandan — from your first laptop to your first website, and
                  the skills to use them with confidence.&rdquo;
                </blockquote>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent("Enquiry for Online Tech Uganda")}`}
                    className="press inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-white/90"
                  >
                    <Mail size={15} /> {site.email}
                  </a>
                  <a
                    href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`}
                    className="press inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <Phone size={15} /> {site.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            {/* Background */}
            <div className="mt-4 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-[15px] leading-relaxed text-ink-700/85">
                Agaba Geofrey is a hands-on IT specialist with strong experience in system
                administration, database development, IT support and creative media. He has worked
                across government, education and business — and founded Online Tech Uganda to bring
                affordable, reliable technology and digital skills to every Ugandan.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-700/50">
                    Experience
                  </p>
                  <ul className="mt-2.5 space-y-2.5">
                    {[
                      { org: "KCCA", role: "IT Expert, Hardware & Software Department" },
                      { org: "Prime Learn", role: "Educational video production (full Adobe Creative Suite)" },
                      { org: "Gallery Antique Uganda", role: "System Administrator & Database Developer" },
                    ].map((e) => (
                      <li key={e.org} className="border-l-2 border-brand-400 pl-3">
                        <span className="block text-sm font-bold text-ink-900">{e.org}</span>
                        <span className="block text-[13px] text-ink-700/70">{e.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-700/50">
                    IT skills
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {[
                      "System Administration",
                      "Database Development",
                      "Hardware & Software Support",
                      "Networking",
                      "Adobe Creative Suite",
                      "Video Editing",
                      "Graphic Design",
                      "Web & Software Systems",
                      "IT Support & Training",
                    ].map((sk) => (
                      <span
                        key={sk}
                        className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container-page py-16">
        <h2 className="text-2xl font-extrabold text-ink-600 sm:text-3xl">Why choose Online Tech Uganda</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon name={w.icon} size={24} />
              </span>
              <h3 className="mt-3 font-bold text-ink-600">{w.title}</h3>
              <p className="mt-1 text-sm text-ink-700/70">{w.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/contact" variant="primary">
            Work with us →
          </Button>
        </div>
      </section>
    </>
  );
}
