// Shared API contract types between web/admin and the FastAPI backend.
// Keep in sync with apps/api/app/schemas. (Phase 2: auto-generate from OpenAPI.)

export interface ProductSpecs {
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
}

export interface Product {
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
  specs: ProductSpecs | null;
}

export interface ContactCreate {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}

export interface ApiHealth {
  status: string;
  version: string;
  service: string;
}
