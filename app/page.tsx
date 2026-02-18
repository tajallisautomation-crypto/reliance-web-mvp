export const dynamic = "force-dynamic";

export default async function Page() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/reliance/products`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const products = data?.products || [];

  return (
    <main style={{ padding: 20 }}>
      <h1>Reliance by Tajalli’s</h1>
      <p>Total Products: {products.length}</p>
    </main>
  );
}
