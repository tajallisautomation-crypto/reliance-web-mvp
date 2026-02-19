import type { MetadataRoute } from "next";
import { fetchProducts } from "../lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://reliance.tajallis.com.pk";
  const products = await fetchProducts();

  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now },
    { url: `${site}/portal`, lastModified: now }
  ];

  for (const p of products) {
    urls.push({ url: `${site}/p/${encodeURIComponent(p.product_key)}`, lastModified: now });
  }

  // category pages (optional)
  const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  for (const c of cats) {
    urls.push({ url: `${site}/c/${encodeURIComponent(c)}`, lastModified: now });
  }

  return urls;
}
