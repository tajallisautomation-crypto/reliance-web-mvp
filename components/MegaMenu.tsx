// components/MegaMenu.tsx
"use client";

import { useState } from "react";
import { CURATED_CATEGORIES } from "../lib/curatedCategories";

export default function MegaMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-sm font-medium px-3 py-2 rounded-xl hover:bg-black/5"
      >
        Categories
      </button>

      {open ? (
        <div
          className="absolute left-0 mt-2 w-[min(680px,90vw)] rounded-2xl border border-neutral-200 bg-white shadow-xl p-4"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {CURATED_CATEGORIES.map(c => (
              <a
                key={c.key}
                href={`/c/${c.key}`}
                className="rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50"
              >
                <div className="font-semibold">{c.label}</div>
                <div className="text-xs text-neutral-600 mt-1">{c.blurb}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
