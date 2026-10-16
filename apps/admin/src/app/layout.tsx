import type { Metadata } from "next";
import { EB_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/admin-shell";
import { Analytics } from "@/components/analytics";

// The storefront's two faces, so the dashboard reads as the same company:
// a clean sans for everything, the serif for page titles.
const sans = Jost({ subsets: ["latin"], variable: "--font-sans-face", display: "swap" });
const serif = EB_Garamond({ subsets: ["latin"], variable: "--font-serif-face", display: "swap" });

export const metadata: Metadata = {
  title: "Online Tech Uganda — Admin",
  description: "Admin dashboard for Online Tech Uganda.",
  // Favicon comes from the file-based app/icon.svg (new orbit logo).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen">
        <Analytics />
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
