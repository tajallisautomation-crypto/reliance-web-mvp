import Hero from "../components/Hero";
import LogoBannerRail from "../components/LogoBannerRail";
import PromoBanners from "../components/PromoBanners";
import CatalogClient from "../components/CatalogClient";
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
