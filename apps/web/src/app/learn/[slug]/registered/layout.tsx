import type { Metadata } from "next";

// A receipt or a gated page is meaningless to somebody arriving from a search
// result, so it is kept out of the index rather than given a title.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
