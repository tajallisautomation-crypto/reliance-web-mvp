import { parseCsv } from "./csv";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

/* ===================================================== */
/* TYPES */
/* ===================================================== */

export interface Product {
  product_key: string;
  slug: string;

  brand: string;
  model: string;

  category: string;
  curated_category?: string;

  retail_price?: number;
  minimum_price?: number;

  warranty?: string;
  availability?: string;

  image_url_1?: string;
  image_url_2?: string;

  description?: string;
  specifications?: string;
  tags?: string;

  updated_at?: string;
}

export type SafeImage = {
  src: string;
  isDirect: boolean;
};

/* ===================================================== */
/* BASIC HELPERS */
/* ===================================================== */

export function slugify(value: string) {
  return encodeURIComponent(
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-|]+/g, "")
      .replace(/-+/g, "-")
  );
}

export function isDirectImageUrl(url?: string) {
  if (!url) return false;
  const u = url.trim().toLowerCase();
  if (!(u.startsWith("http://") || u.startsWith("https://"))) return false;
  return /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(u);
}

export function safeImage(url?: string): SafeImage {
  const src = String(url || "").trim();
  return {
    src,
    isDirect: isDirectImageUrl(src),
  };
}

/* ===================================================== */
/* SEARCH + MATCH LOGIC (FIX FOR YOUR ERROR) */
/* ===================================================== */

export function suggest(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return products
    .filter(p =>
      `${p.brand} ${p.model} ${p.category} ${p.tags}`
        .toLowerCase()
        .includes(q)
    )
    .slice(0, 6);
}

export function bestMatch(products: Product[], query: string): Product | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exact = products.find(p =>
    `${p.brand} ${p.model}`.toLowerCase() === q
  );

  if (exact) return exact;

  const partial = products.find(p =>
    `${p.brand} ${p.model} ${p.category}`
      .toLowerCase()
      .includes(q)
  );

  return partial || null;
}

/* ===================================================== */
/* FETCH LOGIC */
/* ===================================================== */

function toNum(v: any): number | undefined {
  const s = String(v ?? "").replace(/,/g, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCsv(text);

  return rows
    .map((row: any) => {
      const product_key = String(row["Product_Key"] || "").trim();
      if (!product_key) return null;

      const brand = String(row["Brand"] || "").trim();
      const model = String(row["Model"] || "").trim();
      const rawCategory = String(row["Category"] || "").trim();

      const slug = slugify(product_key);

      const availability =
        String(row["Availability"] || row["Availibility"] || "").trim() ||
        "In Stock";

      return {
        product_key,
        slug,
        brand,
        model,
        category: rawCategory,
        curated_category: rawCategory,

        retail_price: toNum(row["Retail_Price"]),
        minimum_price: toNum(row["Minimum_Price"]),

        warranty: String(row["Warranty"] || "").trim(),
        availability,

        image_url_1: String(row["Image_URL_1"] || "").trim(),
        image_url_2: String(row["Image_URL_2"] || "").trim(),

        description: String(row["Description"] || "").trim(),
        specifications: String(row["Specifications"] || "").trim(),
        tags: String(row["Tags"] || "").trim(),

        updated_at: String(row["Updated_At"] || "").trim() || undefined,
      } as Product;
    })
    .filter(Boolean) as Product[];
}

export async function fetchProductBySlug(
  slug: string
): Promise<Product | null> {
  const products = await fetchProducts();
  const decoded = decodeURIComponent(slug);

  return (
    products.find(p => p.slug === slug) ||
    products.find(p => p.product_key === decoded) ||
    null
  );
}
