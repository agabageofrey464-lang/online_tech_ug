/**
 * The message writes itself.
 *
 * Picking a template and filling in the blanks is still work, and work that
 * gets skipped when twenty orders come in at once. Each inbox knows what the
 * person asked for and where it has got to, so the reply can be composed from
 * the record itself — naming what they ordered, quoting the reference, the
 * course or the job — leaving one button to press.
 *
 * Everything here is still editable before sending; it is a starting point
 * that happens to be right most of the time, not a script.
 */

export type AutoMessage = { subject: string; body: string };

const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;

const first = (name: string) => (name || "").trim().split(/\s+/)[0] || "there";

/* ── Orders ─────────────────────────────────────────────────────────────── */

export function orderMessage(o: {
  reference: string;
  customer_name: string;
  status: string;
  payment_status: string;
  total: number;
  items_summary?: string;
}): AutoMessage {
  const what = o.items_summary?.trim();
  const bought = what ? `\n\nWhat you ordered: ${what}\nTotal: ${ugx(o.total)}` : `\n\nTotal: ${ugx(o.total)}`;
  const ref = `Order ${o.reference}`;

  switch (o.status) {
    case "pending":
      return {
        subject: `We've received your order ${o.reference}`,
        body:
          `Thank you for your order — we've received it and it's with our team now.${bought}\n\n` +
          `Please call us on the numbers below to confirm your delivery details, and we'll get it moving.`,
      };
    case "confirmed":
      return {
        subject: `Your order ${o.reference} is confirmed`,
        body:
          `Good news — your order is confirmed and we're preparing it now.${bought}\n\n` +
          `Call us to agree a delivery time that suits you.`,
      };
    case "processing":
      return {
        subject: `We're preparing your order ${o.reference}`,
        body:
          `Your order is being prepared and will be ready shortly.${bought}\n\n` +
          `We'll call you the moment it's ready — or call us if you'd like it sooner.`,
      };
    case "shipped":
      return {
        subject: `Your order ${o.reference} is on the way`,
        body:
          `Your order is ready and on its way to you.${bought}\n\n` +
          `Our driver will call you shortly before arriving. Please have payment ready if you chose to pay on delivery.`,
      };
    case "delivered":
      return {
        subject: `Your order ${o.reference} has been delivered`,
        body:
          `Your order has been delivered — thank you for buying from us.${bought}\n\n` +
          `If anything isn't right, call us and we'll put it straight. We'd be glad to see you again.`,
      };
    case "cancelled":
      return {
        subject: `Your order ${o.reference} has been cancelled`,
        body:
          `Your order has been cancelled.${bought}\n\n` +
          `If that wasn't what you expected, please call us — we'd much rather fix it than lose you.`,
      };
    default:
      return {
        subject: `Update on your order ${o.reference}`,
        body: `There's an update on your ${ref.toLowerCase()}.${bought}\n\nCall us and we'll bring you up to date.`,
      };
  }
}

/** When payment is the thing holding an order up, that's the message to send. */
export function orderPaymentMessage(o: {
  reference: string;
  total: number;
  items_summary?: string;
}): AutoMessage {
  const what = o.items_summary?.trim();
  return {
    subject: `About payment for order ${o.reference}`,
    body:
      `We're holding your order${what ? ` for ${what}` : ""}, but we haven't seen your payment come through yet.\n\n` +
      `The total is ${ugx(o.total)}. If you've already paid, call us with the transaction details and we'll check straight away. ` +
      `Otherwise you're welcome to pay on delivery.`,
  };
}

/* ── Job and internship applications ────────────────────────────────────── */

export function applicationMessage(a: {
  name: string;
  status: string;
  job_title?: string;
}): AutoMessage {
  const role = a.job_title?.trim() || "the position you applied for";

  switch (a.status) {
    case "shortlisted":
      return {
        subject: "You've been shortlisted — Online Tech Uganda",
        body:
          `Good news — your application for ${role} has been shortlisted.\n\n` +
          `We'd like to meet you. Reply with a day and time that suits you this week, or call us on the numbers below and we'll arrange it.\n\n` +
          `Please bring your original certificates and a copy of your CV.`,
      };
    case "rejected":
      return {
        subject: "Your application — Online Tech Uganda",
        body:
          `Thank you for applying for ${role}, and for the time you put into it.\n\n` +
          `On this occasion we've taken other candidates forward. We'll keep your details on file and will be in touch if something suitable opens up.\n\n` +
          `We wish you the very best.`,
      };
    case "reviewed":
      return {
        subject: "Your application is being reviewed",
        body:
          `Thank you for applying for ${role}. Your application has been reviewed and is still under consideration.\n\n` +
          `We'll come back to you with a decision shortly. If you'd like to add anything in the meantime, just reply here.`,
      };
    default:
      return {
        subject: "We've received your application",
        body:
          `Thank you for applying for ${role}. We've received your application and it's with our team.\n\n` +
          `We'll be in touch once we've reviewed it. If you have any questions, call us on the numbers below.`,
      };
  }
}

/* ── Course enrolments ──────────────────────────────────────────────────── */

export function enrolmentMessage(e: {
  name: string;
  course: string;
  approved: boolean;
  used?: boolean;
}): AutoMessage {
  if (!e.approved) {
    return {
      subject: `Completing your enrolment — ${e.course}`,
      body:
        `Thank you for registering for ${e.course}. We're holding your place while we confirm your payment.\n\n` +
        `Once it's through we'll activate your access straight away. If you've already paid, call us with the details and we'll check.`,
    };
  }
  return {
    subject: `Your enrolment is approved — ${e.course}`,
    body:
      `Your enrolment for ${e.course} has been approved. Welcome aboard.\n\n` +
      `Your access code has been sent to you separately. Call us to confirm your class times and whether you'll be attending physically or online.`,
  };
}

/* ── Enquiries, quotes and proforma requests ────────────────────────────── */

export function enquiryMessage(l: { name: string; subject?: string }): AutoMessage {
  const about = l.subject?.trim();
  return {
    subject: about ? `Re: ${about}` : "About your enquiry — Online Tech Uganda",
    body:
      `Thank you for getting in touch${about ? ` about ${about.toLowerCase()}` : ""}. We've received your message and someone is looking at it now.\n\n` +
      `We'll come back to you within one working day. If it's urgent, call us on the numbers below and we'll help you straight away.`,
  };
}

/* ── Vendors and freelancers ────────────────────────────────────────────── */

export function partnerMessage(p: {
  name: string;
  approved: boolean;
  kind: "vendor" | "freelancer";
}): AutoMessage {
  const what = p.kind === "vendor" ? "sell on our marketplace" : "appear in our freelancer directory";

  if (p.approved) {
    return {
      subject: "You're approved — Online Tech Uganda",
      body:
        `Your application has been approved — you can now ${what}.\n\n` +
        `You're welcome to start straight away. Call us if you'd like a hand getting set up.`,
    };
  }
  return {
    subject: "About your application — Online Tech Uganda",
    body:
      `Thank you for applying to ${what} with us. Your application is under review.\n\n` +
      `If you can send us your business details and a sample of your work or stock, we'll be able to approve you faster.`,
  };
}

/** The greeting every message opens with, kept in one place. */
export function greet(name: string): string {
  return `Hello ${first(name)},`;
}
