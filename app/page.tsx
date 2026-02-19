import { fetchProducts } from "../lib/products";
import CatalogClient from "../components/CatalogClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await fetchProducts();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="text-2xl font-semibold">Reliance by Tajalli’s</div>
        <div className="text-sm text-neutral-600 mt-1">
          Total Products: {products.length}
        </div>
      </div>

      <CatalogClient
        products={products}
        whatsappNumberDigits={process.env.NEXT_PUBLIC_DEFAULT_WA || "923702578788"}
      />
    </main>
  );
}
