import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icon";
import { site, whatsappLink, whatsappAltLink } from "@/lib/site";
import { share } from "@/lib/seo";

export const metadata: Metadata = share({
  title: "Contact Us",
  description:
    "Get in touch with Online Tech Uganda — call, WhatsApp, email or send us a message. We're in Kampala and deliver countrywide.",
}, "/contact");

// Map a ?subject= hint (from Sell/Freelancer "contact us" links) to a form option.
const SUBJECT_MAP: Record<string, string> = {
  "become-a-vendor": "Become a vendor / sell with us",
  "freelancer-listing": "Get listed as a freelancer",
  advertise: "Advertise with us",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const initialSubject = subject ? SUBJECT_MAP[subject] ?? "" : "";
  const channels = [
    { icon: "chat", label: "WhatsApp", value: site.phoneDisplay, href: whatsappLink("Hello Online Tech Uganda") },
    { icon: "chat", label: "WhatsApp (line 2)", value: site.whatsappAltDisplay, href: whatsappAltLink("Hello Online Tech Uganda") },
    { icon: "phone", label: "Call us", value: site.phoneDisplay, href: `tel:${site.phoneDisplay.replace(/\s/g, "")}` },
    { icon: "mail", label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: "pin", label: "Location", value: site.address },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Contact" }]}
        eyebrow="Contact"
        title="Let's talk"
        subtitle="Buying a device, building a website, or learning computer basics? We're ready to help."
      />

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Channels */}
          <div className="space-y-4">
            {channels.map((c) =>
              c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-4 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-ink-700/50">
                      {c.label}
                    </span>
                    <span className="font-semibold text-ink-600">{c.value}</span>
                  </span>
                </a>
              ) : (
                <div key={c.label} className="flex items-center gap-4 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-ink-700/50">
                      {c.label}
                    </span>
                    <span className="font-semibold text-ink-600">{c.value}</span>
                  </span>
                </div>
              ),
            )}
            <div className="overflow-hidden rounded-card border border-ink-600/10 shadow-sm">
              <iframe
                title="Online Tech Uganda location"
                src="https://www.google.com/maps?q=Liberty+Tower+Kampala+Road+Kampala&output=embed"
                className="h-56 w-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-card border border-ink-600/10 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink-600">Send us a message</h2>
            <p className="mt-1 text-sm text-ink-700/70">We typically reply within a few hours.</p>
            <div className="mt-6">
              <ContactForm initialSubject={initialSubject} />
            </div>

            {/* Business buyers usually need a document, not a conversation. */}
            <p className="mt-5 rounded-lg border border-ink-600/10 bg-ink-50 px-3.5 py-3 text-sm text-ink-700/75">
              Buying for a company, school, church or NGO?{" "}
              <Link href="/invoice" className="font-bold text-brand-600 hover:underline">
                Request a proforma invoice or quotation
              </Link>{" "}
              instead — we&apos;ll email itemised figures your finance office can work from.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
