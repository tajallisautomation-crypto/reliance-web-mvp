export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function parseCSV(text: string) {
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows[0].map(h => h.trim().toLowerCase());

  return rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = row[i]?.trim() || "";
    });
    return obj;
  });
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });
    const text = await res.text();

    const rows = parseCSV(text);

    const products = rows
      .filter(r => r.product_key || r.model)
      .map(r => ({
        product_key: r.product_key || r.model,
        brand: r.brand,
        category: r.category,
        model: r.model,
        retail_price: Number(r.retail_price) || null,
        minimum_price: Number(r.cash_floor) || null,
        warranty: r.warranty,
        image_url_1: r.image_url_1,
        image_url_2: r.image_url_2,
        description: r.description,
        specifications: r.specifications,
        tags: r.tags,
        availability: "available"
      }));

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
