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

export default async function Product({ params }: any) {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCSV(text);

  const product = rows.find(
    (r: any) => (r.product_key || r.model) === params.id
  );

  if (!product) {
    return <main style={{ padding: 24 }}>Product not found</main>;
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>{product.brand} {product.model}</h1>

      <div style={{ marginTop: 20 }}>
        <img
          src={product.image_url_1}
          alt={product.model}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Category:</strong> {product.category}
      </div>

      <div>
        <strong>Price:</strong> PKR {product.retail_price || product.cash_floor}
      </div>

      <div>
        <strong>Warranty:</strong> {product.warranty}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Description:</strong>
        <p>{product.description}</p>
      </div>

      <div>
        <strong>Specifications:</strong>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {product.specifications}
        </pre>
      </div>

      <div style={{ marginTop: 30 }}>
        <a
          href={`https://wa.me/923354266238?text=I'm interested in ${product.brand} ${product.model}`}
          target="_blank"
        >
          <button style={{ padding: "10px 20px", fontSize: 16 }}>
            Chat on WhatsApp
          </button>
        </a>
      </div>
    </main>
  );
}
