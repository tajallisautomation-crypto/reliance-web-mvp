import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const product_id = String(form.get("product_id") || "");
  const phone = String(form.get("phone") || "");
  const mode = String(form.get("mode") || "lead");

  const base = process.env.CONTROL_PLANE_URL!;
  // fetch product for price
  const feed = await fetch(`${base}?path=api/products`, { cache: "no-store" });
  const data = await feed.json();
  const p = (data.items || []).find((x:any)=>x.id===product_id);

  const subtotal = p?.retail || 0;

  const payload = {
    customer_phone: phone,
    mode,
    items: [{ product_id, qty: 1, unit_price: subtotal }],
    subtotal,
    discount: 0,
    advance: 0,
    installment_months: 0
  };

  const r = await fetch(`${base}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

  const out = await r.json();
  return NextResponse.redirect(new URL(`/portal?phone=${encodeURIComponent(phone)}`, req.url));
}
