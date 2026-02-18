"use client";

import { useState } from "react";

export default function AdminClient() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [data, setData] = useState<any>(null);

  async function startOtp() {
    const r = await fetch("/api/otp/start", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone }) });
    const out = await r.json();
    if (!out?.ok) return alert(out?.error || "Failed");
    setOtpSent(true);
  }

  async function verifyOtp() {
    const r = await fetch("/api/otp/verify", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone, otp, admin: true }) });
    const out = await r.json();
    if (!out?.ok) return alert(out?.error || "Failed");
    setToken(out.session_token);
  }

  async function loadCustomer() {
    const r = await fetch("/api/admin/customer", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-portal-token": token },
      body: JSON.stringify({ phone: targetPhone }),
    });
    const out = await r.json();
    if (!out?.ok) return alert(out?.error || "Failed");
    setData(out);
  }

  async function updateStatus(order_id: string, status: string) {
    const r = await fetch("/api/admin/update-status", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-portal-token": token },
      body: JSON.stringify({ order_id, status }),
    });
    const out = await r.json();
    if (!out?.ok) return alert(out?.error || "Failed");
    alert("Updated");
    loadCustomer();
  }

  if (!token) {
    return (
      <main className="max-w-lg mx-auto p-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-xs text-neutral-500">Admin Portal</div>
          <div className="text-2xl font-semibold mt-1">OTP Login</div>

          <input className="mt-4 w-full rounded-xl border px-3 py-2" placeholder="Admin phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />

          {!otpSent ? (
            <button className="mt-3 w-full rounded-xl bg-neutral-900 text-white py-2 text-sm" onClick={startOtp}>
              Send OTP
            </button>
          ) : (
            <>
              <input className="mt-3 w-full rounded-xl border px-3 py-2" placeholder="OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
              <button className="mt-3 w-full rounded-xl bg-neutral-900 text-white py-2 text-sm" onClick={verifyOtp}>
                Verify
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-2xl font-semibold">Admin Console</div>
        <div className="text-sm text-neutral-600 mt-1">Search a customer phone to view + update their records.</div>

        <div className="mt-4 flex gap-2">
          <input className="flex-1 rounded-xl border px-3 py-2" placeholder="Customer phone" value={targetPhone} onChange={(e)=>setTargetPhone(e.target.value)} />
          <button className="rounded-xl bg-neutral-900 text-white px-4" onClick={loadCustomer}>Load</button>
        </div>
      </div>

      {data ? (
        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-6">
            <div className="font-semibold">Orders</div>
            <div className="mt-4 space-y-3">
              {(data.orders || []).map((o:any) => (
                <div key={o.order_id} className="rounded-xl border p-4">
                  <div className="font-medium">{o.order_id}</div>
                  <div className="text-sm text-neutral-600 mt-1">Status: {o.status}</div>
                  <div className="mt-3 flex gap-2">
                    {["Order Placed","Verified","Dispatched","Delivered"].map(s => (
                      <button key={s} className="text-xs rounded-lg border px-2 py-1" onClick={()=>updateStatus(o.order_id, s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <div className="font-semibold">Installments / Warranty / Rewards</div>
            <pre className="mt-3 text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      ) : null}
    </main>
  );
}
