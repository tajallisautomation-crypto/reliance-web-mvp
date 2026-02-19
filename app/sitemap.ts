import { fetchProducts } from "../lib/products";

export default async function sitemap() {
  const site = process.env.SITE_URL || "https://reliance.tajallis.com.pk";

  const products = await fetchProducts();

  const items = [
    {
      url: site,
      lastModified: new Date(),
    },
  ];

  for (const p of products) {
    let lastMod = new Date();

    if (p.updated_at) {
      const parsed = new Date(p.updated_at);
      if (!isNaN(parsed.getTime())) {
        lastMod = parsed;
      }
    }

    items.push({
      url: `${site}/p/${p.slug}`,
      lastModified: lastMod,
    });
  }

  return items;
}
