import { fetchProducts } from "../../../lib/products";
import CatalogClient from "../../../components/CatalogClient";
import { CURATED_CATEGORIES } from "../../../lib/curatedCategories";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: any) {
  const key = String(params.category || "").toLowerCase();
  const all = await fetchProducts();

  const label = CURATED_CATEGORIES.find(c => c.key === key)?.label || "Category";
  const filtered = all.filter(p => p.curated_category_key === key);

  return (
    <div>
      <div className="mb-5">
        <div className="text-2xl font-semibold">{label}</div>
        <div className="text-sm text-neutral-600 mt-1">Products: {filtered.length}</div>
      </div>
      <CatalogClient products={filtered} whatsappNumberDigits="923702578788" />
    </div>
  );
}
