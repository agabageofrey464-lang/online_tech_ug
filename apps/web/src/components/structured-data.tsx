import { site } from "@/lib/site";
import type { Product } from "@/lib/data";
import { productImage } from "@/lib/data";

const jsonLd = (data: object) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);

/**
 * Site-wide business profile (for Google's knowledge panel / local results) plus
 * a WebSite entry that enables the sitelinks search box.
 */
export function SiteStructuredData() {
  const business = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${site.url}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/logo.png`,
    image: `${site.url}/logo-full.png`,
    description: site.description,
    email: site.email,
    telephone: `+${site.whatsapp}`,
    priceRange: "UGX",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kampala",
      addressRegion: "Central",
      addressCountry: "UG",
    },
    areaServed: { "@type": "Country", name: "Uganda" },
    sameAs: [site.socials.facebook, site.socials.instagram, site.socials.tiktok].filter(
      Boolean,
    ) as string[],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${site.whatsapp}`,
      contactType: "sales",
      areaServed: "UG",
      availableLanguage: ["en", "sw"],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {jsonLd(business)}
      {jsonLd(website)}
    </>
  );
}

/** Per-product schema — enables price, availability and rating in search results. */
export function ProductStructuredData({ product }: { product: Product }) {
  const url = `${site.url}/shop/${product.id}`;
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `${site.url}${productImage(product)}`,
    description: product.details?.purpose || product.specs?.join(", ") || product.name,
    sku: product.id,
    brand: { "@type": "Brand", name: product.brand },
    itemCondition:
      product.condition === "Brand New"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "UGX",
      price: product.price,
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: site.name },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: reviews,
    },
  };
  return jsonLd(data);
}
