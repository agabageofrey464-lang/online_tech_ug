import type { Metadata } from "next";

// This page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Confirm a Payment",
  description:
    "Paid by MTN Mobile Money or Airtel Money? Confirm your payment with Online Tech Uganda here and we will process your order or enrolment.",
  alternates: { canonical: "/pay" },
  openGraph: {
    title: "Confirm a Payment",
    description:
      "Paid by MTN Mobile Money or Airtel Money? Confirm your payment with Online Tech Uganda here and we will process your order or enrolment.",
    url: "/pay",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
