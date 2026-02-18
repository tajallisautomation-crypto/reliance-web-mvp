export const dynamic = "force-dynamic";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

export default async function Page() {
  let products: any[] = [];

  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });
    const text = await res.text();
    const rows = parseCSV(text);

    products = rows
      .map(r => ({
        product_key: r.product_key || r.model,
        brand: r.brand,
        category: r.category,
        model: r.model,
        retail_price: Number(r.retail_price) || null,
        minimum_price: Number(r.cash_floor) || null
      }))
      .filter(p => p.product_key);
  } catch (e) {
    console.error("CSV fetch failed:", e);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Reliance by Tajalli’s</h1>
      <p>Total Products: {products.length}</p>

      <ul>
        {products.slice(0, 10).map((p) => (
          <li key={p.product_key}>
  <a href={`/p/${encodeURIComponent(p.product_key)}`} style={{ textDecoration: "none" }}>
    {p.brand} {p.model} — PKR {p.retail_price ?? p.minimum_price}
  </a>
</li>

        ))}
      </ul>
    </main>
  );
}
