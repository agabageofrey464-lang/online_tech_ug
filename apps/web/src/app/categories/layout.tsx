import type { Metadata } from "next";

// This page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Browse computers and accessories by category — laptops, desktops, components, storage, networking, power and accessories. Genuine stock with warranty and countrywide delivery in Uganda.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Shop by Category",
    description:
      "Browse computers and accessories by category — laptops, desktops, components, storage, networking, power and accessories. Genuine stock with warranty and countrywide delivery in Uganda.",
    url: "/categories",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
