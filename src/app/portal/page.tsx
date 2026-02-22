"use client";

import { useEffect, useMemo, useState } from "react";

const SITE_WA = process.env.NEXT_PUBLIC_ADMIN_WA || "923354266238";

const BANK = {
  bank: "Meezan Bank",
  accountTitle: "TAJALLI'S HOME COLLECTION",
  accountNumber: "01060101874794",
  iban: "PK33MEZN0001060101874794"
};

async function apiPost(route: string, body: any) {
  const base = process.env.APPS_SCRIPT_URL!;
  const token = process.env.APPS_SCRIPT_TOKEN!;
  const res = await fetch(`${base}?route=${route}&token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  return res.json();
}

async function apiGet(route: string, qs: Record<string,string>) {
  const base = process.env.APPS_SCRIPT_URL!;
  const token = process.env.APPS_SCRIPT_TOKEN!;
  const params = new URLSearchParams({ route, token, ...qs });
  const res = await fetch(`${base}?${params.toString()}`, { cache: "no-store" });
  return res.json();
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const s = String(reader.result || "");
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    reader.readAsDataURL(file);
  });
}

function timeline(status: string) {
  const steps = ["Order Placed", "Verified", "Dispatched", "Delivered"];
  const idx = Math.max(0, steps.indexOf(status));
  return steps.map((s, i) => ({ s, done: i <= idx }));
}

export default function Portal() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function requestOtp() {
    setBusy(true); setMsg("");
    const r = await apiPost("otp_request", { phone });
    setBusy(false);
    setMsg(r.ok ? "OTP generated. (MVP: OTP is logged server-side for now.)" : (r.error || "Error"));
  }

  async function verifyOtp() {
    setBusy(true); setMsg("");
    const r = await apiPost("otp_verify", { phone, otp });
    setBusy(false);
    if (!r.ok) { setMsg(r.error || "Invalid OTP"); return; }
    setVerified(true);
    setMsg("Verified. Loading portal…");
    await reloadAll(phone);
    setMsg("");
  }

  async function reloadAll(p: string) {
    const [o, ins, w, prof] = await Promise.all([
      apiGet("portal_orders", { phone: p }),
      apiGet("portal_installments", { phone: p }),
      apiGet("portal_warranties", { phone: p }),
      apiGet("portal_profile", { phone: p })
    ]);
    setOrders(o.orders || []);
    setInstallments(ins.installments || []);
    setWarranties(w.warranties || []);
    setProfile(prof.profile || null);
  }

  const rewardPoints = profile?.reward_points ?? 0;
  const creditLimit = profile?.credit_limit ?? 0;

  async function uploadProof(order_id: string, file: File) {
    setBusy(true); setMsg("");
    try {
      const base64 = await toBase64(file);
      const r = await apiPost("proof_upload", { phone, order_id, filename: file.name, base64 });
      if (!r.ok) setMsg(r.error || "Upload failed");
      else setMsg("Proof uploaded successfully.");
      await reloadAll(phone);
    } finally {
      setBusy(false);
    }
  }

  function waOrder(order_id: string) {
    const text = `Assalam-o-Alaikum. Please update me about Order ID: ${order_id}`;
    return `https://wa.me/${SITE_WA}?text=${encodeURIComponent(text)}`;
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setMsg("Copied.");
    setTimeout(() => setMsg(""), 1200);
  }

  return (
    <main className="mx-auto max-w-6xl p-6 font-sans">
      <div className="text-2xl font-semibold">Customer Portal</div>
      <div className="text-sm text-neutral-600 mt-1">Orders • Installments • Warranty • Profile</div>

      {!verified ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-semibold">Login with OTP</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+92..." className="rounded-xl border px-3 py-2" />
            <button disabled={busy || !phone} onClick={requestOtp} className="rounded-xl border px-3 py-2 hover:bg-neutral-50">
              Request OTP
            </button>
            <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter OTP" className="rounded-xl border px-3 py-2" />
          </div>
          <div className="mt-3">
            <button disabled={busy || !phone || !otp} onClick={verifyOtp} className="rounded-xl bg-black text-white px-4 py-2">
              Verify & Enter Portal
            </button>
          </div>
          {msg ? <div className="mt-3 text-sm text-neutral-700">{msg}</div> : null}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm text-neutral-600">Credit Limit</div>
              <div className="text-2xl font-semibold">PKR {creditLimit}</div>
              <div className="text-xs text-neutral-500 mt-1">Increases with repayment history.</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm text-neutral-600">Reward Points</div>
              <div className="text-2xl font-semibold">{rewardPoints}</div>
              <div className="text-xs text-neutral-500 mt-1">Tajalli Reward Points.</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-semibold">Bank Details</div>
              <div className="text-sm mt-2">{BANK.bank}</div>
              <div className="text-xs text-neutral-600 mt-1">Account: {BANK.accountNumber}</div>
              <div className="text-xs text-neutral-600">IBAN: {BANK.iban}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>copy(BANK.accountNumber)} className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">Copy Account</button>
                <button onClick={()=>copy(BANK.iban)} className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">Copy IBAN</button>
              </div>
            </div>
          </div>

          {msg ? <div className="mt-4 text-sm text-neutral-700">{msg}</div> : null}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border bg-white p-5">
              <div className="text-lg font-semibold">Order History & Live Tracking</div>
              <div className="text-sm text-neutral-600 mt-1">Status timeline + WhatsApp quick link.</div>

              <div className="mt-4 space-y-4">
                {orders.length === 0 ? (
                  <div className="text-sm text-neutral-600">No orders found for this number.</div>
                ) : orders.map(o => (
                  <div key={o.order_id} className="rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Order {o.order_id}</div>
                      <a className="text-sm underline" target="_blank" href={waOrder(o.order_id)}>
                        Ask about this order
                      </a>
                    </div>

                    <div className="text-sm text-neutral-600 mt-1">Status: {o.status}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {timeline(o.status).map((t, i) => (
                        <div key={i} className={`text-xs rounded-full px-3 py-1 border ${t.done ? "bg-green-50 border-green-200" : "bg-neutral-50 border-neutral-200"}`}>
                          {t.s}
                        </div>
                      ))}
                    </div>

                    {o.tracking_notes ? (
                      <div className="mt-3 text-sm text-neutral-700">Notes: {o.tracking_notes}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <div className="text-lg font-semibold">Installment Management (Khata View)</div>
              <div className="text-sm text-neutral-600 mt-1">Upload payment proof for next installment.</div>

              <div className="mt-4 space-y-4">
                {installments.length === 0 ? (
                  <div className="text-sm text-neutral-600">No installment plans found.</div>
                ) : installments.map(ins => (
                  <div key={ins.order_id} className="rounded-xl border border-neutral-200 p-4">
                    <div className="font-medium">Order {ins.order_id}</div>
                    <div className="text-sm mt-1">Plan: {ins.plan_months} months</div>
                    <div className="text-sm">Total: PKR {ins.total_price}</div>
                    <div className="text-sm">Paid: PKR {ins.amount_paid}</div>
                    <div className="text-sm">Remaining: PKR {ins.remaining}</div>
                    <div className="text-sm">Next Due: {String(ins.next_due_date || "").slice(0, 10)}</div>

                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={busy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadProof(ins.order_id, f);
                        }}
                      />
                    </div>

                    {ins.last_proof_file_url ? (
                      <a className="mt-2 block text-sm underline" target="_blank" href={ins.last_proof_file_url}>
                        View last uploaded proof
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 rounded-2xl border bg-white p-5">
            <div className="text-lg font-semibold">Digital Warranty Cards</div>
            <div className="text-sm text-neutral-600 mt-1">Days remaining + claim action.</div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {warranties.length === 0 ? (
                <div className="text-sm text-neutral-600">No warranties found.</div>
              ) : warranties.map((w, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-4">
                  <div className="font-medium">Order {w.order_id}</div>
                  <div className="text-sm mt-1">Product Key: {w.product_key}</div>
                  <div className="text-sm">Days Remaining: {w.days_remaining ?? "—"}</div>
                  <a
                    className="mt-3 inline-block rounded-xl bg-black text-white px-4 py-2 text-sm"
                    target="_blank"
                    href={`https://wa.me/${SITE_WA}?text=${encodeURIComponent(`Warranty claim request. Order: ${w.order_id}, Product: ${w.product_key}`)}`}
                  >
                    Start warranty claim
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
