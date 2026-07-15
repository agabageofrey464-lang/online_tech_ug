"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Copy, Check, Share2, Users } from "lucide-react";
import { useAuth, authFetch } from "@/lib/auth";
import { ugx } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Sale = {
  referred_name: string;
  order_reference: string;
  order_total: number;
  reward: number;
  status: string;
};
type Summary = {
  code: string;
  reward_rate: number;
  count: number;
  total_earned: number;
  paid: number;
  pending: number;
  referrals: Sale[];
};

export default function ReferPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/refer");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/referrals/me");
      if (res.ok) setData(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (loading || !user) {
    return <div className="container-page py-16 text-center text-ink-700/50">Loading…</div>;
  }

  const link =
    typeof window !== "undefined" && data ? `${window.location.origin}/?ref=${data.code}` : "";

  function copy() {
    if (!link) return;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const rate = data ? Math.round(data.reward_rate * 100) : 3;

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "My account", href: "/account" }, { label: "Refer & Earn" }]} />
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
          <Gift size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Refer &amp; Earn</h1>
          <p className="text-sm text-ink-700/60">Earn {rate}% of every order made by someone you refer.</p>
        </div>
      </div>

      {/* Share card */}
      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-ink-900"><Share2 size={18} className="text-brand-600" /> Your referral link</h2>
        <p className="mt-1 text-sm text-ink-700/60">Share this link. When a friend orders, you earn a reward.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center rounded-md border border-ink-600/15 bg-ink-50 px-3 py-2.5">
            <span className="truncate text-sm text-ink-800">{link || "…"}</span>
          </div>
          <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
            {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy link</>}
          </button>
        </div>
        <p className="mt-3 text-sm text-ink-700/70">
          Or share your code: <span className="rounded bg-brand-50 px-2 py-0.5 font-mono font-bold text-brand-700">{data?.code ?? "…"}</span>
        </p>
      </section>

      {/* Earnings */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "People referred", value: String(data?.count ?? 0), icon: Users },
          { label: "Total earned", value: ugx(data?.total_earned ?? 0), icon: Gift, accent: true },
          { label: "Paid to you", value: ugx(data?.paid ?? 0) },
          { label: "Pending", value: ugx(data?.pending ?? 0) },
        ].map((s) => (
          <div key={s.label} className={`rounded-card border p-5 shadow-sm ${s.accent ? "border-brand-200 bg-brand-50" : "border-ink-600/10 bg-white"}`}>
            <p className="text-lg font-extrabold text-ink-900">{s.value}</p>
            <p className="text-xs font-semibold text-ink-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-extrabold text-ink-900">Your referrals</h2>
        {!data || data.referrals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-600/20 p-10 text-center">
            <Users className="mx-auto text-ink-700/30" size={32} />
            <p className="mt-2 text-sm font-semibold text-ink-700">No referrals yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-ink-700/60">Share your link — you earn when your friends shop.</p>
            <Link href="/shop" className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600">Start sharing</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-700/50">
                  <th className="py-2 pr-3 font-semibold">Friend</th>
                  <th className="py-2 pr-3 font-semibold">Order</th>
                  <th className="py-2 pr-3 text-right font-semibold">Order total</th>
                  <th className="py-2 pr-3 text-right font-semibold">You earn</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((r, i) => (
                  <tr key={`${r.order_reference}-${i}`} className="border-b border-ink-600/5">
                    <td className="py-2 pr-3 text-ink-800">{r.referred_name}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-ink-700/70">{r.order_reference}</td>
                    <td className="py-2 pr-3 text-right text-ink-800">{ugx(r.order_total)}</td>
                    <td className="py-2 pr-3 text-right font-bold text-green-700">{ugx(r.reward)}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${r.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
