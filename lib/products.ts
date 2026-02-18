import { parseCSV } from "./csv";
import { curatedKeyFromRawCategory, curatedLabelFromKey } from "./categoryMap";

export type Product = {
  slug: string;
  product_key: string;
  brand: string;
  category: string;
  curated_category_key: string;
  curated_category_label: string;
  model: string;

  retail_price: number | null;
  minimum_price: number | null;

  availability: string;
  warranty: string;

  image_url_1: string;
  image_url_2: string;

  description: string;
  specifications: string;
  tags: string;
};

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function toNum(v: any): number | null {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && !Number.isNaN(n) ? n : null;
}

export function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function isDirectImageUrl(url: string) {
  const u = String(url || "").trim();
  return /^https?:\/\//i.test(u) && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(u);
}

let _mem: { at: number; products: Product[] } | null = null;
const MEM_CACHE_MS = 60_000;
const REVALIDATE_SECONDS = 180;

export async function fetchProducts(): Promise<Product[]> {
  // fast in-memory cache inside a warm lambda
  if (_mem && Date.now() - _mem.at < MEM_CACHE_MS) return _mem.products;

  // Next.js data cache with revalidate (Vercel-friendly)
  const res = await fetch(CSV_URL, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  const text = await res.text();
  const rows = parseCSV(text);
  if (rows.length < 2) {
    _mem = { at: Date.now(), products: [] };
    return [];
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = new Map<string, number>();
  headers.forEach((h, i) => idx.set(h, i));
  const get = (r: string[], h: string) => r[idx.get(h) ?? -1] ?? "";

  const out: Product[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const brand = String(get(r, "brand")).trim();
    const model = String(get(r, "model")).trim();
    const category = String(get(r, "category")).trim();

    if (!brand || !model) continue;

    const slugBase = slugify(`${brand} ${model}`);
    const slug = seen.has(slugBase) ? `${slugBase}-${i}` : slugBase;
    seen.add(slug);

    const curated_category_key = curatedKeyFromRawCategory(category);
    const curated_category_label = curatedLabelFromKey(curated_category_key);

    const retail_price = toNum(get(r, "retail_price")) ?? toNum(get(r, "retail")) ?? null;
    const minimum_price =
      toNum(get(r, "cash_floor")) ??
      toNum(get(r, "minimum_price")) ??
      toNum(get(r, "min_price")) ??
      null;

    const availability =
      String(get(r, "availability")).trim() ||
      String(get(r, "availibility")).trim() ||
      "In Stock";

    out.push({
      slug,
      product_key: String(get(r, "product_key") || model).trim(),
      brand,
      model,
      category,
      curated_category_key,
      curated_category_label,
      retail_price,
      minimum_price,
      availability,
      warranty: String(get(r, "warranty")).trim(),
      image_url_1: String(get(r, "image_url_1")).trim(),
      image_url_2: String(get(r, "image_url_2")).trim(),
      description: String(get(r, "description")).trim(),
      specifications: String(get(r, "specifications")).trim(),
      tags: String(get(r, "tags")).trim(),
    });
  }

  _mem = { at: Date.now(), products: out };
  return out;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchProducts();
  const normalized = String(slug).trim().toLowerCase();
  return products.find((p) => p.slug === normalized) || null;
}
