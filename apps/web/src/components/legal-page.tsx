import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

export type LegalSection = { id: string; title: string; body: ReactNode };

const OTHER_POLICIES = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/returns", label: "Returns & Refunds" },
];

/**
 * The frame the three policy pages share: a contents list a reader can jump
 * from, the sections themselves, and who to contact at the end. A policy is
 * read by somebody looking for one answer, so every section has its own link.
 */
export function LegalPage({
  path,
  title,
  subtitle,
  updated,
  sections,
}: {
  path: string;
  title: string;
  subtitle: string;
  /** Shown to the reader — change it whenever the wording changes. */
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader crumbs={[{ label: title }]} eyebrow="Policies" title={title} subtitle={subtitle} />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="On this page" className="self-start rounded-card border border-ink-600/10 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-700/50">On this page</p>
          <ol className="mt-3 space-y-1 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-block py-1 text-ink-700/80 hover:text-brand-600">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-ink-600/10 pt-4 text-xs font-bold uppercase tracking-wider text-ink-700/50">
            Other policies
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {OTHER_POLICIES.filter((p) => p.href !== path).map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="inline-block py-1 text-ink-700/80 hover:text-brand-600">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="notes-prose min-w-0 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="!mt-0 text-xs font-semibold text-ink-700/55">Last updated: {updated}</p>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h3>
                {i + 1}. {s.title}
              </h3>
              {s.body}
            </section>
          ))}

          <div className="note-key">
            <b>Questions about this page?</b> Call or WhatsApp {site.phoneDisplay}, or email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-brand-600 hover:underline">
              {site.email}
            </a>
            . {site.legalName}, {site.address}.
          </div>
        </article>
      </div>
    </>
  );
}
