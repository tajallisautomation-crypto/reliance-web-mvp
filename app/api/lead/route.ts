import { NextResponse } from "next/server";

function scoreLead(body: any) {
  let score = 10;

  const phone = String(body?.phone || "").trim();
  if (phone.length >= 10) score += 10;

  const msg = String(body?.message || "").toLowerCase();
  const title = String(body?.title || "").toLowerCase();

  const creditSignals = ["installment", "installments", "credit", "emi", "months", "12", "6", "3"];
  if (creditSignals.some(k => msg.includes(k) || title.includes(k))) score += 20;

  const urgencySignals = ["urgent", "today", "now", "asap", "delivery", "available"];
  if (urgencySignals.some(k => msg.includes(k))) score += 10;

  const highIntentSignals = ["buy", "order", "confirm", "final", "price"];
  if (highIntentSignals.some(k => msg.includes(k))) score += 10;

  if (body?.product_key) score += 20;

  // clamp
  if (score > 100) score = 100;
  return score;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const base = process.env.APPS_SCRIPT_URL;
    const token = process.env.APPS_SCRIPT_TOKEN;

    if (!base || !token) {
      return NextResponse.json({ ok: false, error: "Missing env vars" }, { status: 500 });
    }

    const leadScore = scoreLead(body);

    const payload = {
      ...body,
      score: leadScore,
      scored_at: new Date().toISOString(),
    };

    const url = `${base}?route=lead&token=${token}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // plausible event (server-safe no-op; kept for consistency)
    return NextResponse.json({ ok: true, score: leadScore });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
