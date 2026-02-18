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
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCSV(text);

  const products = rows
    .map(r => ({
      product_key: r.product_key || r.model,
      brand: r.brand,
      category: r.category,
      model: r.model,
      retail_price: Number(r.retail_price) || null,
      minimum_price: Number(r.cash_floor) || null,
      warranty: r.warranty,
      image: r.image_url_1,
      description: r.description,
    }))
    .filter(p => p.product_key);

  return (
    <main style={{ padding: 30, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 30 }}>Reliance by Tajalli’s</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {products.map((p) => (
          <a
            key={p.product_key}
            href={`/p/${encodeURIComponent(p.product_key)}`}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: 15,
              textDecoration: "none",
              color: "black",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.model}
                  style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
              ) : (
                <div style={{ fontSize: 12 }}>No Image</div>
              )}
            </div>

            <div style={{ fontWeight: 600 }}>
              {p.brand} {p.model}
            </div>

            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              {p.category}
            </div>

            <div style={{ marginTop: 8, fontWeight: 700 }}>
              PKR {p.retail_price ?? p.minimum_price}
            </div>

            <div style={{ fontSize: 12, marginTop: 6 }}>
              Warranty: {p.warranty}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
