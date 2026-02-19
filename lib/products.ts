export type Product = {
  product_key: string;
  slug: string;
  brand: string;
  category: string;
  model: string;
  retail_price: number | null;
  cash_floor: number | null;
  warranty: string;
  tags: string;
  description: string;
  specifications: string;
  image_url_1: string;
  image_url_2: string;
  availability: string;
  updated_at: string;
};

const CSV_URL =
  process.env.WEBSITE_FEED_CSV_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function norm(s: any) {
  return String(s ?? "").trim();
}

function toNum(s: any): number | null {
  const v = String(s ?? "").replace(/,/g, "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function slugify(s: string) {
  return encodeURIComponent(
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/%/g, "")
  );
}

// CSV parsing with quotes support (minimal, robust enough for Sheets export)
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      // escaped quotes ""
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cur);
      cur = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      // ignore empty trailing row
      if (row.some((c) => String(c).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  if (row.some((c) => String(c).trim() !== "")) rows.push(row);

  return rows;
}

function headerIndex(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => (map[h.toLowerCase().trim()] = i));
  return (name: string) => map[name.toLowerCase().trim()];
}

export function isDirectImageUrl(url: string) {
  const u = (url || "").trim().toLowerCase();
  return (
    u.startsWith("http://") ||
    u.startsWith("https://")
  ) && (u.includes(".jpg") || u.includes(".jpeg") || u.includes(".png") || u.includes(".webp"));
}

// build a "best effort" thumbnail url for google images links (not perfect, but safe)
// If url is NOT a direct image, we will show placeholder + "open image search"
export function safeImage(url: string) {
  const u = (url || "").trim();
  if (!u) return { src: "", isDirect: false };
  return { src: u, isDirect: isDirectImageUrl(u) };
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(CSV_URL, {
    cache: "no-store",
    // Next 14 supports revalidate in fetch options via next:
    // but we avoid caching at server because your feed can change frequently
  });

  const text = await res.text();
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const headers = rows[0].map((h) => String(h || "").trim());
  const idx = headerIndex(headers);

  // accept either Availability or Availibility (your earlier typo)
  const availabilityKey =
    idx("availability") !== undefined ? "availability" : "availibility";

  const out: Product[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    const product_key = norm(row[idx("product_key")]);
    if (!product_key) continue;

    const brand = norm(row[idx("brand")]);
    const category = norm(row[idx("category")]);
    const model = norm(row[idx("model")]);

    const retail_price = toNum(row[idx("retail_price")]);
    const cash_floor = toNum(row[idx("cash_floor")]);

    const warranty = norm(row[idx("warranty")]);
    const tags = norm(row[idx("tags")]);
    const description = norm(row[idx("description")]);
    const specifications = norm(row[idx("specifications")]);
    const image_url_1 = norm(row[idx("image_url_1")]);
    const image_url_2 = norm(row[idx("image_url_2")]);

    const availability = norm(row[idx(availabilityKey)]) || "In Stock";
    const updated_at = norm(row[idx("updated_at")]);

    const slug = slugify(product_key);

    out.push({
      product_key,
      slug,
      brand,
      category,
      model,
      retail_price,
      cash_floor,
      warranty,
      tags,
      description,
      specifications,
      image_url_1,
      image_url_2,
      availability,
      updated_at,
    });
  }

  return out;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchProducts();
  const decoded = decodeURIComponent(slug);
  const found = products.find((p) => p.product_key === decoded);
  return found || null;
}

export function bestMatch(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // scoring: exact key, exact model, prefix, includes, tag hit
  let best: { p: Product; score: number } | null = null;

  for (const p of products) {
    const hay = `${p.product_key} ${p.brand} ${p.model} ${p.category} ${p.tags}`.toLowerCase();
    let score = 0;

    if (p.product_key.toLowerCase() === q) score += 1000;
    if (`${p.brand} ${p.model}`.toLowerCase() === q) score += 700;
    if (p.model.toLowerCase() === q) score += 650;

    if (hay.startsWith(q)) score += 300;
    if (hay.includes(q)) score += 120;

    // token bonus
    const tokens = q.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      if (p.brand.toLowerCase() === t) score += 35;
      if (p.category.toLowerCase() === t) score += 25;
      if (p.model.toLowerCase().includes(t)) score += 18;
      if (p.tags.toLowerCase().includes(t)) score += 12;
    }

    if (!best || score > best.score) best = { p, score };
  }

  return best?.p || null;
}

export function suggest(products: Product[], query: string, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = products
    .map((p) => {
      const hay = `${p.brand} ${p.model} ${p.category} ${p.tags}`.toLowerCase();
      let score = 0;
      if (hay.startsWith(q)) score += 50;
      if (hay.includes(q)) score += 20;

      const tokens = q.split(/\s+/).filter(Boolean);
      for (const t of tokens) {
        if (p.model.toLowerCase().includes(t)) score += 6;
        if (p.brand.toLowerCase().includes(t)) score += 5;
        if (p.category.toLowerCase().includes(t)) score += 3;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);

  return scored;
}
