import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { photoCredits } from "@/lib/photo-credits";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Photographs on this site that were taken by others, with their authors and licences.",
  alternates: { canonical: "/credits" },
};

const LICENCES: Record<string, string> = {
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
};

/** Credits for photographs we did not take. Their licences require this. */
export default function CreditsPage() {
  return (
    <div className="container-page max-w-3xl py-8">
      <Breadcrumbs items={[{ label: "Photo credits" }]} />
      <h1 className="mt-6 text-[34px] leading-tight text-ink-900">Photo credits</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-700/85">
        Most photographs on this site are our own. The product pictures below come from Wikimedia Commons and are used
        under the licence named beside each; they have been resized. Each shows the model, not the exact unit you will
        receive.
      </p>
      <ul className="mt-6 divide-y divide-ink-600/10 bg-white">
        {photoCredits.map((c) => (
          <li key={c.slug} className="px-4 py-3.5 text-[14px]">
            <p className="font-semibold text-ink-900">{c.product}</p>
            <p className="mt-0.5 text-ink-700/80">
              <a href={c.source} target="_blank" rel="noreferrer" className="text-brand-600 underline underline-offset-2">
                {c.title}
              </a>{" "}
              by {c.author},{" "}
              <a href={LICENCES[c.license] ?? c.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {c.license}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
