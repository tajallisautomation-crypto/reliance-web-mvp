import { fetchProductByKey, isDirectImageUrl } from "../../../lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: any) {
  const p = await fetchProductByKey(params.id);

  if (!p) {
    return { title: "Product not found - Reliance by Tajalli’s" };
  }

  const title = `${p.brand} ${p.model} - Reliance by Tajalli’s`;
  const desc = p.description || `Buy ${p.brand} ${p.model} in Pakistan. WhatsApp-first ordering.`;
  const img = isDirectImageUrl(p.image_url_1) ? p.image_url_1 : undefined;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: img ? [img] : [],
    },
  };
}

export default async function ProductPage({ params }: any) {
  const p = await fetchProductByKey(params.id);

  if (!p) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="text-xl font-semibold">Product not found</div>
        <a className="underline text-sm" href="/">Back to products</a>
      </main>
    );
  }

  const price = p.retail_price ?? p.minimum_price;
  const whatsappNumberDigits = "923354266238";
  const msg = `I want: ${p.brand} ${p.model}\nPrice: PKR ${price ?? ""}\nProduct Key: ${p.product_key}`;
  const wa = `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(msg)}`;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <a className="underline text-sm" href="/">Back to products</a>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="h-72 bg-neutral-100 flex items-center justify-center overflow-hidden rounded-lg">
            {isDirectImageUrl(p.image_url_1) ? (
              <img src={p.image_url_1} alt={p.model} className="h-full w-full object-contain" />
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

          {p.image_url_2 ? (
            <div className="mt-3 text-xs">
              <a className="underline" href={p.image_url_2} target="_blank">More images</a>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="text-sm text-neutral-600">{p.category}</div>
          <h1 className="mt-1 text-2xl font-semibold">{p.brand} {p.model}</h1>

          <div className="mt-3 text-xl font-semibold">
            {price ? `PKR ${price}` : "Price on request"}
          </div>

          <div className="mt-2 text-sm text-neutral-700">
            Availability: {p.availability || "—"}
          </div>

          <div className="mt-1 text-sm text-neutral-700">
            Warranty: {p.warranty || "—"}
          </div>

          <div className="mt-4 flex gap-3">
            <a href={wa} target="_blank" className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm">
              WhatsApp to order
            </a>
            <a href="/" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm">
              Continue browsing
            </a>
          </div>

          {p.description ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Description</div>
              <p className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">{p.description}</p>
            </div>
          ) : null}

          {p.specifications ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Specifications</div>
              <pre className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">{p.specifications}</pre>
            </div>
          ) : null}

          {p.tags ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Tags</div>
              <div className="mt-2 text-sm text-neutral-700">{p.tags}</div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
