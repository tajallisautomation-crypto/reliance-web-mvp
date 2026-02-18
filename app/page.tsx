import ProductCatalogClient from "../../components/ProductCatalogClient";
import { fetchProducts } from "../../lib/products";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await fetchProducts();

  // set your WhatsApp number here (digits only)
  const whatsappNumberDigits = "923354266238";

  return <ProductCatalogClient products={products} whatsappNumberDigits={whatsappNumberDigits} />;
}
