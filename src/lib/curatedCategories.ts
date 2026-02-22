// lib/curatedCategories.ts
export type CuratedCategory = {
  key: string;     // slug
  label: string;   // display name
  blurb: string;   // short description
};

export const CURATED_CATEGORIES: CuratedCategory[] = [
  { key: "solar-power", label: "Solar & Power", blurb: "Inverters, batteries, solar essentials." },
  { key: "air-conditioning", label: "Air Conditioning", blurb: "Split AC, floor standing, cooling." },
  { key: "washing", label: "Washing", blurb: "Washing machines and laundry." },
  { key: "cooling", label: "Cooling", blurb: "Refrigerators and deep freezers." },
  { key: "home-appliances", label: "Home Appliances", blurb: "Kitchen and daily-use appliances." },
  { key: "other", label: "Other", blurb: "Everything else." },
];
