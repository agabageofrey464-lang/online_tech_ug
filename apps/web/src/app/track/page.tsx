import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProjectTracker } from "@/components/project-tracker";

export const metadata: Metadata = {
  title: "Track Your Project",
  description:
    "Clients can track the progress of their website, mobile app or software project with Online Tech Uganda using their project code.",
};

export default function TrackPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Track Project" }]}
        eyebrow="Project tracking"
        title="Track your project"
        subtitle="Enter the project code we sent you to see live progress on your website, app or software system."
      />
      <section className="container-page max-w-3xl py-12">
        <ProjectTracker />
        <p className="mt-6 text-center text-sm text-ink-700/50">
          Don&apos;t have a code yet? Start a project from our Services page or message us on WhatsApp.
        </p>
      </section>
    </>
  );
}
