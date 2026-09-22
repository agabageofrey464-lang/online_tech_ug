import type { Metadata } from "next";

// This page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Help Centre",
  description:
    "Answers on ordering, delivery, payment by MTN MoMo and Airtel Money, warranty, returns and our computer courses. Online Tech Uganda, Kampala.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Help Centre",
    description:
      "Answers on ordering, delivery, payment by MTN MoMo and Airtel Money, warranty, returns and our computer courses. Online Tech Uganda, Kampala.",
    url: "/help",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
