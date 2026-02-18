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

  const adminWA = "923354266238";
  const msg =
    `I want: ${p.brand} ${p.model}\n` +
    `Price: PKR ${price}\n` +
    `Product Key: ${p.product_key}`;

  const wa = `https://wa.me/${adminWA}?text=${encodeURIComponent(msg)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brand} ${p.model}`,
    brand: { "@type": "Brand", name: p.brand },
    category: p.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: String(price),
      availability: "https://schema.org/InStock",
      url: `https://reliance.tajallis.com.pk/p/${p.slug}`,
    },
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="/" className="text-sm underline">← Back to catalogue</a>

      <div className="mt-6 grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border bg-white p-4">
          <div className="h-96 bg-neutral-100 flex items-center justify-center rounded-xl overflow-hidden">
            {isDirectImageUrl(p.image_url_1) ? (
              <img
                src={p.image_url_1}
                alt={p.model}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-sm text-neutral-500">No image available</div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs text-neutral-500">
            {p.curated_category_label}
          </div>

          <h1 className="mt-1 text-2xl font-semibold">
            {p.brand} {p.model}
          </h1>

          <div className="mt-3 text-3xl font-semibold">
            {money(price)}
          </div>

          <div className="mt-4">
            <a
              href={wa}
              target="_blank"
              className="inline-block rounded-xl bg-green-600 text-white px-6 py-3 text-sm font-medium hover:bg-green-700"
              onClick={() => {
                // @ts-ignore
                window.plausible?.("WhatsApp_Click", {
                  props: { slug: p.slug, placement: "product_page" },
                });
              }}
            >
              WhatsApp to order
            </a>
          </div>

          <div className="mt-6 text-sm text-neutral-700 whitespace-pre-wrap">
            {p.description}
          </div>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 border rounded-2xl bg-white p-6">
          <h2 className="text-lg font-semibold">Specifications</h2>
          {p.specifications ? (
            <pre className="mt-3 text-sm whitespace-pre-wrap">
              {p.specifications}
            </pre>
          ) : (
            <div className="mt-3 text-sm text-neutral-600">
              Specifications available on request.
            </div>
          )}
        </section>

        <section className="border rounded-2xl bg-white p-6">
          <h2 className="text-lg font-semibold">Installment calculator</h2>

          <div className="mt-4 space-y-3">
            {[3, 6, 12].map(m => {
              const total = ceilTo500(price * CREDIT_MULTIPLIERS[m]);
              const monthly = ceilTo500(total / m);

              return (
                <div key={m} className="rounded-xl border bg-neutral-50 p-3">
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
