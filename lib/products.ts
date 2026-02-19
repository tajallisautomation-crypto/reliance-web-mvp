import { parseCsv } from "./csv";

export type Product = {
  product_key: string;
  slug: string;

  brand: string;
  category: string;
  type: string; // PRODUCT | SERVICE
  model: string;

  retail_price: number | null;
  cash_floor: number | null;

  warranty: string;
  availability: string;

  tags: string;
  description: string;
  specifications: string;

  image_url_1: string;
  image_url_2: string;

  seo_title?: string;
  seo_description?: string;

  faq_q1?: string; faq_a1?: string;
  faq_q2?: string; faq_a2?: string;
  faq_q3?: string; faq_a3?: string;
};

export function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s|]/g, "")
    .replace(/\s+/g, "-");
}

export function isDirectImageUrl(url?: string) {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.startsWith("http") && (u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".png") || u.endsWith(".webp"));
}

function toNum(v: string) {
  const n = Number(String(v || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function fetchProducts(): Promise<Product[]> {
  const csvUrl = process.env.GOOGLE_FEED_CSV_URL!;
  if (!csvUrl) return [];

  // edge-friendly fetch + revalidate caching
  const res = await fetch(csvUrl, { next: { revalidate: 180 } });
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  const get = (r: string[], name: string) => {
    const i = idx(name);
    return i >= 0 ? (r[i] ?? "") : "";
  };

  const out: Product[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const product_key = String(get(r, "product_key") || get(r, "product_key".toLowerCase()) || "").trim();
    if (!product_key) continue;

    const brand = String(get(r, "brand")).trim();
    const category = String(get(r, "category")).trim();
    const type = String(get(r, "type") || "PRODUCT").trim() || "PRODUCT";
    const model = String(get(r, "model")).trim();

    const p: Product = {
      product_key,
      slug: encodeURIComponent(product_key), // safe slug; matches your existing routes

      brand, category, type, model,

      retail_price: toNum(get(r, "retail_price")),
      cash_floor: toNum(get(r, "cash_floor")),

      warranty: String(get(r, "warranty")).trim(),
      availability: String(get(r, "availability")).trim(),

      tags: String(get(r, "tags")).trim(),
      description: String(get(r, "description")).trim(),
      specifications: String(get(r, "specifications")).trim(),

      image_url_1: String(get(r, "image_url_1")).trim(),
      image_url_2: String(get(r, "image_url_2")).trim(),

      seo_title: String(get(r, "seo_title")).trim(),
      seo_description: String(get(r, "seo_description")).trim(),

      faq_q1: String(get(r, "faq_q1")).trim(),
      faq_a1: String(get(r, "faq_a1")).trim(),
      faq_q2: String(get(r, "faq_q2")).trim(),
      faq_a2: String(get(r, "faq_a2")).trim(),
      faq_q3: String(get(r, "faq_q3")).trim(),
      faq_a3: String(get(r, "faq_a3")).trim()
    };

    out.push(p);
  }

  return out;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchProducts();
  // slug is URL-encoded product_key in this build
  const decoded = decodeURIComponent(slug);
  return products.find(p => p.product_key === decoded) || null;
}
