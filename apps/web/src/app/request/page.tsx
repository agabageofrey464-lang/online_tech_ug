import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SoftwareRequest } from "@/components/software-request";

export const metadata: Metadata = {
  title: "Request Software",
  description:
    "Request a website, mobile app, school system, hospital system, HR system or custom software from Online Tech Uganda. Get a free proposal and quote.",
};

export default function RequestPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Request software" }]}
        eyebrow="Get started"
        title="Request software"
        subtitle="Tell us what you need — a website, mobile app, school or hospital system, HR/payroll, POS or custom software. We'll send a free proposal, timeline and quote."
      />
      <section className="container-page max-w-3xl py-12">
        <SoftwareRequest />
      </section>
    </>
  );
}
