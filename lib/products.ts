import { parseCSV } from "./csv";
import { mapToCuratedCategory } from "./categoryMap";

export type Product = {
  slug: string;
  product_key: string;
  brand: string;
  category: string;
  curated_category: string;
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

export const CSV_URL = "YOUR_CSV_URL";

function toNum(v: any): number | null {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

let _cache: { at: number; products: Product[] } | null = null;

export async function fetchProducts(): Promise<Product[]> {
  if (_cache && Date.now() - _cache.at < 120000) return _cache.products;

  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();

  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const idx = new Map<string, number>();
  headers.forEach((h, i) => idx.set(h, i));
  const get = (r: string[], h: string) => r[idx.get(h) ?? -1] ?? "";

  const out: Product[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];

    const brand = get(r, "brand");
    const model = get(r, "model");

    if (!brand || !model) continue;

    const slugBase = slugify(`${brand} ${model}`);
    const slug = seen.has(slugBase) ? `${slugBase}-${i}` : slugBase;
    seen.add(slug);

    const rawCategory = get(r, "category");

    out.push({
      slug,
      product_key: get(r, "product_key") || model,
      brand,
      model,
      category: rawCategory,
      curated_category: mapToCuratedCategory(rawCategory),
      retail_price: toNum(get(r, "retail_price")),
      minimum_price: toNum(get(r, "cash_floor")),
      availability: get(r, "availability") || "In Stock",
      warranty: get(r, "warranty"),
      image_url_1: get(r, "image_url_1"),
      image_url_2: get(r, "image_url_2"),
      description: get(r, "description"),
      specifications: get(r, "specifications"),
      tags: get(r, "tags"),
    });
  }

  _cache = { at: Date.now(), products: out };
  return out;
}

export async function fetchProductBySlug(slug: string) {
  const products = await fetchProducts();
  return products.find(p => p.slug === slug) || null;
}
