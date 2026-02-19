import { parseCsv } from "./csv";

export const CSV_URL =
  process.env.WEBSITE_FEED_CSV_URL ||
  "PUT_YOUR_PUBLISHED_WEBSITE_FEED_CSV_URL_HERE";

export interface Product {
  product_key: string;
  slug: string;

  brand: string;
  model: string;
  category: string;

  cost_price?: number;
  minimum_price?: number;
  retail_price?: number;
  cash_floor?: number;

  credit_3m_total?: number;
  credit_3m_monthly?: number;
  credit_6m_total?: number;
  credit_6m_monthly?: number;
  credit_12m_total?: number;
  credit_12m_monthly?: number;

  availability?: string;

  warranty?: string;
  tags?: string;
  description?: string;
  specifications?: string;

  image_url_1?: string;
  image_url_2?: string;

  publish_status?: string;
  missing_fields?: string;

  updated_at?: string;
}

export type SafeImage = { src: string; isDirect: boolean };

export function slugify(v: string) {
  return encodeURIComponent(
    v.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-|]+/g, "")
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
  return { src, isDirect: isDirectImageUrl(src) };
}

function toNum(v: any): number | undefined {
  const s = String(v ?? "").replace(/,/g, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function suggest(products: Product[], query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products
    .filter((p) =>
      `${p.brand} ${p.model} ${p.category} ${p.tags}`.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export function bestMatch(products: Product[], query: string): Product | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    products.find((p) => `${p.brand} ${p.model}`.toLowerCase() === q) ||
    products.find((p) =>
      `${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(q)
    ) ||
    null
  );
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCsv(text);

  const all = rows
    .map((row: any) => {
      const product_key = String(row["Product_Key"] || "").trim();
      if (!product_key) return null;

      const publish = String(row["Publish_Status"] || "").trim().toUpperCase();

      return {
        product_key,
        slug: slugify(product_key),
        brand: String(row["Brand"] || "").trim(),
        category: String(row["Category"] || "").trim(),
        model: String(row["Model"] || "").trim(),

        cost_price: toNum(row["Cost_Price"]),
        minimum_price: toNum(row["Minimum_Price"]),
        retail_price: toNum(row["Retail_Price"]),
        cash_floor: toNum(row["Cash_Floor"]),

        credit_3m_total: toNum(row["Credit_3M_Total"]),
        credit_3m_monthly: toNum(row["Credit_3M_Monthly"]),
        credit_6m_total: toNum(row["Credit_6M_Total"]),
        credit_6m_monthly: toNum(row["Credit_6M_Monthly"]),
        credit_12m_total: toNum(row["Credit_12M_Total"]),
        credit_12m_monthly: toNum(row["Credit_12M_Monthly"]),

        availability: String(row["Availability"] || "").trim(),

        warranty: String(row["Warranty"] || "").trim(),
        tags: String(row["Tags"] || "").trim(),
        description: String(row["Description"] || "").trim(),
        specifications: String(row["Specifications"] || "").trim(),

        image_url_1: String(row["Image_URL_1"] || "").trim(),
        image_url_2: String(row["Image_URL_2"] || "").trim(),

        publish_status: publish,
        missing_fields: String(row["Missing_Fields"] || "").trim(),
        updated_at: String(row["Updated_At"] || "").trim() || undefined,
      } as Product;
    })
    .filter(Boolean) as Product[];

  // Only LIVE products appear anywhere
  return all.filter((p) => String(p.publish_status || "").toUpperCase() === "LIVE");
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchProducts();
  const decoded = decodeURIComponent(slug);
  return products.find((p) => p.slug === slug || p.product_key === decoded) || null;
}
