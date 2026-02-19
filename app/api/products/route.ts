import { parseCsv } from "../../../lib/csv";
import { curatedKeyFromRawCategory, curatedLabelFromKey } from "../../../lib/categoryMap";
import { slugify, CSV_URL } from "../../../lib/products";

export const runtime = "edge";

function toNum(v: any): number | null {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && !Number.isNaN(n) ? n : null;
}

export async function GET() {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    return Response.json({ ok: true, count: 0, products: [] }, { headers: { "Cache-Control": "s-maxage=180, stale-while-revalidate=600" } });
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = new Map<string, number>();
  headers.forEach((h, i) => idx.set(h, i));
  const get = (r: string[], h: string) => r[idx.get(h) ?? -1] ?? "";

  const seen = new Set<string>();
  const products = [];

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

    products.push({
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

  return Response.json(
    { ok: true, count: products.length, products },
    { headers: { "Cache-Control": "s-maxage=180, stale-while-revalidate=600" } }
  );
}
