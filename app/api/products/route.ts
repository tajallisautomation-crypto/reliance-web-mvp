import { NextResponse } from "next/server";
import { fetchProducts } from "../../../lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json({
      ok: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("API /products error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
