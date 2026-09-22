import Link from "next/link";

/**
 * Cross-links between the parts of the business.
 *
 * Someone reading about a laptop may well also want a repair, a course or a
 * developer — and search engines read these links as the sitemap of what the
 * site actually covers. Each destination is described in a sentence rather
 * than dropped in as a bare link.
 */

type Item = { href: string; icon: string; title: string; body: string };

const ALL: Item[] = [
  { href: "/shop", icon: "🛒", title: "Shop Computers", body: "Laptops, desktops, SSDs and accessories with warranty." },
  { href: "/learn", icon: "🎓", title: "Computer Courses", body: "22 courses, physical or online, with a certificate." },
  { href: "/services", icon: "🛠", title: "IT Services", body: "Websites, software, repairs and IT support." },
  { href: "/jobs", icon: "💼", title: "Internships & Jobs", body: "Industrial training for university students." },
  { href: "/marketplace", icon: "🏪", title: "Marketplace", body: "Buy from other trusted vendors in Uganda." },
  { href: "/freelancers", icon: "👩‍💻", title: "Hire Freelancers", body: "Vetted Ugandan designers and developers." },
  { href: "/blog", icon: "📰", title: "Tech Blog", body: "Buying guides and practical tech advice." },
  { href: "/community", icon: "💬", title: "Student Community", body: "Ask questions, get answers from our trainers." },
];

export function ExploreMore({
  title = "Explore more of Online Tech Uganda",
  /** Routes to leave out — usually the page you're already on. */
  exclude = [],
  limit = 4,
}: {
  title?: string;
  exclude?: string[];
  limit?: number;
}) {
  const items = ALL.filter((i) => !exclude.includes(i.href)).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="container-page py-10">
      <h2 className="text-lg font-extrabold text-ink-900">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="group rounded-card border border-ink-600/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl" aria-hidden>
              {i.icon}
            </span>
            <p className="mt-1.5 font-bold text-ink-900 group-hover:text-brand-600">{i.title}</p>
            <p className="text-sm text-ink-700/70">{i.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
