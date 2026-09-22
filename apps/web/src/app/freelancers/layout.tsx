import type { Metadata } from "next";

// This page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Hire IT Freelancers in Uganda",
  description:
    "Find vetted Ugandan freelancers for web development, graphic design, data entry, IT support and digital marketing. Hire directly through Online Tech Uganda.",
  alternates: { canonical: "/freelancers" },
  openGraph: {
    title: "Hire IT Freelancers in Uganda",
    description:
      "Find vetted Ugandan freelancers for web development, graphic design, data entry, IT support and digital marketing. Hire directly through Online Tech Uganda.",
    url: "/freelancers",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
