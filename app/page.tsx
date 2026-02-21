import PromoBanners from "@/components/PromoBanners";
import LogoBannerRail from "@/components/LogoBannerRail";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      
      {/* HERO SECTION */}
      <section className="bg-black text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Everything Your Home Runs On.
            <br />
            One Governed Platform.
          </h1>

          <p className="text-lg md:text-xl text-white/70">
            Refrigerators • ACs • TVs • Solar • Batteries • Installments
          </p>

          <div className="pt-6 text-base md:text-lg text-white/60 space-y-2">
            <p>Transparent Pricing.</p>
            <p>Structured Credit.</p>
            <p>Nationwide Delivery.</p>
          </div>

        </div>
      </section>

      {/* PROMO ROTATION */}
      <PromoBanners />

      {/* BRAND RAIL */}
      <LogoBannerRail />

      {/* FOOTER PLACEHOLDER */}
      <section className="mt-16 py-12 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Reliance by Tajalli’s. All rights reserved.
      </section>

    </main>
  );
}
