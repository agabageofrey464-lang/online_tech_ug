// Thin client for the FastAPI backend.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// In the browser, call the same-origin proxy (/_api/* -> API) to avoid CORS.
// On the server, call the API directly.
const base = () =>
  typeof window !== "undefined" ? "/_api" : `${API_URL}/api/v1`;

export type ApiProductSpecs = {
  type: string;
  processor: string;
  generation: string;
  ram: string;
  storage: string;
  graphics: string;
  display: string;
  os: string;
  battery: string;
  ports: string;
  build: string;
  purpose: string;
};

export type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  brand: string;
  condition: string;
  description: string;
  price_ugx: number;
  old_price_ugx: number | null;
  rating: number;
  in_stock: boolean;
  image_url: string;
  specs: ApiProductSpecs | null;
};

export type OrderItemPayload = { slug: string; quantity: number };

export type OrderPayload = {
  customer_name: string;
  phone: string;
  email?: string;
  delivery_town: string;
  delivery_address: string;
  notes?: string;
  // "cash_on_delivery" is legacy — orders taken before we stopped
  // collecting on delivery. It is no longer offered at checkout.
  payment_method: "mtn_momo" | "airtel_money" | "pay_at_shop" | "pesapal" | "cash_on_delivery";
  coupon_code?: string;
  referral_code?: string;
  items: OrderItemPayload[];
};

export type Order = {
  reference: string;
  customer_name: string;
  phone: string;
  email: string;
  delivery_town: string;
  delivery_address: string;
  subtotal: number;
  delivery_fee: number;
  discount?: number;
  coupon_code?: string;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  items: { product_slug: string; name: string; unit_price: number; quantity: number; line_total: number }[];
};

export type CouponResult = { valid: boolean; discount: number; code: string; message: string };

/** Validate a discount code against a cart subtotal. */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const res = await fetch(`${base()}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) return { valid: false, discount: 0, code, message: "Could not check code" };
  return res.json();
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  const res = await fetch(`${base()}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Order failed (${res.status})`);
  }
  return res.json();
}

export async function getOrder(reference: string): Promise<Order> {
  const res = await fetch(`${base()}/orders/${reference}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Order ${reference} not found`);
  return res.json();
}

// Register a learner for a course — the backend auto-issues a PENDING unlock code
// that activates once payment is confirmed. Throws on a network/server error.
export async function registerForCourse(input: {
  course_slug: string;
  name: string;
  phone: string;
  email?: string;
}): Promise<{
  code: string;
  course_slug: string;
  pending: boolean;
  reference?: string;
  emailed?: boolean;
}> {
  const res = await fetch(`${base()}/unlock-codes/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Register failed (${res.status})`);
  return res.json();
}

// Is online payment enabled? Returns which providers are live. Fails safe.
export async function onlinePaymentEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${base()}/payments/online/status`, { cache: "no-store" });
    if (!res.ok) return false;
    return !!(await res.json())?.enabled;
  } catch {
    return false;
  }
}

// Detailed online-payment status (which providers are configured).
export async function onlinePaymentStatus(): Promise<{ enabled: boolean; pesapal: boolean; flutterwave: boolean }> {
  try {
    const res = await fetch(`${base()}/payments/online/status`, { cache: "no-store" });
    if (!res.ok) return { enabled: false, pesapal: false, flutterwave: false };
    const d = await res.json();
    return { enabled: !!d.enabled, pesapal: !!d.pesapal, flutterwave: !!d.flutterwave };
  } catch {
    return { enabled: false, pesapal: false, flutterwave: false };
  }
}

// Start a Pesapal payment for an existing order → returns Pesapal's checkout URL.
export async function initPesapalPayment(reference: string): Promise<{ redirect_url: string; order_tracking_id: string }> {
  const res = await fetch(`${base()}/payments/pesapal/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => null);
    throw new Error(d?.detail || `Couldn't start payment (${res.status})`);
  }
  return res.json();
}

// Verify a Pesapal transaction on return (server checks GetTransactionStatus).
export async function verifyPesapalPayment(orderTrackingId: string, reference: string): Promise<{ status: string; reference: string }> {
  const res = await fetch(
    `${base()}/payments/pesapal/status?order_tracking_id=${encodeURIComponent(orderTrackingId)}&reference=${encodeURIComponent(reference)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Verify failed (${res.status})`);
  return res.json();
}

// Start an online payment for a course. Returns the Flutterwave checkout link
// to redirect the learner to (MTN, Airtel or card).
export async function initCoursePayment(input: {
  course_slug: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<{ link: string }> {
  const res = await fetch(`${base()}/payments/course/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Couldn't start payment (${res.status})`);
  }
  return res.json();
}

// Verify a course payment on return from Flutterwave. On success the server
// returns the now-active unlock code for the course.
export async function verifyCoursePayment(
  transactionId: string,
): Promise<{ status: string; code: string; course_slug: string; course_title?: string }> {
  const res = await fetch(
    `${base()}/payments/course/verify?transaction_id=${encodeURIComponent(transactionId)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Verify failed (${res.status})`);
  return res.json();
}

// A stable per-device id so an unlock code can be bound to the buyer's device
// (stops codes being shared). Generated once and kept in localStorage.
export function deviceToken(): string {
  if (typeof window === "undefined") return "";
  try {
    let t = localStorage.getItem("otu_device");
    if (!t) {
      t = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, "");
      localStorage.setItem("otu_device", t);
    }
    return t;
  } catch {
    return "";
  }
}

export type UnlockResult = { valid: boolean; lesson: number | null; reason: string };

// Verify a learner's unlock code against the backend. Device-bound, so a code
// shared with someone else is rejected. `lesson` is the 1-based lesson it opens
// (null = the whole course). Throws on network error so callers can fall back.
export async function verifyUnlockCode(courseSlug: string, code: string): Promise<UnlockResult> {
  const res = await fetch(`${base()}/unlock-codes/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_slug: courseSlug, code, device_token: deviceToken() }),
  });
  if (!res.ok) throw new Error(`Verify failed (${res.status})`);
  const d = await res.json();
  return { valid: !!d.valid, lesson: d.lesson ?? null, reason: d.reason ?? "" };
}

export type RequestResult = { ok: boolean; reference: string; emailed: boolean };

/**
 * Send a client request — a software brief, a vendor application, a quote.
 *
 * Everything lands as a contact message, so it is recorded, de-duplicated and
 * visible in the admin. The reference that comes back is what the client
 * quotes when they ring us, which is the whole point of not routing these
 * through WhatsApp.
 */
export async function submitRequest(input: {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}): Promise<RequestResult> {
  const res = await fetch("/_api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone,
      email: input.email ?? "",
      subject: input.subject,
      message: input.message,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body?.detail === "string" ? body.detail : "We couldn't send that. Please try again.",
    );
  }
  const d = await res.json();
  return { ok: !!d.ok, reference: d.reference ?? "", emailed: !!d.emailed };
}
