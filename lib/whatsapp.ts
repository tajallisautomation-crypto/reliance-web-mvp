export async function waSendText(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.PHONE_NUMBER_ID!;
  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneId)}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`WA send failed ${res.status}: ${body}`);

  const json = JSON.parse(body);
  const msgId = json?.messages?.[0]?.id || "";
  return msgId;
}
