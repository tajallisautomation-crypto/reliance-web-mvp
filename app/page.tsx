import Hero from "src/components/Hero";
import LogoBannerRail from "src/components/LogoBannerRail";
import PromoBanners from "src/components/PromoBanners";
import CatalogClient from "src/components/CatalogClient";
import { fetchProducts } from "../lib/products";

export default async function Page() {
  const products = await fetchProducts();

  return (
    <main>
      <Hero />
      <LogoBannerRail />
      <PromoBanners />

      <section id="catalogue" className="mx-auto max-w-7xl px-4 pb-20">
        <CatalogClient products={products} whatsappNumberDigits="923354266238" />
      </section>
    </main>
  );
}
