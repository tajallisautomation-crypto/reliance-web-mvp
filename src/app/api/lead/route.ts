import { NextResponse } from "next/server";

const LEAD_ENDPOINT = process.env.LEADS_WEBHOOK_URL; 
// Example: your Apps Script Web App exec URL with path=lead

export async function POST(req: Request) {
  if (!LEAD_ENDPOINT) {
    return NextResponse.json({ ok: false, error: "Missing LEADS_WEBHOOK_URL" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.phone) return NextResponse.json({ ok: false, error: "Missing phone" }, { status: 400 });

  const r = await fetch(LEAD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);

  if (!r || !r.ok) {
    return NextResponse.json({ ok: false, error: "Lead forward failed" }, { status: 502 });
  }

  const out = await r.json().catch(() => ({ ok: true }));
  return NextResponse.json({ ok: !!out?.ok, ...out });
}
