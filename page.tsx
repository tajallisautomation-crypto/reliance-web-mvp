export default async function Home() {
  const base = process.env.CONTROL_PLANE_URL!;
  const res = await fetch(`${base}?path=api/products`, { cache: "no-store" });
  const data = await res.json();
  const items = data.items || [];

  return (
    <main style={{padding:24, fontFamily:"system-ui"}}>
      <h1>Tajalli's Home Collection</h1>
      <p>Browse products. Prices are governance-controlled from Minimum Price.</p>

      <ul>
        {items.map((p:any) => (
          <li key={p.id} style={{margin:"12px 0"}}>
            <a href={`/p/${p.id}`}>{p.brand} {p.model}</a>
            <div>PKR {p.retail}</div>
          </li>
        ))}
      </ul>

      <a href="/portal">Customer Portal</a>
    </main>
  );
}
