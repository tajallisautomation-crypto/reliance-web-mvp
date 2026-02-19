import CatalogClient from "../components/CatalogClient";
import { fetchProducts } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await fetchProducts();

  const adminWhatsapp = process.env.ADMIN_WHATSAPP || "923354266238";
  const defaultWhatsapp = process.env.DEFAULT_WHATSAPP || "923702578788";

  return (
    <main>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-2xl md:text-3xl font-semibold">Reliance by Tajalli’s</div>
          <div className="text-sm text-neutral-600 mt-1">
            Total Products: {products.length}
          </div>
        </div>
      </div>

      <CatalogClient
        products={products}
        adminWhatsappDigits={adminWhatsapp}
        whatsappNumberDigits={defaultWhatsapp}
      />
    </main>
  );
}
