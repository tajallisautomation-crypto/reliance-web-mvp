// lib/categoryMap.ts
import { CURATED_CATEGORIES } from "./curatedCategories";

export function curatedKeyFromRawCategory(raw: string) {
  const r = String(raw || "").toLowerCase();

  if (r.includes("battery") || r.includes("inverter") || r.includes("solar")) return "solar-power";
  if (r.includes("air") || r.includes("ac")) return "air-conditioning";
  if (r.includes("washing")) return "washing";
  if (r.includes("refriger") || r.includes("freezer")) return "cooling";
  if (r.includes("microwave") || r.includes("robot") || r.includes("blender") || r.includes("kitchen")) return "home-appliances";

  return "other";
}

export function curatedLabelFromKey(key: string) {
  return CURATED_CATEGORIES.find(c => c.key === key)?.label || "Other";
}
