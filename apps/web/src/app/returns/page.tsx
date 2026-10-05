import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "When you can return an item bought from Online Tech Uganda, how to arrange it, how refunds are paid, and how warranty claims work.",
  alternates: { canonical: "/returns" },
};

const sections: LegalSection[] = [
  {
    id: "when",
    title: "When you can return an item",
    body: (
      <>
        <p>
          You can return an item within <b>7 days</b> of receiving it if it is <b>faulty</b> or{" "}
          <b>not as described</b> on its product page.
        </p>
        <p>
          Check your order when it arrives. If you collect from our shop in Kampala, you can inspect
          and test the item before you pay.
        </p>
      </>
    ),
  },
  {
    id: "not-returnable",
    title: "What cannot be returned",
    body: (
      <ul>
        <li>Items damaged after delivery, including drops, liquid and power-surge damage.</li>
        <li>Items with missing parts, accessories or packaging that came with them.</li>
        <li>Items that have been opened up, repaired or modified by someone else.</li>
        <li>Software, licence keys and other digital goods once they have been delivered.</li>
        <li>Items returned after the 7 days, unless the fault is covered by warranty.</li>
      </ul>
    ),
  },
  {
    id: "how",
    title: "How to return",
    body: (
      <>
        <ul>
          <li>
            Call or WhatsApp {site.phoneDisplay} with your <b>order reference</b> and a short
            description of the problem. A photo or video helps.
          </li>
          <li>We will tell you whether to bring the item to our shop or how we will collect it.</li>
          <li>
            Send it back with everything it came with — charger, cables, box and any free gifts.
          </li>
          <li>We inspect and test the item, and tell you the outcome.</li>
        </ul>
        <p>
          You can find your order reference in your confirmation message or on the{" "}
          <Link href="/track" className="font-semibold text-brand-600 hover:underline">
            order tracking page
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds, repairs and replacements",
    body: (
      <>
        <p>
          Once a return is approved, we will <b>repair</b> the item, <b>replace</b> it, or{" "}
          <b>refund</b> you. Where a replacement is not in stock, we refund.
        </p>
        <p>
          Refunds go back to your Mobile Money number or the payment method you used, usually
          within a few days of approval. The delivery fee is refunded when the return is because of
          our mistake or a fault.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    title: "Warranty",
    body: (
      <>
        <p>
          Most items carry a warranty. New devices carry the manufacturer&apos;s warranty; UK-used
          and refurbished devices carry our shop warranty. The cover for each product is shown on
          its page — ask us if it is not clear before you buy.
        </p>
        <p>
          Warranty covers faults in the device itself. It does not cover physical or liquid damage,
          power-surge damage, normal wear such as battery ageing, or problems caused by software you
          installed.
        </p>
      </>
    ),
  },
  {
    id: "cancel",
    title: "Cancelling an order",
    body: (
      <p>
        You can cancel an order that has not yet been dispatched. Contact us on WhatsApp with your
        order reference; if you have already paid, we refund the full amount.
      </p>
    ),
  },
  {
    id: "courses-services",
    title: "Courses and services",
    body: (
      <ul>
        <li>
          <b>Courses:</b> the registration fee is paid once and is non-refundable. Tuition already
          paid for lessons you have not yet been given access to can be refunded on request.
        </li>
        <li>
          <b>Websites, apps, software and repairs:</b> deposits pay for work as it is done. If a
          project is cancelled, work completed up to that point is charged and the rest is
          refunded, as set out in your quotation.
        </li>
      </ul>
    ),
  },
];

export default function ReturnsPage() {
  return (
    <LegalPage
      path="/returns"
      title="Returns & Refunds"
      subtitle="When an item can come back, how to arrange it, and how you get your money."
      updated="5 October 2026"
      sections={sections}
    />
  );
}
