import type { Metadata } from "next";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Request an Invoice or Quotation",
  description:
    "Buying for a company, school, church or NGO in Uganda? Request a proforma invoice or quotation from Online Tech Uganda — itemised figures your finance office can work from, emailed within one working day.",
  alternates: { canonical: "/invoice" },
  openGraph: {
    title: "Request a proforma invoice or quotation",
    description:
      "Tell us what you need priced and we'll send a document your finance office can act on.",
    url: "/invoice",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
