import { site } from "@/lib/site";
import type { Course, Product } from "@/lib/data";
import type { Article } from "@/lib/blog";
import { productImage } from "@/lib/data";

const jsonLd = (data: object) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);

/**
 * Site-wide business profile (for Google's knowledge panel / local results) plus
 * a WebSite entry that enables the sitelinks search box.
 */
/** Every profile that is this business, somewhere else. "#" marks one not set up yet. */
const profiles = Object.values(site.socials).filter((u) => u && u !== "#") as string[];

/**
 * The founder, as a person search engines can connect to the business: a
 * search for his name can then show him as the owner of Online Tech Uganda,
 * and a search for the business can name him. Printed on every page, since a
 * search may land on any of them.
 */
const founder = {
  "@type": "Person",
  "@id": `${site.url}/about#founder`,
  name: site.ceo.name,
  jobTitle: "Founder & CEO",
  description: `${site.ceo.name} is the founder and owner of ${site.name} (onlinetechug.com), also known as ${site.tradingName}, a technology company with its computer shop at Mabirizi Complex, Kampala, and its office at Lubowa, Uganda.`,
  image: `${site.url}/people/agaba-geofrey-founder-online-tech-uganda.jpg`,
  url: `${site.url}/about/agaba-geofrey`,
  mainEntityOfPage: `${site.url}/about/agaba-geofrey`,
  email: site.ceo.email,
  nationality: { "@type": "Country", name: "Uganda" },
  address: { "@type": "PostalAddress", addressLocality: site.locality, addressCountry: "UG" },
  worksFor: { "@id": `${site.url}/#business` },
  knowsAbout: ["Website development", "Mobile application development", "IT support", "Computer hardware", "Software development"],
};

export function SiteStructuredData() {
  const business = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${site.url}/#business`,
    name: site.name,
    alternateName: [site.tradingName, "onlinetechug.com", "Online Tech UG"],
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
      streetAddress: site.street,
      addressLocality: site.locality,
      addressRegion: "Central",
      addressCountry: "UG",
    },
    // The pin of the Google Business Profile, so the two agree.
    geo: { "@type": "GeoCoordinates", ...site.geo },
    hasMap: site.googleMaps,
    founder: { "@id": `${site.url}/about#founder` },
    areaServed: { "@type": "Country", name: "Uganda" },
    currenciesAccepted: "UGX",
    paymentAccepted: "Mobile Money, Cash",
    sameAs: profiles,
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
    publisher: { "@id": `${site.url}/#business` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {jsonLd(business)}
      {jsonLd({ "@context": "https://schema.org", ...founder })}
      {jsonLd(website)}
    </>
  );
}

/**
 * Per-product schema — enables price, availability and rating in search results.
 *
 * The rating is passed in, and is only ever the average of real, approved
 * customer reviews. This used to send Google a review count computed from the
 * product's name, which is exactly what its guidelines forbid and what earns a
 * site a manual penalty. A product with no reviews sends no rating at all.
 */
export function ProductStructuredData({
  product,
  rating,
}: {
  product: Product;
  rating?: { average: number; count: number } | null;
}) {
  const url = `${site.url}/shop/${product.id}`;
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
    ...(rating && rating.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count } }
      : {}),
  };
  return jsonLd(data);
}

/**
 * Course schema — makes each course eligible for Google's course rich results
 * (title, provider and price shown directly in search).
 */
export function CourseStructuredData({ course }: { course: Course }) {
  const url = `${site.url}/learn/${course.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.blurb,
    url,
    provider: {
      "@type": "Organization",
      name: site.name,
      sameAs: site.url,
    },
    inLanguage: "en",
    educationalLevel: course.level,
    teaches: course.syllabus.slice(0, 10).map((l) => l.title),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${course.hours}H`,
      instructor: { "@type": "Organization", name: site.name },
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "UGX",
      price: course.price,
      category: "Paid",
      availability: "https://schema.org/InStock",
    },
  };
  return jsonLd(data);
}

/**
 * BlogPosting schema — helps articles surface in Google Discover and news-style
 * results with the author, date and image attached.
 */
export function ArticleStructuredData({ article }: { article: Article }) {
  const url = `${site.url}/blog/${article.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.date,
    dateModified: article.date,
    articleSection: article.category,
    inLanguage: "en",
    author: { "@type": "Organization", name: article.author || site.name },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
  return jsonLd(data);
}

/**
 * BreadcrumbList — Google replaces the raw URL in results with a readable trail
 * (Home › Shop › Laptops), which lifts click-through.
 */
export function BreadcrumbStructuredData({ items }: { items: { name: string; href: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", href: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.href === "/" ? "" : it.href}`,
    })),
  };
  return jsonLd(data);
}
