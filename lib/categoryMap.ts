export function mapToCuratedCategory(raw: string) {
  const r = String(raw || "").toLowerCase();

  if (r.includes("battery") || r.includes("inverter") || r.includes("solar"))
    return "Solar & Power";

  if (r.includes("air") || r.includes("ac"))
    return "Air Conditioning";

  if (r.includes("washing"))
    return "Washing";

  if (r.includes("refriger") || r.includes("freezer"))
    return "Cooling";

  if (
    r.includes("microwave") ||
    r.includes("robot") ||
    r.includes("blender") ||
    r.includes("kitchen")
  )
    return "Home Appliances";

  return "Other";
}
