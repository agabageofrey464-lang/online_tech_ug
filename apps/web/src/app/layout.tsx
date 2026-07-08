import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AiAssistant } from "@/components/ai-assistant";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { RecentlyViewedProvider } from "@/lib/recently-viewed";
import { CartDrawer } from "@/components/cart-drawer";
import { CartToast } from "@/components/cart-toast";
import { site } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Computers, Web, Software, IT Support & Courses`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "computers Uganda",
    "laptops Kampala",
    "website development Uganda",
    "IT support Uganda",
    "computer courses Uganda",
    "online tech uganda",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_UG",
    type: "website",
    images: [{ url: "/logo.jpeg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/logo.jpeg"] },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
              <WhatsAppButton />
              <AiAssistant />
              <CartDrawer />
              <CartToast />
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
