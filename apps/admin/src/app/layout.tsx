import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/admin-shell";
import { Analytics } from "@/components/analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Online Tech Uganda — Admin",
  description: "Admin dashboard for Online Tech Uganda.",
  // Favicon comes from the file-based app/icon.svg (new orbit logo).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <Analytics />
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
