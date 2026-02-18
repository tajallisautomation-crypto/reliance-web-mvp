export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/reliance/products", {
      cache: "no-store",
    });

    if (!res.ok) return { products: [] };

    return await res.json();
  } catch {
    return { products: [] };
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
