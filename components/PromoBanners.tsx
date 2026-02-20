"use client";

import { useEffect, useState } from "react";

const banners = [
  {
    eyebrow: "Structured Payments",
    title: "Bank Transfer Discount",
    sub: "Receive preferential pricing when paying via direct bank transfer. No hidden charges. No inflated margins.",
    cta: "Get Transfer Details",
  },
  {
    eyebrow: "Governed Installments",
    title: "3 • 6 • 12 Month Plans",
    sub: "Deterministic pricing with structured rounding and credit ceilings. Clear totals before commitment.",
    cta: "Calculate Installment",
  },
  {
    eyebrow: "Services & Bundles",
    title: "Installation • Solar • After-Sales",
    sub: "Nationwide delivery, certified installation, and post-purchase service support under one governed system.",
    cta: "Request Bundle Quote",
  },
];

export default function PromoBanners() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const banner = banners[index];

  return (
    <section className="mx-auto max-w-7xl px-4 mt-8">
      <div className="rounded-[24px] bg-black text-white shadow-xl overflow-hidden relative">
        
        <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          
          <div className="max-w-2xl space-y-3">
            
            <div className="text-xs uppercase tracking-widest text-white/50">
              {banner.eyebrow}
            </div>

            <h3 className="text-2xl md:text-3xl font-semibold leading-tight">
              {banner.title}
            </h3>

            <p className="text-sm md:text-base text-white/70">
              {banner.sub}
            </p>

          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            
            <a
              href="https://wa.me/923354266238"
              target="_blank"
              className="px-6 py-3 text-sm font-medium bg-white text-black rounded-xl hover:bg-neutral-200 transition"
            >
              {banner.cta}
            </a>

            <div className="flex gap-2">
              {banners.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

          </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      </div>
    </section>
  );
}
