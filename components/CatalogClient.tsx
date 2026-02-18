"use client";

import { useMemo, useRef, useState } from "react";
import type { Product } from "../lib/products";
import { isDirectImageUrl } from "../lib/products";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = {
  3: 1.12,
  6: 1.20,
  12: 1.35,
};

const PAGE_SIZE = 24;

function money(n?: number | null) {
  if (!n) return "Price on request";
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

function normalize(s: string) {
  return String(s || "").toLowerCase().trim();
}

function buildHay(p: Product) {
  return normalize(`${p.brand} ${p.model} ${p.category} ${p.tags} ${p.curated_category_label}`);
}

function ImgWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!isDirectImageUrl(src)) {
    return (
      <div className="h-44 bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">
        No image
      </div>
    );
  }

  return (
    <div className="h-44 bg-neutral-100 relative overflow-hidden">
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200" />
      ) : null}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default function CatalogClient({
  products,
  whatsappNumberDigits,
}: {
  products: Product[];
  whatsappNumberDigits: string;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const [showInstallments, setShowInstallments] = useState(false);
  const [months, setMonths] = useState<3 | 6 | 12>(3);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const query = q.trim();

  const filtered = useMemo(() => {
    const queryN = normalize(query);

    let list = products.filter((p) => {
      if (!queryN) return true;
      return buildHay(p).includes(queryN);
    });

    const priceOf = (p: Product) => p.retail_price ?? p.minimum_price ?? 0;

    if (sort === "price_asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price_desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name_asc")
      list.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));

    return list;
  }, [products, query, sort]);

  const suggestions = useMemo(() => {
    const queryN = normalize(query);
    if (!queryN || queryN.length < 2) return [];

    const scored = products
      .map((p) => {
        const name = `${p.brand} ${p.model}`;
        const hay = buildHay(p);
        const prefix = normalize(name).startsWith(queryN) ? 2 : 0;
        const contains = hay.includes(queryN) ? 1 : 0;
        const score = prefix + contains;
        return { p, score, name };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 8)
      .map((x) => x.p);

    return scored;
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  function waLink(p: Product) {
    const price = p.retail_price ?? p.minimum_price ?? "";
    const msg =
      `I want: ${p.brand} ${p.model}\n` +
      `Price: PKR ${price}\n` +
      `Product Key: ${p.product_key}`;

    return `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(msg)}`;
  }

  function credit(p: Product) {
    const base = p.retail_price ?? p.minimum_price ?? 0;
    const total = ceilTo500(base * CREDIT_MULTIPLIERS[months]);
    const monthly = ceilTo500(total / months);
    return { total, monthly };
  }

  function goToBestMatch() {
    const best = suggestions[0] || filtered[0];
    if (!best) return;
    // @ts-ignore
    window.plausible?.("Search_Enter_Go", { props: { slug: best.slug } });
    window.location.href = `/p/${best.slug}`;
  }

  const showSuggestionBox = suggestions.length > 0 && query.trim().length >= 2;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Product Catalogue</h1>
          <div className="text-sm text-neutral-600 mt-1">{filtered.length} products available</div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goToBestMatch();
                }
              }}
              placeholder="Search brand or model..."
              className="w-full md:w-80 rounded-xl border border-neutral-300 px-3 py-2 bg-white"
            />

            {showSuggestionBox ? (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
                {suggestions.map((p) => (
                  <a
                    key={p.slug}
                    href={`/p/${p.slug}`}
                    className="block px-3 py-2 hover:bg-neutral-50"
                    onClick={() => {
                      // @ts-ignore
                      window.plausible?.("Search_Suggestion_Click", { props: { slug: p.slug } });
                    }}
                  >
                    <div className="text-sm font-medium">{p.brand} {p.model}</div>
                    <div className="text-xs text-neutral-600">
                      {p.curated_category_label} • {money(p.retail_price ?? p.minimum_price)}
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-neutral-300 px-3 py-2 bg-white"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="name_asc">Name A–Z</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showInstallments} onChange={() => setShowInstallments((v) => !v)} />
          Show installment estimate
        </label>

        {showInstallments ? (
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) as any)}
            className="border border-neutral-300 rounded-lg px-2 py-1"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        ) : null}

        <div className="text-xs text-neutral-500">Ceiling-to-500 rounding.</div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {pageItems.map((p) => {
          const price = p.retail_price ?? p.minimum_price;
          const inst = showInstallments && price ? credit(p) : null;

          return (
            <div
              key={p.slug}
              className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <a
                href={`/p/${p.slug}`}
                onClick={() => {
                  // @ts-ignore
                  window.plausible?.("Product_Open", { props: { slug: p.slug, placement: "catalog_card" } });
                }}
              >
                <ImgWithSkeleton src={p.image_url_1} alt={`${p.brand} ${p.model}`} />

                <div className="p-4">
                  <div className="text-xs text-neutral-500">{p.curated_category_label}</div>
                  <div className="mt-1 font-semibold leading-snug">{p.brand} {p.model}</div>

                  <div className="mt-2 text-lg font-semibold">{money(price)}</div>

                  <div className="mt-1 text-xs text-neutral-600">
                    {p.availability || "In Stock"} {p.warranty ? `• ${p.warranty}` : ""}
                  </div>

                  {inst ? (
                    <div className="mt-2 text-xs text-neutral-600">
                      {months} months: PKR {inst.monthly.toLocaleString("en-PK")}/mo
                    </div>
                  ) : null}
                </div>
              </a>

              <div className="px-4 pb-4 flex gap-2">
                <a
                  href={waLink(p)}
                  target="_blank"
                  className="flex-1 text-center rounded-xl bg-green-600 text-white py-2 text-sm hover:bg-green-700"
                  onClick={() => {
                    // @ts-ignore
                    window.plausible?.("WhatsApp_Click", { props: { slug: p.slug, placement: "catalog_card" } });
                  }}
                >
                  WhatsApp
                </a>

                <a
                  href={`/p/${p.slug}`}
                  className="flex-1 text-center rounded-xl border border-neutral-300 py-2 text-sm hover:bg-neutral-50"
                  onClick={() => {
                    // @ts-ignore
                    window.plausible?.("Product_Open", { props: { slug: p.slug, placement: "catalog_details" } });
                  }}
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
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>

        <div className="text-sm text-neutral-600">
          Page {safePage} of {totalPages}
        </div>

        <button
          disabled={safePage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
