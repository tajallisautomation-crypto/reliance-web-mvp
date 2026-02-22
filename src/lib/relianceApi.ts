export async function fetchOutboxNext(limit = 25) {
  const base = process.env.SHEET_WEBAPP_URL!;
  const res = await fetch(`${base}?action=outbox_next&limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Outbox fetch failed: ${res.status}`);
  return res.json() as Promise<{ ok: boolean; outbox: any[] }>;
}

export async function ackOutbox(message_id: string, status: "SENT" | "FAILED", provider_message_id?: string, error?: string) {
  const base = process.env.SHEET_WEBAPP_URL!;
  const res = await fetch(`${base}?action=outbox_ack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ message_id, status, provider_message_id: provider_message_id || "", error: error || "" }),
  });
  if (!res.ok) throw new Error(`Outbox ack failed: ${res.status}`);
  return res.json();
}
