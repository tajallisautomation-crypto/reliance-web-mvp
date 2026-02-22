import { fetchProducts } from "../../../lib/products";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: any) {
  const category = decodeURIComponent(params.category);
  const products = await fetchProducts();
  const filtered = products.filter(p => p.category === category);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{category}</h1>
      <div className="text-sm text-neutral-600 mt-1">Products: {filtered.length}</div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <a key={p.product_key} href={`/p/${encodeURIComponent(p.product_key)}`} className="rounded-2xl border bg-white p-4 hover:shadow-sm">
            <div className="text-xs text-neutral-600">{p.category}</div>
            <div className="mt-1 font-semibold">{p.brand} {p.model}</div>
            <div className="mt-2 text-sm">PKR {p.retail_price ?? "—"}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
