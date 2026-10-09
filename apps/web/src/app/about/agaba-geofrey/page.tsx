import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

const PHOTO = "/people/agaba-geofrey-founder-online-tech-uganda.jpg";
const PORTRAIT = "/people/agaba-geofrey-ceo-portrait.jpg";
const PAGE = `${site.url}/about/agaba-geofrey`;
const TITLE = "Agaba Geofrey — Founder & CEO of Online Tech Uganda";
const SUMMARY =
  "Agaba Geofrey is the founder, owner and CEO of Online Tech Uganda (onlinetechug.com) — a full-stack developer and IT specialist based in Kampala, Uganda.";

export const metadata: Metadata = {
  title: TITLE,
  description: SUMMARY,
  alternates: { canonical: "/about/agaba-geofrey" },
  openGraph: {
    type: "profile",
    title: TITLE,
    description: SUMMARY,
    url: "/about/agaba-geofrey",
    firstName: "Geofrey",
    lastName: "Agaba",
    images: [{ url: "/people/agaba-geofrey-share.jpg", width: 1200, height: 630, alt: "Agaba Geofrey, founder and CEO of Online Tech Uganda" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SUMMARY, images: ["/people/agaba-geofrey-share.jpg"] },
};

const EXPERIENCE = [
  { org: "Online Tech Uganda", role: "Founder & CEO — computer shop, software development, IT training and repairs" },
  { org: "Gallery Antique Uganda", role: "System Administrator & Database Developer" },
  { org: "Prime Learn", role: "Educational video production" },
  { org: "Kampala Capital City Authority (KCCA)", role: "IT, Hardware & Software Department" },
];
const WORK = [
  { name: "Online Tech Uganda — onlinetechug.com", href: "/", what: "Online shop, course academy, vendor marketplace and dashboard on one platform." },
  { name: "Beds & Beddings — bedsbeddings.com", href: "https://bedsbeddings.com/developer", what: "Online store with storefront, admin dashboard and backend." },
  { name: "Jdiobe STEM Foundation — jdiobestem.org", href: "https://jdiobestem.org", what: "Website for an education non-profit." },
  { name: "More projects", href: "/portfolio", what: "Queue management, school and business systems in the portfolio." },
];
const SKILLS = [
  "Website development",
  "Mobile application development",
  "Software systems",
  "Database development",
  "System administration",
  "Hardware & software support",
  "Networking",
  "Video editing",
  "Graphic design",
  "IT training",
];

/**
 * The founder, on a page of his own.
 *
 * A search for a person is answered from pages about that person. The About
 * page is about the company, so his name led there and his photograph was
 * nowhere a search engine would connect to it. This page says who he is in
 * plain text, shows his photographs with his name in their descriptions and
 * file names, and describes itself to search engines as his profile.
 */
export default function FounderPage() {
  const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": PAGE,
    url: PAGE,
    name: TITLE,
    mainEntity: {
      "@type": "Person",
      "@id": `${site.url}/about#founder`,
      name: site.ceo.name,
      givenName: "Geofrey",
      familyName: "Agaba",
      jobTitle: "Founder & CEO",
      description: SUMMARY,
      image: [`${site.url}${PHOTO}`, `${site.url}${PORTRAIT}`],
      url: PAGE,
      email: site.ceo.email,
      worksFor: { "@id": `${site.url}/#business` },
      // Other pages about the same person.
      sameAs: ["https://bedsbeddings.com/developer"],
      knowsAbout: SKILLS,
      address: { "@type": "PostalAddress", addressLocality: "Kampala", addressCountry: "UG" },
    },
  };

  return (
    <div className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }} />
      <Breadcrumbs items={[{ label: "About Us", href: "/about" }, { label: "Agaba Geofrey" }]} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <figure className="h-fit bg-white p-2">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#f0ede6]">
            <Image
              src={PHOTO}
              alt="Agaba Geofrey, founder and CEO of Online Tech Uganda"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <figcaption className="px-2 py-3 text-[13px] text-ink-700/75">Agaba Geofrey — Founder &amp; CEO, Online Tech Uganda</figcaption>
        </figure>

        <div>
          <p className="font-display text-[19px] italic text-brand-600">Founder &amp; CEO · Online Tech Uganda</p>
          <h1 className="mt-1 text-[40px] leading-[1.08] text-ink-900 sm:text-[54px]">Agaba Geofrey</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-800">
            Agaba Geofrey is the founder, owner and CEO of{" "}
            <Link href="/" className="font-semibold text-brand-600 hover:underline">
              Online Tech Uganda
            </Link>{" "}
            (onlinetechug.com), also trading as {site.tradingName}. He is a full-stack developer and IT specialist based
            in Kampala, Uganda.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-700/90">
            He has worked across government, education and business, and founded Online Tech Uganda to bring affordable,
            reliable technology and digital skills to Ugandans: a computer shop at Mabirizi Complex in Kampala, software
            and website development, an academy of computer courses, industrial training for students, and repairs.
          </p>
          <blockquote className="mt-6 border-l-4 border-brand-500 pl-4 font-display text-[21px] italic leading-snug text-ink-900">
            &ldquo;My mission is to make quality technology and digital skills affordable and accessible to every
            Ugandan — from your first laptop to your first website, and the skills to use them with confidence.&rdquo;
          </blockquote>

          <h2 className="mt-9 text-[26px] text-ink-900">Experience</h2>
          <ul className="mt-3 divide-y divide-ink-600/10 bg-white">
            {EXPERIENCE.map((e) => (
              <li key={e.org} className="px-4 py-3">
                <span className="block text-[15px] font-semibold text-ink-900">{e.org}</span>
                <span className="block text-[13.5px] text-ink-700/75">{e.role}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-9 text-[26px] text-ink-900">Work he has built</h2>
          <ul className="mt-3 divide-y divide-ink-600/10 bg-white">
            {WORK.map((w) => (
              <li key={w.name} className="px-4 py-3">
                <a href={w.href} target={w.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="block text-[15px] font-semibold text-brand-600 hover:underline">
                  {w.name}
                </a>
                <span className="block text-[13.5px] text-ink-700/75">{w.what}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-9 text-[26px] text-ink-900">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span key={s} className="bg-white px-3 py-1.5 text-[13px] text-ink-800">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4 bg-white p-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
              <Image src={PORTRAIT} alt="Portrait of Agaba Geofrey, owner of Online Tech Uganda" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink-900">Get in touch</p>
              <p className="text-[13.5px] text-ink-700/80">
                {site.phoneDisplay} · {site.email}
              </p>
            </div>
            <Link href="/contact" className="bg-brand-500 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
