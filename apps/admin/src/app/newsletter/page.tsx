"use client";

import { useCallback, useEffect, useState } from "react";

type Stats = { total: number; active: number; customers: number };
type Sub = { id: number; email: string; name: string; source: string; active: boolean; created_at?: string };

// Ready-made campaigns so a send takes seconds instead of writing from scratch.
const TEMPLATES: { label: string; subject: string; body: string }[] = [
  {
    label: "New arrivals",
    subject: "Fresh stock just landed at Online Tech Uganda 🎉",
    body:
      "<p>We've just added new laptops and accessories to the shop — quality-checked, with warranty and countrywide delivery.</p>" +
      "<p><b>Come see what's new before it goes.</b></p>",
  },
  {
    label: "Discount / offer",
    subject: "Special offer just for you 🔥",
    body:
      "<p>For a limited time we've cut prices across selected laptops, SSDs and accessories.</p>" +
      "<p><b>Grab yours while stock lasts.</b></p>",
  },
  {
    label: "Weekend deals",
    subject: "Weekend deals are live ⚡",
    body:
      "<p>This weekend only — big savings on selected computers and upgrades.</p>" +
      "<p>Free advice on what fits your budget. Just reply or WhatsApp us.</p>",
  },
  {
    label: "Course promo",
    subject: "Learn a new computer skill this month 🎓",
    body:
      "<p>Our computer courses are open — Microsoft Office, Graphic Design, Web Development and more.</p>" +
      "<p>Pay per lesson from UGX 5,000, learn at your own pace, and get a certificate.</p>",
  },
];

export default function NewsletterPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [err, setErr] = useState("");

  // Phone/browser push notification
  const [pushStats, setPushStats] = useState<{ active: number; enabled: boolean } | null>(null);
  const [pTitle, setPTitle] = useState("");
  const [pBody, setPBody] = useState("");
  const [pUrl, setPUrl] = useState("/shop");
  const [pImage, setPImage] = useState("");
  const [pSending, setPSending] = useState(false);
  const [pResult, setPResult] = useState("");
  const [pErr, setPErr] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, l, ps] = await Promise.all([
        fetch("/api/newsletter/stats", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/newsletter", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/push/stats", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (s && typeof s.total === "number") setStats(s);
      if (Array.isArray(l)) setSubs(l);
      if (ps && typeof ps.active === "number") setPushStats(ps);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!subject.trim() || !body.trim()) {
      setErr("Add a subject and a message first.");
      return;
    }
    if (!confirm(`Send this campaign to your subscribers now?`)) return;
    setSending(true);
    setErr("");
    setResult("");
    try {
      const res = await fetch("/api/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body_html: body, include_customers: includeCustomers }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult(`Sent to ${d.sent} of ${d.recipients} recipients${d.failed ? ` · ${d.failed} failed` : ""}.`);
        setSubject("");
        setBody("");
        load();
      } else {
        setErr(d?.detail || "Couldn't send the campaign.");
      }
    } catch {
      setErr("Network problem — please try again.");
    } finally {
      setSending(false);
    }
  }

  async function sendPush() {
    if (!pTitle.trim()) {
      setPErr("Give the notification a title.");
      return;
    }
    if (!confirm(`Send this notification to ${pushStats?.active ?? 0} device(s) now?`)) return;
    setPSending(true);
    setPErr("");
    setPResult("");
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pTitle, body: pBody, url: pUrl, image: pImage }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setPResult(`Delivered to ${d.sent} of ${d.devices} device(s)${d.removed ? ` · ${d.removed} expired` : ""}.`);
        setPTitle("");
        setPBody("");
        setPImage("");
        load();
      } else {
        setPErr(d?.detail || "Couldn't send the notification.");
      }
    } catch {
      setPErr("Network problem — please try again.");
    } finally {
      setPSending(false);
    }
  }

  const cards = [
    { label: "Active subscribers", value: stats?.active ?? 0, icon: "📧" },
    { label: "Total signups", value: stats?.total ?? 0, icon: "👥" },
    { label: "Customer accounts", value: stats?.customers ?? 0, icon: "🛍️" },
    { label: "Push devices", value: pushStats?.active ?? 0, icon: "🔔" },
  ];

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Notifications &amp; Offers</h1>
        <p className="text-sm text-ink-600/60">
          Email everyone who subscribed — new trends, offers and discounts.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="min-w-0 rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs text-ink-600/60">
              <span>{c.icon}</span> {c.label}
            </p>
            <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-ink-600">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Composer */}
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">Write a campaign</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setSubject(t.subject);
                  setBody(t.body);
                }}
                className="rounded-full border border-ink-600/15 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-600"
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm font-semibold text-ink-700">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Fresh stock just landed 🎉"
            className="mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />

          <label className="mt-4 block text-sm font-semibold text-ink-700">
            Message <span className="font-normal text-ink-600/50">(basic HTML allowed)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            placeholder="<p>Tell your customers what's new…</p>"
            className="mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 font-mono text-xs focus:border-brand-500 focus:outline-none"
          />

          <label className="mt-3 flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={includeCustomers}
              onChange={(e) => setIncludeCustomers(e.target.checked)}
              className="accent-[#F15A29]"
            />
            Also send to registered customer accounts
          </label>

          {err && <p className="mt-3 text-sm font-semibold text-red-600">{err}</p>}
          {result && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-green-600">
              ✓ {result}
            </p>
          )}

          <button
            onClick={send}
            disabled={sending}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {sending ? "Sending…" : "📨 Send campaign"}
          </button>
          <p className="mt-2 text-xs text-ink-600/50">
            Every email includes a working unsubscribe link, so you stay out of spam folders.
          </p>
        </section>

        {/* Subscribers */}
        <section className="h-fit rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">Subscribers</h2>
          {subs.length === 0 ? (
            <p className="mt-3 text-sm text-ink-600/60">
              No signups yet. The newsletter box in the storefront footer feeds this list.
            </p>
          ) : (
            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm">
              {subs.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 border-b border-ink-600/5 pb-2">
                  <span className="min-w-0">
                    <span className="block truncate text-ink-700">{s.email}</span>
                    <span className="text-[11px] text-ink-600/45">{s.source}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      s.active ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-600/60"
                    }`}
                  >
                    {s.active ? "Active" : "Left"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Phone / browser push notification */}
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-extrabold text-ink-600">🔔 Phone notification (push)</h2>
            <span className="text-xs text-ink-600/60">
              {pushStats?.enabled
                ? `${pushStats.active} device(s) subscribed`
                : "Push is not switched on yet"}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-600/60">
            Pops up on the shopper&apos;s phone even when your site is closed — tapping it opens the shop.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-ink-700">Title</label>
              <input
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
                placeholder="Checkout, HP deal just for you! 🎉"
                className="mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Opens this page</label>
              <input
                value={pUrl}
                onChange={(e) => setPUrl(e.target.value)}
                placeholder="/shop"
                className="mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <label className="mt-3 block text-sm font-semibold text-ink-700">Message</label>
          <input
            value={pBody}
            onChange={(e) => setPBody(e.target.value)}
            placeholder="Fresh laptops & better discounts. Tap to shop."
            className="mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />

          <label className="mt-3 block text-sm font-semibold text-ink-700">
            Image <span className="font-normal text-ink-600/50">(optional — shows a big picture in the notification)</span>
          </label>
          <input
            value={pImage}
            onChange={(e) => setPImage(e.target.value)}
            placeholder="https://www.onlinetechug.com/products/your-photo.webp"
            className="mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />

          {pErr && <p className="mt-3 text-sm font-semibold text-red-600">{pErr}</p>}
          {pResult && <p className="mt-3 text-sm font-semibold text-green-600">✓ {pResult}</p>}

          <button
            onClick={sendPush}
            disabled={pSending || !pushStats?.enabled}
            className="mt-4 rounded-md bg-ink-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-ink-700 disabled:opacity-50"
          >
            {pSending ? "Sending…" : "🔔 Send notification"}
          </button>
        </section>
      </div>
    </div>
  );
}
