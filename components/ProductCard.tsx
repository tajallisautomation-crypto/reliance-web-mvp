"use client";

import type { Product } from "../lib/products";
import { safeImage } from "../lib/products";

function formatPrice(p: Product) {
  const price = p.retail_price ?? p.minimum_price;
  return price ? `PKR ${price}` : "Price on request";
}

export default function ProductCard({
  p,
  whatsappNumberDigits,
}: {
  p: Product;
  whatsappNumberDigits: string;
}) {
  const img1 = safeImage(p.image_url_1);

  const msg = `I want: ${p.brand} ${p.model}\nPrice: ${p.retail_price ?? p.minimum_price ?? ""}\nProduct Key: ${p.product_key}`;
  const wa = `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="glass-strong rounded-[22px] overflow-hidden card-hover">
      <a href={`/p/${p.slug}`} className="block">
        <div className="relative h-44 bg-white/60 border-b border-white/70 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_20%_20%,rgba(0,0,0,0.06),transparent_55%)]" />
          {img1.isDirect ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img1.src}
              alt={p.model}
              loading="lazy"
              className="relative h-full w-full object-contain p-3"
            />
          ) : (
            <div className="relative h-full w-full grid place-items-center text-xs text-neutral-600 px-6 text-center">
              No direct image.
              {img1.src ? (
                <div className="mt-2">
                  <a className="underline" href={img1.src} target="_blank">
                    Open image search
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="text-[11px] text-neutral-600">{p.curated_category || p.category}</div>
          <div className="mt-1 text-sm font-semibold leading-snug">
            {p.brand} {p.model}
          </div>

          <div className="mt-2 text-base font-semibold">{formatPrice(p)}</div>

          <div className="mt-2 text-[11px] text-neutral-600">
            Warranty: {p.warranty || "—"} • {p.availability || "—"}
          </div>
        </div>
      </a>

      <div className="px-4 pb-4 flex gap-2">
        <a
          className="btn flex-1 text-center px-4 py-2 text-sm bg-black text-white hover:brightness-110"
          href={wa}
          target="_blank"
        >
          WhatsApp
        </a>
        <a
          className="btn flex-1 text-center px-4 py-2 text-sm glass hover:bg-white"
          href={`/p/${p.slug}`}
        >
          Details
        </a>
      </div>
    </div>
  );
}
const img1 = safeImage(product.image_url_1);
const img2 = safeImage(product.image_url_2);
const imageToShow = img1.isDirect ? img1.src : img2.isDirect ? img2.src : "";

return (
  <div className="product-card">
    {imageToShow ? (
      <img src={imageToShow} alt={product.model} className="product-image" />
    ) : (
      <div className="no-image">Image Not Available</div>
    )}
    {/* …other fields… */}
  </div>
);
.no-image {
  width: 100%;
  height: 140px;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 14px;
}
