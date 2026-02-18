import React from "react";
import { fetchProductByKey, isDirectImageUrl } from "../../../lib/products";

export const dynamic = "force-dynamic";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = {
  3: 1.12,
  6: 1.20,
  12: 1.35,
};

export default async function ProductPage({ params }: any) {
  const p = await fetchProductByKey(params.id);

  if (!p) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-xl font-semibold">Product not found</div>
        <a className="underline text-sm" href="/">Back to products</a>
      </main>
    );
  }

  const basePrice = p.retail_price ?? p.minimum_price ?? 0;

  const whatsappNumber = "923354266238";
  const message = `I'm interested in ${p.brand} ${p.model}\nPrice: PKR ${basePrice}\nProduct Key: ${p.product_key}`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <a href="/" className="text-sm underline">← Back to products</a>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="bg-white border rounded-xl p-6">
          <div className="h-80 flex items-center justify-center bg-neutral-100 rounded-lg overflow-hidden">
            {isDirectImageUrl(p.image_url_1) ? (
              <img src={p.image_url_1} alt={p.model} className="h-full object-contain" />
            ) : (
              <div className="text-sm text-neutral-600 text-center">
                No direct image available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="text-sm text-neutral-500">{p.category}</div>
          <h1 className="text-2xl font-semibold mt-1">
            {p.brand} {p.model}
          </h1>

          <div className="text-2xl font-bold mt-4">
            PKR {basePrice}
          </div>

          <div className="text-sm text-neutral-600 mt-2">
            Availability: {p.availability || "In Stock"}
          </div>

          <div className="text-sm text-neutral-600">
            Warranty: {p.warranty || "—"}
          </div>

          <a
            href={waLink}
            target="_blank"
            className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>

      <section className="mt-10 bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Product Overview</h2>
        <p className="text-neutral-800 whitespace-pre-wrap">
          {p.description || `${p.brand} ${p.model} is designed for reliable performance, durability, and long-term usage.`}
        </p>
      </section>

      <section className="mt-6 bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Installment Options</h2>

        {[3, 6, 12].map((months) => {
          const total = ceilTo500(basePrice * CREDIT_MULTIPLIERS[months]);
          const monthly = ceilTo500(total / months);

          return (
            <div key={months} className="mb-4 p-4 bg-neutral-50 rounded-lg border">
              <div className="font-medium">{months} Months Plan</div>
              <div>Total: PKR {total}</div>
              <div>Monthly Installment: PKR {monthly}</div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
