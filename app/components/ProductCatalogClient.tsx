"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { isDirectImageUrl } from "@/lib/products";

function ceilTo500(n: number) {
  if (!Number.isFinite(n)) return n;
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = {
  3: 1.12,
  6: 1.20,
  12: 1.35,
};

export default function ProductCatalogClient({
  products,
  whatsappNumberDigits,
}: {
  products: Product[];
  whatsappNumberDigits: string;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [creditOn, setCreditOn] = useState(false);
  const [months, setMonths] = useState<3 | 6 | 12>(3);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = products.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (!query) return true;

      const hay = `${p.brand} ${p.model} ${p.category} ${p.tags}`.toLowerCase();
      return hay.includes(query);
    });

    const priceOf = (p: Product) => (p.retail_price ?? p.minimum_price ?? 0);

    if (sort === "price_asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price_desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name_asc") list.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));

    return list;
  }, [products, q, category, sort]);

  function waLink(p: Product) {
    const msg = `I want: ${p.brand} ${p.model}\nPrice: PKR ${p.retail_price ?? p.minimum_price ?? ""}\nProduct Key: ${p.product_key}`;
    return `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(msg)}`;
  }

  function creditNumbers(p: Product) {
    const base = (p.retail_price ?? p.minimum_price ?? 0);
    const mult = CREDIT_MULTIPLIERS[months] ?? 1;
    const total = ceilTo500(base * mult);
    const monthly = ceilTo500(total / months);
    return { base, total, monthly };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Reliance by Tajalli’s</h1>
          <div className="text-sm text-neutral-600 mt-1">
            Total products: {filtered.length} (from {products.length})
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brand, model, category..."
            className="w-full md:w-72 rounded-lg border border-neutral-300 px-3 py-2 bg-white"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 bg-white"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 bg-white"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={creditOn} onChange={() => setCreditOn(v => !v)} />
          <span className="text-sm">Show installment estimate</span>
        </label>

        {creditOn && (
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) as any)}
            className="rounded-lg border border-neutral-300 px-3 py-2 bg-white w-40"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        )}

        <div className="text-xs text-neutral-500">
          Installments use ceiling-to-500 rounding.
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((p) => {
          const price = p.retail_price ?? p.minimum_price;
          const credit = creditOn ? creditNumbers(p) : null;

          return (
            <div key={p.product_key} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <a href={`/p/${encodeURIComponent(p.product_key)}`} className="block">
                <div className="h-44 bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {isDirectImageUrl(p.image_url_1) ? (
                    <img src={p.image_url_1} alt={p.model} className="h-full w-full object-contain" />
                  ) : (
                    <div className="px-4 text-center text-xs text-neutral-600">
                      No direct image available.
                      {p.image_url_1 ? (
                        <div className="mt-2">
                          <a className="underline" href={p.image_url_1} target="_blank">Open image search</a>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-sm text-neutral-600">{p.category}</div>
                  <div className="mt-1 font-semibold leading-snug">{p.brand} {p.model}</div>

                  <div className="mt-2 text-lg font-semibold">
                    {price ? `PKR ${price}` : "Price on request"}
                  </div>

                  <div className="mt-1 text-xs text-neutral-600">
                    Warranty: {p.warranty || "—"} • {p.availability || "—"}
                  </div>

                  {credit && price ? (
                    <div className="mt-3 rounded-lg bg-neutral-50 border border-neutral-200 p-2 text-xs">
                      <div>Total: PKR {credit.total}</div>
                      <div>Monthly: PKR {credit.monthly} × {months}</div>
                    </div>
                  ) : null}
                </div>
              </a>

              <div className="px-4 pb-4 flex gap-2">
                <a
                  className="flex-1 text-center rounded-lg bg-green-600 text-white py-2 text-sm"
                  href={waLink(p)}
                  target="_blank"
                >
                  WhatsApp
                </a>
                <a
                  className="flex-1 text-center rounded-lg border border-neutral-300 py-2 text-sm"
                  href={`/p/${encodeURIComponent(p.product_key)}`}
                >
                  Details
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
