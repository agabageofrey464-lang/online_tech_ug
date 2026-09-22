import type { Metadata } from "next";

// This page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Refer & Earn",
  description:
    "Refer a friend to Online Tech Uganda and earn when they buy a computer or enrol on a course. Simple rewards for recommending us.",
  alternates: { canonical: "/refer" },
  openGraph: {
    title: "Refer & Earn",
    description:
      "Refer a friend to Online Tech Uganda and earn when they buy a computer or enrol on a course. Simple rewards for recommending us.",
    url: "/refer",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
