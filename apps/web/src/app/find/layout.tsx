import type { Metadata } from "next";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "What Laptop Can I Get For My Budget?",
  description:
    "Tell us your budget and what you need a laptop for — study, office, design, programming or gaming — and see what genuinely fits, from UGX 700,000. Honest advice from Online Tech Uganda, Kampala.",
  alternates: { canonical: "/find" },
  openGraph: {
    title: "What laptop can I get for my budget?",
    description:
      "Budget-first laptop finder for Uganda. Tell us what you can spend and what you'll use it for.",
    url: "/find",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
