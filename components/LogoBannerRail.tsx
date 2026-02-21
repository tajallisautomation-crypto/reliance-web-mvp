"use client";

import Image from "next/image";

const logos = [
  { name: "Haier", src: "/brands/haier.svg" },
  { name: "Dawlance", src: "/brands/dawlance.svg" },
  { name: "PEL", src: "/brands/pel.svg" },
  { name: "Orient", src: "/brands/orient.svg" },
  { name: "Gree", src: "/brands/gree.svg" },
  { name: "Crown", src: "/brands/crown.svg" },
];

export default function LogoBannerRail() {
  return (
    <section className="mx-auto max-w-7xl px-4 -mt-2">
      <div className="glass-strong rounded-[22px] shadow-soft overflow-hidden">
        <div className="bg-black text-white px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Reliance by Tajalli’s
              </h2>
              <p className="text-sm text-white/70 mt-1">
                A governed appliance platform built on structured pricing and responsible credit.
              </p>
            </div>
            <div className="text-xs text-white/60 md:text-right">
              Refrigerators • ACs • TVs • Solar • Batteries • Installments
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-800">Official Brand Network</div>
              <div className="text-xs text-neutral-600">Authorized sourcing • Warranty-backed products</div>
            </div>
            <div className="text-[11px] text-neutral-500">Verified suppliers</div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {logos.map((b) => (
              <div
                key={b.name}
                className="rounded-2xl bg-white border border-neutral-200 h-14 grid place-items-center hover:bg-neutral-50 transition px-3"
                title={b.name}
              >
                <Image
                  src={b.src}
                  alt={b.name}
                  width={120}
                  height={32}
                  className="max-h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-black text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm md:text-base font-medium">
              Transparent Pricing. Structured Credit. Nationwide Delivery.
            </div>
            <div className="text-xs text-white/70">
              Governed markups • Credit caps • Delivery across Pakistan
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
