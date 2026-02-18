export const dynamic = "force-dynamic";

export default async function Product({ params }: any) {
  const res = await fetch(
    `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/reliance/products`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const p = (data.products || []).find((x: any) => x.product_key === params.id);

  if (!p) return <main style={{ padding: 24 }}>Not found</main>;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>{p.brand} {p.model}</h2>
      <div>Category: {p.category}</div>
      <div>Price: PKR {p.retail_price ?? p.minimum_price}</div>

      <h3>Checkout</h3>
      <form action="/api/order" method="post">
        <input type="hidden" name="product_id" value={p.product_key} />
        <input name="phone" placeholder="Your WhatsApp number" />
        <select name="mode">
          <option value="bank">Bank transfer</option>
          <option value="cod">Cash on delivery</option>
          <option value="card">Card</option>
          <option value="credit">Installments</option>
          <option value="lead">Just contact me</option>
        </select>
        <button type="submit">Place order</button>
      </form>
    </main>
  );
}
