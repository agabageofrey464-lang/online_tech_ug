import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PortfolioGrid } from "@/components/portfolio-grid";

export const metadata: Metadata = {
  title: "Our Work — Portfolio",
  description:
    "Websites, mobile apps and management systems built by Online Tech Uganda — with descriptions and demo screenshots.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Portfolio" }]}
        eyebrow="Our work"
        title="Projects portfolio"
        subtitle="A selection of websites, mobile apps and management systems we've built. Filter by category and open any project for details and screenshots."
      />
      <section className="container-page py-12">
        <PortfolioGrid />
      </section>
    </>
  );
}
