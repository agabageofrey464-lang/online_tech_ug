"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Copy, FileText } from "lucide-react";
import { courses } from "@/lib/data";
import { verifyCoursePayment } from "@/lib/api";
import { enroll, markUnlocked } from "@/lib/learning";

type Phase = "checking" | "successful" | "underpaid" | "failed";

function SuccessInner() {
  const slug = String(useParams().slug || "");
  const params = useSearchParams();
  const txId = params.get("transaction_id");
  const status = params.get("status"); // Flutterwave: "successful" | "cancelled" | "failed"

  const course = courses.find((c) => c.slug === slug);
  const [phase, setPhase] = useState<Phase>("checking");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Flutterwave returns here after checkout. Cancelled/failed never gets a tx id.
    if (!txId || status === "cancelled" || status === "failed") {
      setPhase("failed");
      return;
    }
    let live = true;
    verifyCoursePayment(txId)
      .then((d) => {
        if (!live) return;
        if (d.status === "successful" && d.code) {
          setCode(d.code);
          setPhase("successful");
          // Persist so the notes reader and lessons unlock instantly on return.
          try {
            localStorage.setItem(`otu_notecode_${slug}`, d.code);
          } catch {}
          enroll(slug);
          markUnlocked(slug);
        } else if (d.status === "underpaid") {
          setPhase("underpaid");
        } else {
          setPhase("failed");
        }
      })
      .catch(() => live && setPhase("failed"));
    return () => {
      live = false;
    };
  }, [txId, status, slug]);

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const title = course?.title ?? "your course";

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl rounded-card border border-ink-600/10 bg-white p-8 text-center shadow-sm">
        {phase === "checking" && (
          <>
            <Loader2 className="mx-auto animate-spin text-brand-500" size={44} />
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Confirming your payment…</h1>
            <p className="mt-2 text-sm text-ink-700/70">Just a moment while we verify with the payment provider.</p>
          </>
        )}

        {phase === "successful" && (
          <>
            <CheckCircle2 className="mx-auto text-green-600" size={52} />
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Payment received — you&apos;re in! 🎉</h1>
            <p className="mt-2 text-sm text-ink-700/70">
              <b>{title}</b> is now unlocked. Your personal unlock code (also emailed to you):
            </p>
            <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-2">
              <span className="flex-1 rounded-lg bg-brand-50 py-3 text-center text-2xl font-extrabold tracking-[0.3em] text-brand-600">
                {code}
              </span>
              <button
                onClick={copyCode}
                aria-label="Copy code"
                className="rounded-lg border border-ink-600/20 p-3 text-ink-700 hover:bg-ink-50"
              >
                <Copy size={18} />
              </button>
            </div>
            {copied && <p className="mt-1 text-xs font-semibold text-green-600">Copied!</p>}
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                href={`/learn/${slug}/notes`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
              >
                <FileText size={16} /> Read course notes
              </Link>
              <Link
                href={`/learn/${slug}`}
                className="inline-flex items-center justify-center rounded-md border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50"
              >
                Go to course
              </Link>
            </div>
          </>
        )}

        {phase === "underpaid" && (
          <>
            <XCircle className="mx-auto text-amber-500" size={52} />
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Payment didn&apos;t match the fee</h1>
            <p className="mt-2 text-sm text-ink-700/70">
              We couldn&apos;t confirm the full course fee. If money left your account, contact us and we&apos;ll sort it out right away.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href={`/learn/${slug}`} className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
                Back to course
              </Link>
              <Link href="/contact" className="rounded-md border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50">
                Contact support
              </Link>
            </div>
          </>
        )}

        {phase === "failed" && (
          <>
            <XCircle className="mx-auto text-red-500" size={52} />
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Payment not completed</h1>
            <p className="mt-2 text-sm text-ink-700/70">
              No problem — nothing was charged. You can try again, or register and pay via WhatsApp.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href={`/learn/${slug}`} className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
                Try again
              </Link>
              <Link href="/contact" className="rounded-md border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50">
                Contact support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CourseSuccessPage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-ink-700/60">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
