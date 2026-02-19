"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../lib/products";
import { bestMatch, suggest } from "../lib/products";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 24;

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function bandCategory(category: string) {
  const c = normalize(category);
  if (c.includes("air")) return "Air Conditioners";
  if (c.includes("refriger")) return "Refrigerators";
  if (c.includes("washing")) return "Washing Machines";
  if (c.includes("solar") || c.includes("battery") || c.includes("inverter")) return "Solar & Backup";
  if (c.includes("tv") || c.includes("led")) return "TV & Displays";
  return "Other";
}

export default function CatalogClient({
  products,
  whatsappNumberDigits,
}: {
  products: Product[];
  whatsappNumberDigits: string;
}) {
  const [q, setQ] = useState("");
  const [band, setBand] = useState("all");
  const [sort, setSort] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [page, setPage] = useState(1);

  const [openSug, setOpenSug] = useState(false);
  const [activeSug, setActiveSug] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sugRef = useRef<HTMLDivElement | null>(null);

  const bands = useMemo(() => {
    const set = new Set(products.map((p) => bandCategory(p.curated_category || p.category)));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    const query = normalize(q);

    let list = products.filter((p) => {
      const b = bandCategory(p.curated_category || p.category);
      if (band !== "all" && b !== band) return false;
      if (!query) return true;
      const hay = normalize(`${p.brand} ${p.model} ${p.category} ${p.tags} ${p.curated_category || ""}`);
      return hay.includes(query);
    });

    const priceOf = (p: Product) => (p.retail_price ?? p.minimum_price ?? 0);

    if (sort === "price_asc") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price_desc") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name_asc")
      list = [...list].sort((a, b) => normalize(`${a.brand} ${a.model}`).localeCompare(normalize(`${b.brand} ${b.model}`)));

    return list;
  }, [products, q, band, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const suggestions = useMemo(() => suggest(products, q, 8), [products, q]);

  useEffect(() => {
    const onDocClick = (e: any) => {
      const t = e.target as HTMLElement;
      if (!t) return;

      const inInput = inputRef.current && inputRef.current.contains(t);
      const inSug = sugRef.current && sugRef.current.contains(t);

      if (!inInput && !inSug) setOpenSug(false);
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function goToBestMatch() {
    const m = bestMatch(products, q);
    if (m) {
      window.location.href = `/p/${m.slug}`;
      return;
    }
    // If no match, just close suggestions and keep filtered list
    setOpenSug(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!openSug && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpenSug(true);

    if (e.key === "Enter") {
      e.preventDefault();
      if (openSug && suggestions.length > 0) {
        const chosen = suggestions[Math.min(activeSug, suggestions.length - 1)];
        if (chosen) {
          window.location.href = `/p/${chosen.slug}`;
          return;
        }
      }
      goToBestMatch();
    }

    if (!openSug) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSug((v) => Math.min(v + 1, Math.max(0, suggestions.length - 1)));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSug((v) => Math.max(v - 1, 0));
    }

    if (e.key === "Escape") {
      setOpenSug(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl md:text-3xl font-semibold tracking-tight">Catalogue</div>
          <div className="mt-1 text-sm text-neutral-600">Showing {filtered.length} products</div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative w-full md:w-[420px]">
            <div className="glass-strong shadow-soft rounded-[18px] px-3 py-2 flex items-center gap-2">
              <div className="text-neutral-500 text-sm">⌘</div>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                  setOpenSug(true);
                  setActiveSug(0);
                }}
                onFocus={() => setOpenSug(true)}
                onKeyDown={onKeyDown}
                placeholder="Search brand, model, category..."
                className="w-full bg-transparent outline-none text-sm"
              />
              <button
                className="btn px-3 py-2 text-sm bg-black text-white hover:brightness-110"
                onClick={goToBestMatch}
                type="button"
              >
                Go
              </button>
            </div>

            {openSug && suggestions.length > 0 ? (
              <div
                ref={sugRef}
                className="absolute z-30 mt-2 w-full glass-strong shadow-soft rounded-[18px] overflow-hidden"
              >
                {suggestions.map((p, idx) => (
                  <a
                    key={p.slug}
                    href={`/p/${p.slug}`}
                    className={[
                      "block px-4 py-3 text-sm transition",
                      idx === activeSug ? "bg-black text-white" : "hover:bg-black/5",
                    ].join(" ")}
                    onMouseEnter={() => setActiveSug(idx)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate">
                        <span className="font-medium">{p.brand}</span>{" "}
                        <span className="text-neutral-600">{p.model}</span>
                      </div>
                      <div className="text-xs opacity-70">{p.retail_price ?? p.minimum_price ?? ""}</div>
                    </div>
                    <div className="mt-1 text-[11px] opacity-70 truncate">
                      {p.curated_category || p.category}
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <select
            value={band}
            onChange={(e) => {
              setBand(e.target.value);
              setPage(1);
            }}
            className="glass-strong shadow-soft rounded-[14px] px-3 py-2 text-sm"
          >
            {bands.map((b) => (
              <option key={b} value={b}>
                {b === "all" ? "All bands" : b}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="glass-strong shadow-soft rounded-[14px] px-3 py-2 text-sm"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pageItems.map((p) => (
          <ProductCard key={p.slug} p={p} whatsappNumberDigits={whatsappNumberDigits} />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          className="btn glass-strong shadow-soft px-4 py-2 text-sm disabled:opacity-40"
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          type="button"
        >
          Previous
        </button>

        <div className="text-sm text-neutral-600">
          Page {safePage} of {totalPages}
        </div>

        <button
          className="btn glass-strong shadow-soft px-4 py-2 text-sm disabled:opacity-40"
          disabled={safePage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
