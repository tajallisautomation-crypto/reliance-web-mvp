export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    const res = await fetch(
      `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/reliance/products`,
      { cache: "no-store" }
    );
    return await res.json();
  } catch {
    return { ok: false, products: [] };
  }
}

export default async function Page() {
  const data = await getProducts();
  const products = data?.products || [];

  return (
    <main style={{ padding: 20 }}>
      <h1>Reliance by Tajalli’s</h1>
      <p>Total Products: {products.length}</p>

      <ul>
        {products.slice(0, 10).map((p: any) => (
          <li key={p.product_key}>
            {p.brand} {p.model} — {p.retail_price ?? p.minimum_price}
          </li>
        ))}
      </ul>
    </main>
  );
}
