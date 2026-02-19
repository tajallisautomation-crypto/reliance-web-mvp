"use client";

import { useEffect, useState } from "react";

const banners = [
  { title: "Bank transfer discount", sub: "Pay via bank transfer for best pricing.", cta: "Get details on WhatsApp" },
  { title: "Installments available", sub: "3 / 6 / 12 month plans with ceiling-to-500 rounding.", cta: "Calculate on product page" },
  { title: "Services & bundles", sub: "Installation, solar packages, and after-sales support.", cta: "Ask for a bundle" },
];

export default function PromoBanners() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, []);

  const b = banners[i];

  return (
    <section className="mx-auto max-w-7xl px-4 mt-6">
      <div className="glass-strong rounded-[22px] shadow-soft overflow-hidden">
        <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">{b.title}</div>
            <div className="mt-1 text-sm text-neutral-700">{b.sub}</div>
          </div>
          <a
            className="btn px-5 py-3 text-sm bg-black text-white hover:brightness-110"
            href="https://wa.me/923354266238"
            target="_blank"
          >
            {b.cta}
          </a>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-black/25 to-transparent" />
      </div>
    </section>
  );
}
