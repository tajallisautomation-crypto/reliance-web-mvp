export default async function Product({ params }: any) {
  const base = process.env.CONTROL_PLANE_URL!;
  const res = await fetch(`${base}?path=api/products`, { cache: "no-store" });
  const data = await res.json();
  const p = (data.items || []).find((x:any) => x.id === params.id);
  if (!p) return <main style={{padding:24}}>Not found</main>;

  return (
    <main style={{padding:24, fontFamily:"system-ui"}}>
      <h2>{p.brand} {p.model}</h2>
      <div>Category: {p.category}</div>
      <div>Price: PKR {p.retail}</div>
      <pre style={{whiteSpace:"pre-wrap"}}>{p.specs}</pre>

      <h3>Checkout</h3>
      <form action="/api/order" method="post">
        <input type="hidden" name="product_id" value={p.id} />
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
