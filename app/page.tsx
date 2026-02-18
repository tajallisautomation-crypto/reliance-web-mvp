import Link from "next/link";
import { fetchProducts, isDirectImageUrl } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">
        Reliance by Tajalli’s
      </h1>

      <div className="text-neutral-600 mb-6">
        Total Products: {products.length}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map(p => (
          <Link
            key={p.slug}
            href={`/p/${p.slug}`}
            className="border rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="h-40 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
              {isDirectImageUrl(p.image_url_1) ? (
                <img
                  src={p.image_url_1}
                  alt={p.model}
                  className="h-full object-contain"
                />
              ) : (
                <div className="text-sm text-neutral-500">
                  No image
                </div>
              )}
            </div>

            <div className="mt-3 font-medium">
              {p.brand} {p.model}
            </div>

            <div className="text-green-700 font-semibold mt-1">
              PKR {p.retail_price ?? p.minimum_price}
            </div>

            <div className="text-xs text-neutral-500 mt-1">
              {p.availability || "In Stock"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
