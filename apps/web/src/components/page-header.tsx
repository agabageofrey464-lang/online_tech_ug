import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="band-light border-b border-ink-600/15">
      {/* Compact band — page content should start near the top, not below a
          full screen of heading. Subtitle is capped at two lines. */}
      <div className="container-page py-4 md:py-5">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-1.5">
            <Breadcrumbs items={crumbs} light />
          </div>
        )}
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">{eyebrow}</p>
        )}
        <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-balance-pretty sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 line-clamp-2 max-w-2xl text-[13px] leading-snug text-white/75">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
