export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function parseCSV(text: string) {
  const rows = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current);
    rows.push(result.map(cell => cell.replace(/^"|"$/g, "").trim()));
  }

  return rows;
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });
    const text = await res.text();

    const rows = parseCSV(text);

    const headers = rows[0].map(h => h.toLowerCase());
    const dataRows = rows.slice(1);

    const products = dataRows.map(row => {
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });

      return {
        product_key: obj.product_key || obj.model,
        brand: obj.brand,
        category: obj.category,
        model: obj.model,
        retail_price: Number(obj.retail_price) || null,
        minimum_price: Number(obj.cash_floor) || null,
        warranty: obj.warranty,
        image_url_1: obj.image_url_1,
        image_url_2: obj.image_url_2,
        description: obj.description,
        specifications: obj.specifications,
        tags: obj.tags,
        availability: obj.availibility || "In Stock"
      };
    }).filter(p => p.product_key);

    return Response.json({
      ok: true,
      count: products.length,
      products
    });

  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
