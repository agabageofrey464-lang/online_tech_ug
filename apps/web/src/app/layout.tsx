import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AiAssistant } from "@/components/ai-assistant";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { RecentlyViewedProvider } from "@/lib/recently-viewed";
import { CartDrawer } from "@/components/cart-drawer";
import { CartToast } from "@/components/cart-toast";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ReferralCapture } from "@/components/referral-capture";
import { Analytics } from "@/components/analytics";
import { GoogleTranslate } from "@/components/google-translate";
import { site } from "@/lib/site";

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
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/logo.png"] },
  // Favicon comes from the file-based app/icon.svg (new orbit logo).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Analytics />
        <GoogleTranslate />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <ReferralCapture />
                <SiteHeader />
                <main className="pb-14 md:pb-0">{children}</main>
                <SiteFooter />
                <WhatsAppButton />
                <AiAssistant />
                <CartDrawer />
                <CartToast />
                <MobileTabBar />
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
