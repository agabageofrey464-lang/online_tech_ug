import type { Metadata } from "next";

// This page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Student Community",
  description:
    "Ask questions and get answers from other learners and Online Tech Uganda trainers. Help with Microsoft Office, graphic design, web development, networking and more.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Student Community",
    description:
      "Ask questions and get answers from other learners and Online Tech Uganda trainers. Help with Microsoft Office, graphic design, web development, networking and more.",
    url: "/community",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
