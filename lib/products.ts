export type Product = {
  product_key: string;
  slug: string;
  brand: string;
  model: string;
  category: string;
  curated_category?: string;
  minimum_price?: number | null;
  retail_price?: number | null;
  warranty?: string | null;
  availability?: string | null;
  tags?: string | null;
  image_url_1?: string | null;
  image_url_2?: string | null;
};

function cleanUrl(u?: string | null) {
  const s = String(u || "").trim();
  if (!s) return "";
  // remove wrapping quotes
  return s.replace(/^['"]|['"]$/g, "").trim();
}

function isDirectImage(url: string) {
  return /\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(url);
}

function tryDriveToDirect(url: string) {
  // Patterns:
  // 1) https://drive.google.com/file/d/<ID>/view?usp=sharing
  // 2) https://drive.google.com/open?id=<ID>
  // 3) https://drive.google.com/uc?id=<ID>&export=download
  const m1 = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (m1?.[1]) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;

  const m2 = url.match(/[?&]id=([^&]+)/i);
  if (m2?.[1] && url.includes("drive.google.com")) {
    return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  }

  return url;
}

export function safeImage(input?: string | null): { isDirect: boolean; src: string } {
  let src = cleanUrl(input);
  if (!src) return { isDirect: false, src: "" };

  // If it’s a Drive link, convert to a direct view URL
  if (/drive\.google\.com/i.test(src)) {
    src = tryDriveToDirect(src);
  }

  // Fix common broken formats
  if (src.startsWith("//")) src = "https:" + src;
  if (!/^https?:\/\//i.test(src) && src.startsWith("www.")) src = "https://" + src;

  // If still not http(s), treat as non-direct
  if (!/^https?:\/\//i.test(src)) return { isDirect: false, src };

  // Direct image?
  if (isDirectImage(src)) return { isDirect: true, src };

  // If Googleusercontent image (often direct even without extension)
  if (/lh3\.googleusercontent\.com/i.test(src)) return { isDirect: true, src };

  return { isDirect: false, src };
}

function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

export function slugify(s: string) {
  return norm(s)
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bestMatch(products: Product[], q: string) {
  const query = norm(q);
  if (!query) return null;
  const exact = products.find(p => norm(`${p.brand} ${p.model}`) === query || norm(p.model) === query);
  if (exact) return exact;

  const scored = products
    .map(p => {
      const hay = norm(`${p.brand} ${p.model} ${p.category} ${p.tags || ""} ${p.curated_category || ""}`);
      const score = hay.includes(query) ? (query.length / Math.max(10, hay.length)) : 0;
      return { p, score };
    })
    .sort((a,b) => b.score - a.score);

  return scored[0]?.score ? scored[0].p : null;
}

export function suggest(products: Product[], q: string, limit = 8) {
  const query = norm(q);
  if (!query) return [];
  const out = products
    .filter(p => norm(`${p.brand} ${p.model} ${p.category} ${p.tags || ""}`).includes(query))
    .slice(0, limit);
  return out;
}
