import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";
import { share } from "@/lib/seo";

export const metadata: Metadata = share({
  title: "Terms & Conditions",
  description:
    "The terms for shopping, learning, selling and working with Online Tech Uganda: orders, prices, payment, delivery, courses, marketplace vendors and your account.",
  alternates: { canonical: "/terms" },
}, "/terms");

const link = "font-semibold text-brand-600 hover:underline";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          This website is run by <b>{site.legalName}</b>, {site.address}. These terms apply
          whenever you use the site, place an order, register for a course, or sell through our
          marketplace. By doing any of those, you agree to them.
        </p>
        <p>
          They sit alongside our{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>{" "}
          and our{" "}
          <Link href="/returns" className={link}>
            Returns &amp; Refunds
          </Link>{" "}
          policy.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    title: "Orders",
    body: (
      <ul>
        <li>
          Placing an order is an offer to buy. The order is accepted when we confirm it to you, by
          phone, WhatsApp or email.
        </li>
        <li>
          We may decline or cancel an order — for example if an item turns out to be out of stock,
          a price was shown wrongly, or we cannot reach you to confirm. If you have already paid,
          we refund you in full.
        </li>
        <li>Please give a working phone number. We call to confirm before we deliver.</li>
      </ul>
    ),
  },
  {
    id: "prices",
    title: "Prices and products",
    body: (
      <ul>
        <li>Prices are in Uganda Shillings (UGX) and can change without notice.</li>
        <li>The price you pay is the one shown at checkout when you place the order.</li>
        <li>
          We describe and photograph products as accurately as we can. Colours and packaging may
          differ slightly from the pictures, and UK-used or refurbished items may show light signs
          of use.
        </li>
        <li>Discount codes have their own conditions and cannot be exchanged for cash.</li>
      </ul>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    body: (
      <>
        <p>
          You can pay by MTN Mobile Money, Airtel Money, bank transfer or card, or in cash when you
          collect from our shop in Kampala. We deliver orders that have been paid for.
        </p>
        <p>
          Online payments are handled by our payment provider; we never see your card details or
          Mobile Money PIN. Only pay to the numbers and accounts shown on this site. If someone
          asks you to pay to a different number in our name, call us first on {site.phoneDisplay}.
        </p>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery",
    body: (
      <ul>
        <li>
          The delivery fee depends on where you are and is shown at checkout before you confirm.
        </li>
        <li>
          Delivery times are estimates. An order made before 7pm is delivered the same day; one made
          after 7pm is delivered the following day. We confirm the timing with you after you order.
        </li>
        <li>
          Someone must be available to receive the order. Check it on arrival and tell us straight
          away if anything is wrong.
        </li>
        <li>Responsibility for the item passes to you once it has been handed over.</li>
      </ul>
    ),
  },
  {
    id: "returns",
    title: "Returns and warranty",
    body: (
      <p>
        Faulty items and items not as described can be returned within 7 days, and most products
        carry a warranty. The details are in our{" "}
        <Link href="/returns" className={link}>
          Returns &amp; Refunds
        </Link>{" "}
        policy.
      </p>
    ),
  },
  {
    id: "courses",
    title: "Courses and certificates",
    body: (
      <ul>
        <li>
          Course access is for the person who registered. Unlock codes and sign-in details must not
          be shared or sold.
        </li>
        <li>The registration fee is paid once and is non-refundable.</li>
        <li>
          Videos, notes and other course materials belong to us or our instructors. You may use
          them to learn; you may not copy, record or redistribute them.
        </li>
        <li>
          Certificates are issued to learners who complete the course requirements. We may withdraw
          a certificate obtained dishonestly.
        </li>
      </ul>
    ),
  },
  {
    id: "services",
    title: "Websites, software and repairs",
    body: (
      <p>
        Development, IT support and repair work is carried out under the quotation we agree with
        you, which sets the scope, price, deposit and timeline. Where a quotation and these terms
        differ, the quotation applies. Back up your data before handing over a device for repair;
        we take care, but we cannot be responsible for data lost during a repair.
      </p>
    ),
  },
  {
    id: "marketplace",
    title: "Marketplace, vendors and adverts",
    body: (
      <ul>
        <li>
          Products marked as sold by a vendor are offered by that vendor, who is responsible for
          their description, quality and delivery. We help resolve problems, but the sale is
          between you and the vendor.
        </li>
        <li>
          Vendors and advertisers must be genuine businesses, list only goods they are entitled to
          sell, and describe them honestly. We approve listings and adverts before they appear and
          may remove any of them.
        </li>
        <li>Commission and fees are as shown on the vendor and pricing pages when you list.</li>
      </ul>
    ),
  },
  {
    id: "accounts",
    title: "Your account and what you post",
    body: (
      <ul>
        <li>Keep your password to yourself. You are responsible for what is done from your account.</li>
        <li>Give accurate details, and tell us if they change.</li>
        <li>
          In the community, reviews and messages: no abuse, spam, scams, illegal content or other
          people&apos;s private information. We may remove posts and close accounts that break
          this.
        </li>
      </ul>
    ),
  },
  {
    id: "content",
    title: "Our content",
    body: (
      <p>
        The {site.name} name and logo, and the text, photographs and design of this site, belong to
        us or are used with permission. Do not copy them for commercial use without asking.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <>
        <p>
          We are responsible for supplying what you paid for, as described, and for putting it right
          under our returns policy and warranty when we do not.
        </p>
        <p>
          We are not responsible for losses we could not reasonably have foreseen, for loss of data
          or business, or for delays caused by events outside our control, such as network or power
          failures, transport disruption or bad weather. Nothing here takes away rights the law
          gives you as a consumer.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Law and disputes",
    body: (
      <p>
        These terms are governed by the laws of Uganda. If something goes wrong, contact us first
        and we will try to settle it with you directly. Disputes we cannot settle are for the
        courts of Uganda.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms. The version on this page when you place an order is the one that
        applies to that order.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title="Terms & Conditions"
      subtitle="The terms for shopping, learning, selling and working with us."
      updated="5 October 2026"
      sections={sections}
    />
  );
}
