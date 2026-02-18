import { parseCSV } from "./csv";

export type Product = {
  product_key: string;
  brand: string;
  category: string;
  model: string;
  retail_price: number | null;
  minimum_price: number | null;
  warranty: string;
  availability: string;
  image_url_1: string;
  image_url_2: string;
  description: string;
  specifications: string;
  tags: string;
  updated_at: string;
};

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function toNum(v: any): number | null {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && !Number.isNaN(n) ? n : null;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();

  const rows = parseCSV(text);
  const headers = rows[0].map(h => h.trim().toLowerCase());

  const idx = new Map<string, number>();
  headers.forEach((h, i) => idx.set(h, i));

  const get = (r: string[], h: string) => r[idx.get(h) ?? -1] ?? "";

  const out: Product[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];

    const product_key = String(get(r, "product_key") || get(r, "model")).trim();
    if (!product_key) continue;

    out.push({
      product_key,
      brand: String(get(r, "brand")).trim(),
      category: String(get(r, "category")).trim(),
      model: String(get(r, "model")).trim(),
      retail_price: toNum(get(r, "retail_price")),
      minimum_price: toNum(get(r, "cash_floor")),
      warranty: String(get(r, "warranty")).trim(),
      availability: String(get(r, "availability")).trim(),
      image_url_1: String(get(r, "image_url_1")).trim(),
      image_url_2: String(get(r, "image_url_2")).trim(),
      description: String(get(r, "description")).trim(),
      specifications: String(get(r, "specifications")).trim(),
      tags: String(get(r, "tags")).trim(),
      updated_at: String(get(r, "updated_at")).trim(),
    });
  }

  return out;
}

export async function fetchProductByKey(key: string): Promise<Product | null> {
  const products = await fetchProducts();
  const normalized = decodeURIComponent(key).trim().toLowerCase();

  return (
    products.find(p =>
      String(p.product_key)
        .trim()
        .toLowerCase() === normalized
    ) || null
  );
}

export function isDirectImageUrl(url: string) {
  const u = String(url || "").trim();
  return /^https?:\/\//i.test(u) && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(u);
}
export function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove special characters like |
    .replace(/\s+/g, "-")     // spaces to dashes
    .replace(/-+/g, "-")      // remove duplicate dashes
    .trim();
}
