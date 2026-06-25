export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const ugx = (n: number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  brand: string;
  condition: string;
  price_ugx: number;
  in_stock: boolean;
};

export type AdminOrder = {
  id: number;
  reference: string;
  customer_name: string;
  phone: string;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
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
