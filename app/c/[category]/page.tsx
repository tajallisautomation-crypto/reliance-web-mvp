import { fetchProducts, slugify } from "../../../lib/products";
import CatalogClient from "../../../components/CatalogClient";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: any) {
  const all = await fetchProducts();
  const slug = params.category;

  const filtered = all.filter(p => slugify(p.curated_category) === slug);

  return (
    <div className="py-4">
      <CatalogClient products={filtered} whatsappNumberDigits="923702578788" />
    </div>
  );
}
