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
    <section className="border-b-4 border-brand-500 bg-ink-700 text-white">
      <div className="container-page py-14 md:py-20">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={crumbs} light />
          </div>
        )}
        {eyebrow && (
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-300">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance-pretty sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-base text-white/85">{subtitle}</p>}
      </div>
    </section>
  );
}
