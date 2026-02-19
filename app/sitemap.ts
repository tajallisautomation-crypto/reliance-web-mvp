import type { MetadataRoute } from "next";
import { fetchProducts } from "../lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL || "https://reliance.tajallis.com.pk";
  const products = await fetchProducts();

  const items: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: new Date() },
  ];

  for (const p of products) {
    items.push({
      url: `${site}/p/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    });
  }

  return items;
}
