import { fetchProducts } from "../lib/products";
import CatalogClient from "../components/CatalogClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await fetchProducts();
  return <CatalogClient products={products} whatsappNumberDigits="923354266238" />;
}
