import { fetchProducts } from "../../../lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: any) {
  const products = await fetchProducts();

  return (
    <main style={{ padding: 40 }}>
      <h2>URL PARAM:</h2>
      <div>{params.id}</div>

      <h2 style={{ marginTop: 30 }}>First 5 Product Keys:</h2>
      <ul>
        {products.slice(0, 5).map((p, i) => (
          <li key={i}>{p.product_key}</li>
        ))}
      </ul>
    </main>
  );
}
