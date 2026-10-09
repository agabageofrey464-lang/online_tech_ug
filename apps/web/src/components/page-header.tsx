import Image from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";

/**
 * The banner at the top of a page: a photograph the full width of the screen
 * with the page's title over it in the serif, a line beneath, and room for a
 * button or two. It was a compact coloured band.
 *
 * Every page that uses it gets the shop floor unless it names a photograph of
 * its own, so no page is left with the old band.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs,
  image = "/hero/shop-floor.webp",
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  /** The photograph behind the title. */
  image?: string;
  /** Buttons or badges, shown under the subtitle. */
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-800 text-white">
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-ink-900/55" />
      <div className="container-page relative flex min-h-[250px] flex-col py-5 sm:min-h-[360px] xl:min-h-[420px]">
        {crumbs && crumbs.length > 0 && (
          <Breadcrumbs items={crumbs} light />
        )}
        <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center py-6 text-center">
          {eyebrow && <p className="font-display text-[18px] italic text-brand-200">{eyebrow}</p>}
          <h1 className="mt-1 text-[34px] leading-[1.1] text-balance-pretty sm:text-[52px]">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/95 sm:text-[18px]">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}
