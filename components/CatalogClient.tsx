"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { Product } from "../lib/products";
import { isDirectImageUrl } from "../lib/products";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = { 3: 1.12, 6: 1.2, 12: 1.35 };
const PAGE_SIZE = 24;

function bestMatch(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const scored = products.map(p => {
    const hay = `${p.brand} ${p.model} ${p.category} ${p.tags}`.toLowerCase();
    let s = 0;
    if (hay.includes(q)) s += 10;
    if (`${p.brand} ${p.model}`.toLowerCase().startsWith(q)) s += 20;
    if (p.model.toLowerCase().startsWith(q)) s += 25;
    if (p.brand.toLowerCase().startsWith(q)) s += 15;
    return { p, s };
  }).sort((a,b) => b.s - a.s);

  return scored[0]?.s ? scored[0].p : null;
}

export default function CatalogClient({
  products,
  whatsappNumberDigits,
}: {
  products: Product[];
  whatsappNumberDigits: string;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const [showInstallments, setShowInstallments] = useState(false);
  const [months, setMonths] = useState<3 | 6 | 12>(3);

  const [showSug, setShowSug] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

    const priceOf = (p: Product) => (p.retail_price ?? 0);

    if (sort === "price_asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price_desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name_asc") list.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));

    return list;
  }, [products, q, category, sort]);

  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const list = products
      .filter(p => (`${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(query)))
      .slice(0, 8);
    return list;
  }, [products, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  function waLink(p: Product) {
    const price = p.retail_price ?? "";
    const msg = `I want: ${p.brand} ${p.model}\nPrice: PKR ${price}\nProduct Key: ${p.product_key}`;
    return `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(msg)}`;
  }

  function credit(p: Product) {
    const base = (p.retail_price ?? 0);
    const total = ceilTo500(base * (CREDIT_MULTIPLIERS[months] ?? 1));
    const monthly = ceilTo500(total / months);
    return { total, monthly };
  }

  function goToProduct(p: Product) {
    window.location.href = `/p/${encodeURIComponent(p.product_key)}`;
  }

  function onEnter() {
    const bm = bestMatch(products, q);
    if (bm) goToProduct(bm);
  }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!inputRef.current) return;
      if (e.target instanceof Node && inputRef.current.contains(e.target)) return;
      setShowSug(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Product Catalogue</h1>
          <div className="text-sm text-neutral-600 mt-1">
            Showing {filtered.length} products
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center relative">
          <div className="relative">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); setShowSug(true); }}
              onFocus={() => setShowSug(true)}
              onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
              placeholder="Search brand, model, category..."
              className="w-full md:w-80 rounded-xl border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
            {showSug && suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s.product_key}
                    onClick={() => goToProduct(s)}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50"
                  >
                    <div className="text-sm font-medium">{s.brand} {s.model}</div>
                    <div className="text-xs text-neutral-500">{s.category} • PKR {s.retail_price ?? "—"}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="rounded-xl border border-neutral-300 px-3 py-2 bg-white"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-neutral-300 px-3 py-2 bg-white"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInstallments}
            onChange={() => setShowInstallments(v => !v)}
          />
          Show installment estimate
        </label>

        {showInstallments && (
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) as any)}
            className="rounded-xl border border-neutral-300 px-3 py-2 bg-white w-40 text-sm"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        )}

        <div className="text-xs text-neutral-500">Ceiling-to-500 rounding.</div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pageItems.map((p) => {
          const price = p.retail_price ?? null;
          const inst = showInstallments && price ? credit(p) : null;

          return (
            <div key={p.product_key} className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
              <a href={`/p/${encodeURIComponent(p.product_key)}`} className="block">
                <div className="h-44 bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {isDirectImageUrl(p.image_url_1) ? (
                    <img
                      loading="lazy"
                      src={p.image_url_1}
                      alt={p.model}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-neutral-600 text-center px-5">
                      No direct image.
                      {p.image_url_1 ? (
                        <div className="mt-2">
                          <a className="underline" href={p.image_url_1} target="_blank">Open image search</a>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-xs text-neutral-600">{p.category}</div>
                  <div className="mt-1 font-semibold leading-snug">{p.brand} {p.model}</div>

                  <div className="mt-2 text-lg font-semibold">
                    {price ? `PKR ${price}` : "Price on request"}
                  </div>

                  <div className="mt-1 text-xs text-neutral-600">
                    Warranty: {p.warranty || "—"} • {p.availability || "—"}
                  </div>

                  {inst ? (
                    <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200 p-2 text-xs">
                      <div>Total: PKR {inst.total}</div>
                      <div>Monthly: PKR {inst.monthly} × {months}</div>
                    </div>
                  ) : null}
                </div>
              </a>

              <div className="px-4 pb-4 flex gap-2">
                <a
                  className="flex-1 text-center rounded-xl bg-green-600 text-white py-2 text-sm hover:bg-green-700"
                  href={waLink(p)}
                  target="_blank"
                >
                  WhatsApp
                </a>
                <a
                  className="flex-1 text-center rounded-xl border border-neutral-300 py-2 text-sm hover:bg-neutral-50"
                  href={`/p/${encodeURIComponent(p.product_key)}`}
                >
                  Details
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
          disabled={safePage <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </button>

        <div className="text-sm text-neutral-600">
          Page {safePage} of {totalPages}
        </div>

        <button
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
          disabled={safePage >= totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
