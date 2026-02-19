"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { Product } from "../lib/products";
import { bestMatch, safeImage, suggest } from "../lib/products";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = {
  3: 1.12,
  6: 1.20,
  12: 1.35,
};

const PAGE_SIZE = 24;

export default function CatalogClient({
  products,
  whatsappNumberDigits,
  adminWhatsappDigits,
}: {
  products: Product[];
  whatsappNumberDigits: string;
  adminWhatsappDigits: string;
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const suggestions = useMemo(() => suggest(products, q, 8), [products, q]);

  useEffect(() => {
    function onDocClick(e: any) {
      if (!inputRef.current) return;
      if (e.target && inputRef.current.contains(e.target)) return;
      setShowSug(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

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

  function goBestMatch() {
    const p = bestMatch(products, q);
    if (!p) return;
    window.location.href = `/p/${p.slug}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Product Catalogue</h1>
          <div className="text-sm text-neutral-600 mt-1">
            Showing {filtered.length} products
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative w-full md:w-96">
            <input
              ref={inputRef}
              value={q}
              onFocus={() => setShowSug(true)}
              onChange={(e) => { setQ(e.target.value); setPage(1); setShowSug(true); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goBestMatch();
                }
              }}
              placeholder="Search brand, model, category..."
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />

            {showSug && q.trim() && suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
                {suggestions.map(s => (
                  <a
                    key={s.product_key}
                    href={`/p/${s.slug}`}
                    className="block px-3 py-2 hover:bg-neutral-50 text-sm"
                  >
                    <div className="font-medium">{s.brand} {s.model}</div>
                    <div className="text-xs text-neutral-600">{s.category} • PKR {s.retail_price ?? "—"}</div>
                  </a>
                ))}
                <button
                  onClick={goBestMatch}
                  className="w-full text-left px-3 py-2 text-sm border-t hover:bg-neutral-50"
                >
                  Enter → open best match
                </button>
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

          const img = safeImage(p.image_url_1);

          return (
            <div key={p.product_key} className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
>
              <a href={`/p/${p.slug}`} className="block">
                <div className="h-44 bg-neutral-100 flex items-center justify-center overflow-hidden relative">
                  {img.isDirect ? (
                    <img
                      src={img.src}
                      alt={p.model}
                      loading="lazy"
                      className="h-full w-full object-contain"
                      style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.03), rgba(0,0,0,0.06), rgba(0,0,0,0.03))" }}
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
                  className="flex-1 text-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white py-2 text-sm hover:brightness-110 transition"

                  href={waLink(p)}
                  target="_blank"
                >
                  WhatsApp
                </a>
                <a
                  className="flex-1 text-center rounded-xl border border-neutral-300 py-2 text-sm hover:bg-neutral-50"
                  href={`/p/${p.slug}`}
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

      <div className="mt-10 text-xs text-neutral-500">
        Admin support: <a className="underline" href={`https://wa.me/${adminWhatsappDigits}`} target="_blank">WhatsApp</a>
      </div>
    </div>
  );
}
