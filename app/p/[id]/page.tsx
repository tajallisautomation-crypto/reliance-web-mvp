import { fetchProductBySlug, isDirectImageUrl } from "../../../lib/products";

export const dynamic = "force-dynamic";

function ceilTo500(n: number) {
  return Math.ceil(n / 500) * 500;
}

const CREDIT_MULTIPLIERS: Record<number, number> = {
  3: 1.12,
  6: 1.20,
  12: 1.35,
};

function money(n?: number | null) {
  if (!n) return "Price on request";
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

function buildLongDescription(p: any) {
  if (p.description && p.description.length > 120) return p.description;

  return `${p.brand} ${p.model} is selected for reliable everyday performance and practical ownership in Pakistan. 
It is a strong pick where voltage variation, heavy usage, and serviceability matter.
For final confirmation of availability, delivery, and warranty handling, WhatsApp is the fastest route.`;
}

function buildUseCase(p: any) {
  const cat = String(p.category || "").toLowerCase();
  if (cat.includes("air")) return "Ideal for bedrooms, lounges, and offices where dependable cooling matters.";
  if (cat.includes("washing")) return "Ideal for family households needing consistent wash performance and durability.";
  if (cat.includes("battery") || cat.includes("solar")) return "Ideal for backup power, solar storage, and load-shedding protection.";
  if (cat.includes("refriger") || cat.includes("freezer")) return "Ideal for safe food storage at home and retail use.";
  return "Ideal for households and offices looking for dependable everyday performance with warranty-backed support.";
}

function productFAQs() {
  return [
    {
      q: "How do I place an order?",
      a: "Tap WhatsApp to order. Share your city and preferred payment method (COD, bank transfer, etc.) and we will confirm delivery and availability.",
    },
    {
      q: "Do you offer installments?",
      a: "We provide an installment estimate on this page. Final installment availability and terms are confirmed on WhatsApp.",
    },
    {
      q: "Is warranty included?",
      a: "Warranty details are shown on the product. If you need confirmation or claim support, contact us on WhatsApp.",
    },
    {
      q: "Is delivery available in my city?",
      a: "We support nationwide delivery across Pakistan. Delivery timing and charges depend on city and product size.",
    },
  ];
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

  // Admin WhatsApp for higher intent/order handling
  const adminWA = "923354266238";
  const msg =
    `I want: ${p.brand} ${p.model}\n` +
    `Price: PKR ${price}\n` +
    `Product Key: ${p.product_key}`;

  const wa = `https://wa.me/${adminWA}?text=${encodeURIComponent(msg)}`;

  const longDesc = buildLongDescription(p);
  const useCase = buildUseCase(p);

  const productJsonLd = {
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
      url: `https://reliance.tajallis.com.pk/p/${p.slug}`,
    },
  };

  const faqs = productFAQs();
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <a href="/" className="text-sm underline">← Back to catalogue</a>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="h-80 bg-neutral-100 flex items-center justify-center rounded-xl overflow-hidden relative">
            {isDirectImageUrl(p.image_url_1) ? (
              <img
                src={p.image_url_1}
                alt={p.model}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
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
          <div className="text-xs text-neutral-600">{p.curated_category_label}</div>
          <h1 className="mt-1 text-2xl font-semibold">{p.brand} {p.model}</h1>

          <div className="mt-3 text-2xl font-semibold">
            {money(price)}
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href={wa}
              target="_blank"
              className="rounded-xl bg-green-600 text-white px-5 py-3 text-sm font-medium hover:bg-green-700"
            >
              WhatsApp to order
            </a>
            <a
              href="/"
              className="rounded-xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
            >
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
            {[3, 6, 12].map((m) => {
              const total = ceilTo500(price * (CREDIT_MULTIPLIERS[m] ?? 1));
              const monthly = ceilTo500(total / m);
              return (
                <div key={m} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="font-medium">{m} months</div>
                  <div className="text-sm">Total: PKR {total.toLocaleString("en-PK")}</div>
                  <div className="text-sm">Monthly: PKR {monthly.toLocaleString("en-PK")}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">FAQs</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((f) => (
            <div key={f.q}>
              <div className="font-medium">{f.q}</div>
              <div className="text-sm text-neutral-700 mt-1">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
