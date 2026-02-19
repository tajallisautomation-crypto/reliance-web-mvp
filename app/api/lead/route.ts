import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  const base = process.env.APPS_SCRIPT_URL!;
  const token = process.env.APPS_SCRIPT_TOKEN!;

  const r = await fetch(`${base}?route=lead&token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const out = await r.json().catch(() => ({ ok: false }));
  return NextResponse.json(out);
}
