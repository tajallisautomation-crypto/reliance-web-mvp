import { fetchProductBySlug, safeImage } from "../../../lib/products";
import type { Product } from "../../../lib/products";

export const dynamic = "force-dynamic";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = {
  3: 1.12,
  6: 1.20,
  12: 1.35,
};

function buildLongDescription(p: Product) {
  const d = String(p.description || "").trim();
  if (d && d.length > 120) return d;

  return `${p.brand} ${p.model} is selected for Pakistan’s market conditions where voltage variation, heavy daily usage, and serviceability matter.
It is a practical choice for customers who want predictable performance and warranty-backed support from Tajalli’s.

If you want a reliable option with WhatsApp support and clear pricing, this model is a safe pick.`;
}

function buildUseCase(p: Product) {
  const cat = String(p.curated_category || p.category || "").toLowerCase();
  if (cat.includes("air")) return "Ideal for bedrooms, lounges, and offices where reliable cooling and efficiency are priorities.";
  if (cat.includes("washing")) return "Ideal for family households needing consistent wash performance and durability.";
  if (cat.includes("battery") || cat.includes("solar") || cat.includes("inverter")) return "Ideal for backup power setups, solar storage, and load-shedding protection.";
  if (cat.includes("refriger")) return "Ideal for households needing stable cooling and day-to-day efficiency.";
  return "Ideal for households and offices looking for dependable everyday performance with warranty-backed support.";
}

export async function generateMetadata({ params }: any) {
  const p = await fetchProductBySlug(params.id);
  if (!p) return { title: "Product not found - Reliance by Tajalli’s" };

  const title = `${p.brand} ${p.model} Price in Pakistan | Reliance by Tajalli’s`;
  const description = buildLongDescription(p).slice(0, 160);
  return { title, description };
}

export default async function ProductPage({ params }: any) {
  const p = await fetchProductBySlug(params.id);

  if (!p) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-xl font-semibold">Product not found</div>
        <a className="underline text-sm" href="/">Back to products</a>
      </main>
    );
  }

  const price = p.retail_price ?? p.minimum_price ?? 0;

  const adminWhatsapp = process.env.ADMIN_WHATSAPP || "923354266238";
  const msg = `I want: ${p.brand} ${p.model}\nPrice: PKR ${price}\nProduct Key: ${p.product_key}`;
  const wa = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(msg)}`;

  const longDesc = buildLongDescription(p);
  const useCase = buildUseCase(p);

  const img1 = safeImage(p.image_url_1);
  const img2 = safeImage(p.image_url_2);

  const site = process.env.SITE_URL || "https://reliance.tajallis.com.pk";

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brand} ${p.model}`,
    brand: { "@type": "Brand", name: p.brand },
    category: p.category,
    description: longDesc,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: String(price),
      availability: "https://schema.org/InStock",
      url: `${site}/p/${p.slug}`,
    },
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="/" className="text-sm underline">← Back to catalogue</a>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="h-80 bg-neutral-100 flex items-center justify-center rounded-xl overflow-hidden">
            {img1.isDirect ? (
              <img src={img1.src} alt={p.model} loading="lazy" className="h-full w-full object-contain" />
            ) : (
              <div className="text-xs text-neutral-600 text-center px-6">
                No direct image available.
                {img1.src ? (
                  <div className="mt-2">
                    <a className="underline" href={img1.src} target="_blank">Open image search</a>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white p-3 text-xs">
              <div className="text-neutral-500">Warranty</div>
              <div className="font-medium mt-1">{p.warranty || "—"}</div>
            </div>
            <div className="rounded-xl border bg-white p-3 text-xs">
              <div className="text-neutral-500">Availability</div>
              <div className="font-medium mt-1">{p.availability || "In Stock"}</div>
            </div>
          </div>

          {img2.src ? (
            <div className="mt-4 rounded-xl border bg-neutral-50 p-3 text-xs">
              Secondary image:
              <div className="mt-2">
                {img2.isDirect ? (
                  <img
                    src={img2.src}
                    alt={`${p.model} image 2`}
                    loading="lazy"
                    className="w-full h-40 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <a className="underline" href={img2.src} target="_blank">Open image search</a>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-xs text-neutral-600">{p.category}</div>
          <h1 className="mt-1 text-2xl font-semibold">{p.brand} {p.model}</h1>

          <div className="mt-3 text-2xl font-semibold">
            PKR {price}
          </div>

          <div className="mt-4 flex gap-3">
            <a href={wa} target="_blank" className="rounded-xl bg-green-600 text-white px-5 py-3 text-sm font-medium hover:bg-green-700">
              WhatsApp to order
            </a>
            <a href="/" className="rounded-xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50">
              Continue browsing
            </a>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold">Ideal use case</div>
            <p className="mt-2 text-sm text-neutral-800">{useCase}</p>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold">Overview</div>
            <p className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">{longDesc}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Specifications</h2>
          {p.specifications ? (
            <pre className="mt-3 text-sm text-neutral-800 whitespace-pre-wrap">{p.specifications}</pre>
          ) : (
            <div className="mt-3 text-sm text-neutral-600">Specifications will be confirmed on WhatsApp.</div>
          )}

          {p.tags ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Tags</div>
              <div className="mt-2 text-sm text-neutral-700">{p.tags}</div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Installment calculator</h2>
          <div className="mt-3 text-sm text-neutral-600">Ceiling-to-500 rounding applied.</div>

          <div className="mt-4 space-y-3">
            {[3, 6, 12].map(m => {
              const total = ceilTo500(price * (CREDIT_MULTIPLIERS[m] ?? 1));
              const monthly = ceilTo500(total / m);
              return (
                <div key={m} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="font-medium">{m} months</div>
                  <div className="text-sm">Total: PKR {total}</div>
                  <div className="text-sm">Monthly: PKR {monthly}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
