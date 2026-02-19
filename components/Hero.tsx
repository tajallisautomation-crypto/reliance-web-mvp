"use client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 z-10" />

      <div
        className="h-[420px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581091012184-5c1d2d1b1c3f?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Powering Modern Homes
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/90">
          Premium Appliances • Solar Systems • Structured Installments
        </p>

        <div className="mt-6 flex gap-4">
          <a
            href="#catalogue"
            className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:scale-105 transition"
          >
            Explore Catalogue
          </a>
          <a
            href="https://wa.me/923354266238"
            className="px-6 py-3 rounded-xl border border-white text-white hover:bg-white hover:text-black transition"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
