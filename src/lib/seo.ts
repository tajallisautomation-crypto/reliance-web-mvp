import type { Product } from "./products";

export function buildUseCase(p: Product) {
  const cat = String(p.curated_category || p.category || "").toLowerCase();

  if (cat.includes("solar"))
    return "Ideal for load-shedding protection and solar backup systems.";

  if (cat.includes("air"))
    return "Perfect for bedrooms, lounges, and commercial cooling environments.";

  if (cat.includes("washing"))
    return "Suitable for family households needing reliable wash performance.";

  return "Designed for dependable everyday performance with warranty-backed reliability.";
}

export function buildLongDescription(p: Product) {
  if (p.description && p.description.length > 100) return p.description;

  return `${p.brand} ${p.model} is engineered for consistent performance in Pakistan’s market conditions. 
It is designed for voltage stability, durability, and long-term value retention. 
If you want dependable performance with structured after-sales support, this model is a strong choice.`;
}
