import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { Button } from "@/components/ui";
import { portfolio, findProject } from "@/lib/portfolio";
import { whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return portfolio.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = findProject(slug);
  if (!p) return { title: "Project not found" };
  return { title: `${p.title} — Portfolio`, description: p.summary };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <Breadcrumbs
          items={[{ label: "Portfolio", href: "/portfolio" }, { label: project.title }]}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={project.shots} alt={project.title} />

        <div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            {project.category}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-ink-600">{project.title}</h1>
          <p className="mt-1 text-sm text-ink-700/60">
            {project.client} · {project.year}
          </p>
          <p className="mt-4 text-ink-700/80">{project.description}</p>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-ink-700/50">
            What's included
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {project.tags.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-ink-700/80">
                <Check size={16} className="shrink-0 text-brand-500" /> {t}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            {project.demo && (
              <Button href={project.demo} external variant="primary">
                View live demo
              </Button>
            )}
            <Button
              href={whatsappLink(`Hi, I'd like something like your "${project.title}" project.`)}
              external
              variant={project.demo ? "outline" : "primary"}
            >
              Request a similar project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
