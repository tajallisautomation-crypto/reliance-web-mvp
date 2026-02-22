import { NextResponse } from "next/server";
import { fetchOutboxNext, ackOutbox } from "@/lib/relianceApi";
import { waSendText } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { ok, outbox } = await fetchOutboxNext(25);
    if (!ok) return NextResponse.json({ ok: false, error: "Sheet returned not ok" }, { status: 502 });

    let sent = 0;
    let failed = 0;

    for (const m of outbox || []) {
      const id = m.Message_ID;
      const to = m.To;
      const text = (m.Body || "").trim();

      if (!id || !to || !text) {
        await ackOutbox(id || "UNKNOWN", "FAILED", "", "Missing id/to/text");
        failed++;
        continue;
      }

      try {
        const providerId = await waSendText(to, text);
        await ackOutbox(id, "SENT", providerId, "");
        sent++;
      } catch (e: any) {
        await ackOutbox(id, "FAILED", "", String(e?.message || e));
        failed++;
      }
    }

    return NextResponse.json({ ok: true, sent, failed });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
