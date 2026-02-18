import { fetchProducts } from "../lib/products";
import { CURATED_CATEGORIES } from "../lib/curatedCategories";

export default async function sitemap() {
  const base = "https://reliance.tajallis.com.pk";
  const now = new Date();

  const products = await fetchProducts();

  const categoryEntries = CURATED_CATEGORIES.map((c) => ({
    url: `${base}/c/${c.key}`,
    lastModified: now,
  }));

  const productEntries = products.map((p) => ({
    url: `${base}/p/${p.slug}`,
    lastModified: now,
  }));

  return [{ url: base, lastModified: now }, ...categoryEntries, ...productEntries];
}
