import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const product_id = String(form.get("product_id") || "");
  const phone = String(form.get("phone") || "");
  const mode = String(form.get("mode") || "lead");

  console.log("Order received:", { product_id, phone, mode });

  return NextResponse.redirect(
    new URL(`/portal?phone=${encodeURIComponent(phone)}`, req.url)
  );
}
