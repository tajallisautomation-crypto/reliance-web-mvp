import { fetchProductBySlug, isDirectImageUrl } from "../../../lib/products";

export const dynamic = "force-dynamic";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = { 3: 1.12, 6: 1.2, 12: 1.35 };

function buildLongDescription(p: any) {
  if (p.description && p.description.length > 80) return p.description;

  return `${p.brand} ${p.model} is curated for Pakistan’s real usage conditions—voltage variation, heavy daily load, and serviceability.
You get predictable performance, warranty-backed support, and WhatsApp order handling for fast coordination.
If you want a “safe pick” with reliable after-sales, this model is selected for that exact purpose.`;
}

function buildUseCase(p: any) {
  const cat = String(p.category || "").toLowerCase();
  if (cat.includes("air")) return "Ideal for bedrooms, lounges, and offices where reliable cooling and efficiency matter.";
  if (cat.includes("washing")) return "Ideal for family households needing consistent wash performance and durability.";
  if (cat.includes("battery") || cat.includes("solar")) return "Ideal for backup power setups, solar storage, and load-shedding protection.";
  if (String(p.type || "").toUpperCase() === "SERVICE") return "Ideal for customers needing expert installation/service with coordination and after-sales support.";
  return "Ideal for homes and offices looking for dependable everyday performance with warranty-backed support.";
}

export async function generateMetadata({ params }: any) {
  const p = await fetchProductBySlug(params.id);
  if (!p) return { title: "Product not found - Reliance by Tajalli’s" };

  return {
    title: p.seo_title || `${p.brand} ${p.model} Price in Pakistan | Reliance by Tajalli’s`,
    description: (p.seo_description || buildLongDescription(p)).slice(0, 160)
  };
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

  const price = p.retail_price ?? 0;
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || "923354266238";
  const msg = `I want: ${p.brand} ${p.model}\nPrice: PKR ${price}\nProduct Key: ${p.product_key}`;
  const wa = `https://wa.me/${adminWa}?text=${encodeURIComponent(msg)}`;

  const longDesc = buildLongDescription(p);
  const useCase = buildUseCase(p);

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://reliance.tajallis.com.pk";

  const faq = [
    p.faq_q1 && p.faq_a1 ? { q: p.faq_q1, a: p.faq_a1 } : null,
    p.faq_q2 && p.faq_a2 ? { q: p.faq_q2, a: p.faq_a2 } : null,
    p.faq_q3 && p.faq_a3 ? { q: p.faq_q3, a: p.faq_a3 } : null
  ].filter(Boolean) as Array<{q:string,a:string}>;

  const jsonLdProduct = {
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
      url: `${site}/p/${encodeURIComponent(p.product_key)}`
    }
  };

  const jsonLdFaq = faq.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(x => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a }
    }))
  } : null;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} />
      {jsonLdFaq ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      ) : null}

      <a href="/" className="text-sm underline">← Back to catalogue</a>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="h-80 bg-neutral-100 flex items-center justify-center rounded-xl overflow-hidden">
            {isDirectImageUrl(p.image_url_1) ? (
              <img loading="lazy" src={p.image_url_1} alt={p.model} className="h-full w-full object-contain" />
            ) : (
              <div className="text-xs text-neutral-600 text-center px-6">
                No direct image available.
                {p.image_url_1 ? (
                  <div className="mt-2">
                    <a className="underline" href={p.image_url_1} target="_blank">Open image search</a>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-neutral-600 flex justify-between">
            <div>Warranty: {p.warranty || "—"}</div>
            <div>{p.availability || "In Stock"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-xs text-neutral-600">{p.category} {p.type === "SERVICE" ? "• Service" : ""}</div>
          <h1 className="mt-1 text-2xl font-semibold">{p.brand} {p.model}</h1>

          <div className="mt-3 text-2xl font-semibold">
            PKR {price || "—"}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <a href={wa} target="_blank" className="rounded-xl bg-green-600 text-white px-5 py-3 text-sm font-medium hover:bg-green-700 text-center">
              WhatsApp to order
            </a>
            <a href={`/portal`} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50 text-center">
              Customer Portal
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

          {faq.length ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">FAQs</h2>
              <div className="mt-3 space-y-4">
                {faq.map((x, i) => (
                  <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="font-medium text-sm">{x.q}</div>
                    <div className="text-sm text-neutral-700 mt-1">{x.a}</div>
                  </div>
                ))}
              </div>
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

          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
            <div className="text-sm font-semibold">Ask about this item</div>
            <a className="mt-2 block text-sm underline" href={wa} target="_blank">
              WhatsApp with Product Key pre-filled
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
