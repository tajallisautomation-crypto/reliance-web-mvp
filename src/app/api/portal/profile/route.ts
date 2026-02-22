import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;
  if (!base || !token) return NextResponse.json({ ok:false, error:"Missing env" }, { status: 500 });

  const session = req.headers.get("x-portal-token") || "";
  const body = await req.json();

  const url = `${base}?route=portal_profile_save&token=${token}&session=${encodeURIComponent(session)}`;
  const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
  const out = await r.json();
  return NextResponse.json(out);
}
