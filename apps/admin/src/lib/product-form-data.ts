// Pure data + types shared by the product form and the server pages that use
// it. Kept OUT of the "use client" component file so server components can
// import these without trying to invoke client code.

export const EMPTY_SPECS = {
  type: "", processor: "", generation: "", ram: "", storage: "", graphics: "",
  display: "", os: "", battery: "", ports: "", build: "", purpose: "", colors: "",
};

export type ProductFormValues = {
  name: string;
  category: string;
  brand: string;
  condition: string;
  price_ugx: string;
  old_price_ugx: string;
  description: string;
  in_stock: boolean;
  image_url: string;
  specs: typeof EMPTY_SPECS;
};

export function emptyValues(): ProductFormValues {
  return {
    name: "", category: "Accessories", brand: "", condition: "Brand New",
    price_ugx: "", old_price_ugx: "", description: "", in_stock: true,
    image_url: "", specs: { ...EMPTY_SPECS },
  };
}
