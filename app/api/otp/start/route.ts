import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phone } = await req.json();
  const base = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!base || !token) return NextResponse.json({ ok:false, error:"Missing env" }, { status: 500 });

  const url = `${base}?route=otp_start&token=${token}`;
  const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone }) });
  const out = await r.json();
  return NextResponse.json(out);
}
