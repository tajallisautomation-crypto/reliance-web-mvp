import type { Product } from "./products";

export function moneyPKR(n: number | null) {
  if (!n || !Number.isFinite(n)) return "";
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

export function buildLongDescription(p: Product) {
  if (p.description && p.description.length >= 140) return p.description;

  return `${p.brand} ${p.model} is selected for reliable everyday performance and practical ownership in Pakistan.
It offers stable performance, predictable warranty coverage, and WhatsApp-backed support from Tajalli’s Home Collection.`;
}

export function buildUseCase(p: Product) {
  const cat = String(p.curated_category || "").toLowerCase();

  if (cat.includes("solar"))
    return "Ideal for load-shedding protection and solar backup systems.";

  if (cat.includes("air"))
    return "Ideal for bedrooms, lounges, and commercial cooling environments.";

  if (cat.includes("washing"))
    return "Ideal for family households requiring durable wash cycles.";

  if (cat.includes("cooling"))
    return "Ideal for food storage in homes and retail settings.";

  return "Ideal for dependable everyday usage in homes and offices.";
}
