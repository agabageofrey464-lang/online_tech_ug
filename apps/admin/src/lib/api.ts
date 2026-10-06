export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const ugx = (n: number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);

// Cache API responses briefly so admin pages load fast (data is at most ~12s
// stale; status changes update the UI immediately client-side regardless).
export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 12 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Server-side fetch that includes the admin key (for admin-gated endpoints).
export async function apiGetAdmin<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 12 },
      headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type AdminLead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  brand: string;
  condition: string;
  price_ugx: number;
  in_stock: boolean;
  image_url?: string;
};

export type AdminOrder = {
  id: number;
  reference: string;
  customer_name: string;
  phone: string;
  email?: string;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  pesapal_tracking_id?: string;
  created_at?: string;
  risk_level?: "none" | "low" | "medium" | "high";
  risk_reasons?: string[];
  /** "2 x HP EliteBook 840 G6" — lets a reply name what they bought. */
  items_summary?: string;
};

// Format an order timestamp as a short date + time.
export function orderDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export type AdminLesson = { title: string; minutes: number; free?: boolean; youtube?: string | null; preview?: string | null };
export type AdminCourse = {
  id: number;
  slug: string;
  title: string;
  level: string;
  lessons: number;
  hours: number;
  price_ugx: number;
  blurb: string;
  emoji: string;
  unlock_code: string;
  sample_video: string;
  syllabus: AdminLesson[];
  materials: { title: string; file: string }[];
  quiz: { q: string; options: string[]; answer: number }[];
};

export type AdminUnlockCode = {
  id: number;
  code: string;
  course_slug: string;
  note: string;
  redeemed_count: number;
  revoked: boolean;
  used?: boolean;
  email?: string;
  created_at: string;
  last_used: string | null;
};

export type AdminOrderItem = {
  product_slug: string;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type AdminOrderDetail = AdminOrder & {
  email: string;
  delivery_town: string;
  delivery_address: string;
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  created_at?: string;
  items: AdminOrderItem[];
};
