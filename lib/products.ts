import { parseCsv } from "./csv";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

export interface Product {
  product_key: string;
  slug: string;

  brand: string;
  model: string;

  category: string;
  curated_category?: string;

  retail_price?: number;
  minimum_price?: number;

  warranty?: string;
  availability?: string;

  image_url_1?: string;
  image_url_2?: string;

  description?: string;
  specifications?: string;
  tags?: string;
}

/* ============================= */
/* Helpers */
/* ============================= */

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function isDirectImageUrl(url?: string) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp)$/i.test(url);
}

/* This fixes your current error */
export function safeImage(url?: string) {
  if (!url) return null;
  return isDirectImageUrl(url) ? url : null;
}

/* ============================= */
/* Fetch Logic */
/* ============================= */

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCsv(text);

  return rows.map((row: any) => {
    const product_key = row["Product_Key"] || "";
    const brand = row["Brand"] || "";
    const model = row["Model"] || "";
    const rawCategory = row["Category"] || "";

    const slug =
      product_key ||
      slugify(`${brand}-${model}`);

    return {
      product_key,
      slug,
      brand,
      model,
      category: rawCategory,
      curated_category: rawCategory,

      retail_price: Number(row["Retail_Price"]) || undefined,
      minimum_price: Number(row["Minimum_Price"]) || undefined,

      warranty: row["Warranty"] || "",
      availability: row["Availability"] || "",

      image_url_1: row["Image_URL_1"] || "",
      image_url_2: row["Image_URL_2"] || "",

      description: row["Description"] || "",
      specifications: row["Specifications"] || "",
      tags: row["Tags"] || "",
    };
  });
}

export async function fetchProductBySlug(slug: string) {
  const products = await fetchProducts();
  return products.find(p => p.slug === slug) || null;
}
