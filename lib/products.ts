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

function normKey(v: string) {
  return String(v || "").trim();
}

export function isDirectImageUrl(url: string) {
  const u = String(url || "").trim();
  return /^https?:\/\//i.test(u) && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(u);
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

    const product_key = normKey(get(r, "product_key")) || normKey(get(r, "model"));
    if (!product_key) continue;

    out.push({
      product_key,
      brand: normKey(get(r, "brand")),
      category: normKey(get(r, "category")),
      model: normKey(get(r, "model")),
      retail_price: toNum(get(r, "retail_price")),
      minimum_price: toNum(get(r, "cash_floor")), // your feed uses Cash_Floor
      warranty: normKey(get(r, "warranty")),
      availability: normKey(get(r, "availability")) || "In Stock",
      image_url_1: normKey(get(r, "image_url_1")),
      image_url_2: normKey(get(r, "image_url_2")),
      description: normKey(get(r, "description")),
      specifications: normKey(get(r, "specifications")),
      tags: normKey(get(r, "tags")),
      updated_at: normKey(get(r, "updated_at")),
    });
  }

  return out;
}

export async function fetchProductByKey(key: string): Promise<Product | null> {
  const products = await fetchProducts();

  const normalized = decodeURIComponent(key).trim().toLowerCase();

  return (
    products.find(p =>
      String(p.product_key || "")
        .trim()
        .toLowerCase() === normalized
    ) || null
  );
}
: Promise<Product | null> {
  const products = await fetchProducts();
  return products.find(p => p.product_key === key) || null;
}
