"use client";

import { useEffect, useMemo, useState } from "react";
import type { Installment, Order, Profile, Rewards, WarrantyCard } from "../lib/portalTypes";

function fmtDate(s: string) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}
function money(n: number) {
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-neutral-600">
        <div>{label}</div><div>{value}</div>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-2 bg-neutral-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PortalClient() {
  const [step, setStep] = useState<"otp"|"dash">("otp");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [warranties, setWarranties] = useState<WarrantyCard[]>([]);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(false);

  async function startOtp() {
    setLoading(true);
    try {
      const r = await fetch("/api/otp/start", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ phone }),
      });
      const out = await r.json();
      if (!out?.ok) throw new Error(out?.error || "OTP start failed");
      setOtpSent(true);
      // @ts-ignore
      window.plausible?.("Portal_OTP_Sent", { props: { phone_prefix: phone.slice(0,4) } });
    } catch (e:any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const r = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ phone, otp }),
      });
      const out = await r.json();
      if (!out?.ok || !out?.session_token) throw new Error(out?.error || "OTP verify failed");
      setToken(out.session_token);
      setStep("dash");
      // @ts-ignore
      window.plausible?.("Portal_Login", { props: { phone_prefix: phone.slice(0,4) } });
    } catch (e:any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadPortal() {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch("/api/portal/summary", {
        headers: { "x-portal-token": token },
      });
      const out = await r.json();
      if (!out?.ok) throw new Error(out?.error || "Portal load failed");
      setOrders(out.orders || []);
      setInstallments(out.installments || []);
      setWarranties(out.warranties || []);
      setRewards(out.rewards || null);
      setProfile(out.profile || null);
    } catch (e:any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPortal(); }, [token]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) map[o.status] = (map[o.status] || 0) + 1;
    return map;
  }, [orders]);

  const maxStatus = useMemo(() => Math.max(1, ...Object.values(statusCounts)), [statusCounts]);

  const duesNext7 = useMemo(() => {
    const now = Date.now();
    const in7 = now + 7*24*3600*1000;
    return installments.filter(i => {
      const d = new Date(i.next_due_date).getTime();
      return d >= now && d <= in7 && i.remaining > 0;
    });
  }, [installments]);

  const bank = {
    name: process.env.NEXT_PUBLIC_BANK_NAME,
    title: process.env.NEXT_PUBLIC_BANK_TITLE,
    account: process.env.NEXT_PUBLIC_BANK_ACCOUNT,
    iban: process.env.NEXT_PUBLIC_BANK_IBAN,
  };

  function copy(text?: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
  }

  async function uploadProof(orderId: string, file: File) {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("order_id", orderId);
      fd.append("file", file);

      const r = await fetch("/api/portal/upload-proof", {
        method: "POST",
        headers: { "x-portal-token": token },
        body: fd,
      });
      const out = await r.json();
      if (!out?.ok) throw new Error(out?.error || "Upload failed");
      alert("Uploaded. Admin will verify.");
      // refresh
      await loadPortal();
    } catch (e:any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  function askWhatsApp(orderId: string) {
    const admin = process.env.NEXT_PUBLIC_DEFAULT_WA_ADMIN || "923354266238";
    const msg = `As-salaam-o-alaikum. I want an update on my order.\nOrder ID: ${orderId}\nPhone: ${phone}`;
    // @ts-ignore
    window.plausible?.("Portal_Ask_WhatsApp", { props: { order_id: orderId } });
    window.open(`https://wa.me/${admin}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function submitWarrantyClaim(orderId: string, productKey: string) {
    setLoading(true);
    try {
      const r = await fetch("/api/portal/warranty-claim", {
        method: "POST",
        headers: { "Content-Type":"application/json", "x-portal-token": token },
        body: JSON.stringify({ order_id: orderId, product_key: productKey }),
      });
      const out = await r.json();
      if (!out?.ok) throw new Error(out?.error || "Claim failed");
      alert("Claim created. Admin will contact you.");
      await loadPortal();
    } catch (e:any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(next: Profile) {
    setLoading(true);
    try {
      const r = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type":"application/json", "x-portal-token": token },
        body: JSON.stringify(next),
      });
      const out = await r.json();
      if (!out?.ok) throw new Error(out?.error || "Save failed");
      alert("Saved.");
      await loadPortal();
    } catch (e:any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <main className="max-w-lg mx-auto p-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-xs text-neutral-500">Customer Portal</div>
          <h1 className="mt-1 text-2xl font-semibold">Login with OTP</h1>
          <div className="mt-2 text-sm text-neutral-600">
            No passwords. Enter your phone number to receive an OTP.
          </div>

          <div className="mt-5 space-y-3">
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="+92..."
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
            />

            {!otpSent ? (
              <button
                className="w-full rounded-xl bg-neutral-900 text-white py-2 text-sm"
                disabled={loading || phone.length < 10}
                onClick={startOtp}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <>
                <input
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e)=>setOtp(e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==="Enter") verifyOtp(); }}
                />
                <button
                  className="w-full rounded-xl bg-neutral-900 text-white py-2 text-sm"
                  disabled={loading || otp.length < 4}
                  onClick={verifyOtp}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-xs text-neutral-500">
            If you don’t receive OTP, confirm your number format (e.g., 92370xxxxxxx).
          </div>
        </div>
      </main>
    );
  }

  // DASHBOARD
  const rewardsBalance = rewards?.balance || 0;

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500">Customer Portal</div>
          <h1 className="text-2xl font-semibold mt-1">My Dashboard</h1>
          <div className="text-sm text-neutral-600 mt-1">
            Phone: {phone} • Reward points: {rewardsBalance}
          </div>
        </div>

        <div className="flex gap-2">
          <a href="/" className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50">Shop</a>
          <button
            className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-sm"
            onClick={()=>{ setStep("otp"); setOtpSent(false); setOtp(""); setToken(""); }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Charts row */}
      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="font-semibold">Orders by status</div>
          <div className="mt-4">
            {Object.keys(statusCounts).length === 0 ? (
              <div className="text-sm text-neutral-600">No orders yet.</div>
            ) : (
              Object.entries(statusCounts).map(([k,v]) => (
                <Bar key={k} label={k} value={v} max={maxStatus} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="font-semibold">Installments due (7 days)</div>
          <div className="mt-4 text-sm text-neutral-700">
            {duesNext7.length === 0 ? "No dues in the next 7 days." : `${duesNext7.length} installment(s) due soon.`}
          </div>
          <div className="mt-3 text-xs text-neutral-500">Reminders are sent automatically.</div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="font-semibold">Bank details</div>
          <div className="mt-3 text-sm text-neutral-700">
            <div>{bank.name || "MEEZAN BANK"}</div>
            <div className="mt-2">
              Account: <span className="font-medium">{bank.account || "01060101874794"}</span>
              <button className="ml-2 underline text-xs" onClick={()=>copy(bank.account || "01060101874794")}>Copy</button>
            </div>
            <div className="mt-2">
              IBAN: <span className="font-medium">{bank.iban || "PK33MEZN0001060101874794"}</span>
              <button className="ml-2 underline text-xs" onClick={()=>copy(bank.iban || "PK33MEZN0001060101874794")}>Copy</button>
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Title: {bank.title || "TAJALLI'S HOME COLLECTION"}
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Order History & Live Tracking</div>
            <div className="text-sm text-neutral-600 mt-1">Status timeline + WhatsApp quick link per order.</div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {orders.length === 0 ? (
            <div className="text-sm text-neutral-600">No orders found for this phone number.</div>
          ) : orders.map(o => (
            <div key={o.order_id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold">Order {o.order_id}</div>
                  <div className="text-xs text-neutral-500">Placed: {fmtDate(o.created_at)} • Payment: {o.payment_mode}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={()=>askWhatsApp(o.order_id)}
                  >
                    Ask about this order
                  </button>
                </div>
              </div>

              <div className="mt-3 text-sm">
                <span className="text-neutral-600">Current status:</span> <span className="font-medium">{o.status}</span>
              </div>

              <div className="mt-3 grid md:grid-cols-4 gap-2">
                {o.status_timeline?.length ? o.status_timeline.map(s => (
                  <div key={s.status+s.at} className="rounded-xl bg-neutral-50 border border-neutral-200 p-2 text-xs">
                    <div className="font-medium">{s.status}</div>
                    <div className="text-neutral-500 mt-1">{fmtDate(s.at)}</div>
                  </div>
                )) : (
                  <div className="text-xs text-neutral-500">Timeline not available yet.</div>
                )}
              </div>

              <div className="mt-4 text-sm text-neutral-700">
                Total: {money(o.total)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Installments */}
      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">Installment Management (Khata)</div>
        <div className="text-sm text-neutral-600 mt-1">Schedule, next due date, and proof upload.</div>

        <div className="mt-5 space-y-4">
          {installments.length === 0 ? (
            <div className="text-sm text-neutral-600">No installment plans found.</div>
          ) : installments.map(i => (
            <div key={i.order_id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Order {i.order_id}</div>
                <div className="text-sm text-neutral-700">
                  Remaining: <span className="font-medium">{money(i.remaining)}</span>
                </div>
              </div>

              <div className="mt-2 text-sm text-neutral-700">
                Total: {money(i.total_price)} • Paid: {money(i.amount_paid)} • Next due: {fmtDate(i.next_due_date)}
              </div>

              <div className="mt-3 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-neutral-500">
                    <tr>
                      <th className="text-left py-2">Due date</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {i.schedule?.map((s, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2">{fmtDate(s.due_date)}</td>
                        <td className="py-2">{money(s.amount)}</td>
                        <td className="py-2">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Upload payment proof</div>
                <div className="text-xs text-neutral-500 mt-1">Upload bank transfer / EasyPaisa receipt screenshot.</div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e)=>{
                    const f = e.target.files?.[0];
                    if (f) uploadProof(i.order_id, f);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warranty */}
      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">Digital Warranty Cards</div>
        <div className="text-sm text-neutral-600 mt-1">Days remaining + one-click claim.</div>

        <div className="mt-5 space-y-3">
          {warranties.length === 0 ? (
            <div className="text-sm text-neutral-600">No warranties found.</div>
          ) : warranties.map(w => (
            <div key={`${w.order_id}-${w.product_key}`} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{w.title}</div>
                  <div className="text-xs text-neutral-500">Order: {w.order_id} • Ends: {fmtDate(w.warranty_end_date)}</div>
                </div>
                <div className="text-sm">
                  Days remaining: <span className="font-medium">{w.warranty_days_remaining}</span>
                </div>
              </div>

              <div className="mt-3">
                <button
                  className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-sm"
                  onClick={()=>submitWarrantyClaim(w.order_id, w.product_key)}
                >
                  Start warranty claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">Profile & Address Book</div>
        <div className="text-sm text-neutral-600 mt-1">Save multiple addresses for faster ordering.</div>

        <ProfileEditor profile={profile} phone={phone} onSave={saveProfile} />
      </div>

      {/* Rewards */}
      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">Tajalli Reward Points</div>
        <div className="text-sm text-neutral-600 mt-1">Earn points on delivered orders. Redeem later.</div>

        {rewards ? (
          <>
            <div className="mt-3 text-sm">Balance: <span className="font-semibold">{rewards.balance}</span></div>
            <div className="mt-4 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-neutral-500">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Points</th>
                    <th className="text-left py-2">Reason</th>
                    <th className="text-left py-2">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.ledger?.map((x, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2">{fmtDate(x.at)}</td>
                      <td className="py-2">{x.points}</td>
                      <td className="py-2">{x.reason}</td>
                      <td className="py-2">{x.ref || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-3 text-sm text-neutral-600">Rewards not available.</div>
        )}
      </div>

      {loading ? (
        <div className="fixed bottom-5 left-5 rounded-xl border bg-white px-4 py-2 text-sm shadow">
          Loading...
        </div>
      ) : null}
    </main>
  );
}

function ProfileEditor({
  profile,
  phone,
  onSave,
}: {
  profile: Profile | null;
  phone: string;
  onSave: (p: Profile) => Promise<void>;
}) {
  const [name, setName] = useState(profile?.name || "");
  const [addresses, setAddresses] = useState(profile?.addresses || []);

  useEffect(() => {
    setName(profile?.name || "");
    setAddresses(profile?.addresses || []);
  }, [profile?.name, JSON.stringify(profile?.addresses || [])]);

  function addAddress() {
    setAddresses(a => [...a, { label: "Home", line1: "", city: "", notes: "" }]);
  }

  return (
    <div className="mt-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium">Name</div>
          <input className="mt-2 w-full rounded-xl border px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-medium">Verified Phone</div>
          <div className="mt-2 rounded-xl border px-3 py-2 text-sm bg-neutral-50">{phone}</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm font-medium">Addresses</div>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50" onClick={addAddress}>
          Add address
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {addresses.map((a, idx) => (
          <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
            <div className="grid md:grid-cols-3 gap-3">
              <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Label (Home/Office)" value={a.label}
                onChange={(e)=>setAddresses(x=>x.map((k,i)=> i===idx?{...k,label:e.target.value}:k))} />
              <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Address line" value={a.line1}
                onChange={(e)=>setAddresses(x=>x.map((k,i)=> i===idx?{...k,line1:e.target.value}:k))} />
              <input className="rounded-xl border px-3 py-2 text-sm" placeholder="City" value={a.city}
                onChange={(e)=>setAddresses(x=>x.map((k,i)=> i===idx?{...k,city:e.target.value}:k))} />
            </div>
            <input className="mt-3 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Notes (optional)" value={a.notes || ""}
              onChange={(e)=>setAddresses(x=>x.map((k,i)=> i===idx?{...k,notes:e.target.value}:k))} />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button
          className="rounded-xl bg-neutral-900 text-white px-5 py-2 text-sm"
          onClick={()=>onSave({ phone, name, addresses })}
        >
          Save profile
        </button>
      </div>
    </div>
  );
}
