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
  payment_method: "cash_on_delivery" | "mtn_momo" | "airtel_money";
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
}): Promise<{ code: string; course_slug: string; pending: boolean }> {
  const res = await fetch(`${base()}/unlock-codes/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Register failed (${res.status})`);
  return res.json();
}

// Verify a learner's course unlock code against the backend. Throws on a
// network/server error so callers can fall back to a local check if offline.
export async function verifyUnlockCode(courseSlug: string, code: string): Promise<boolean> {
  const res = await fetch(`${base()}/unlock-codes/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_slug: courseSlug, code }),
  });
  if (!res.ok) throw new Error(`Verify failed (${res.status})`);
  const data = (await res.json()) as { valid: boolean };
  return data.valid;
}
