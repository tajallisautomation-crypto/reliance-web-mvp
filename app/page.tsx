import Hero from "../components/Hero";
import BrandStrip from "../components/BrandStrip";
import BannerRotator from "../components/BannerRotator";
import CatalogClient from "../components/CatalogClient";
import { fetchProducts } from "../lib/products";

export default async function Page() {
  const products = await fetchProducts();

  return (
    <>
      <BannerRotator />
      <Hero />
      <BrandStrip />

      <div id="catalogue">
        <CatalogClient
          products={products}
          whatsappNumberDigits="923354266238"
        />
      </div>
    </>
  );
}
