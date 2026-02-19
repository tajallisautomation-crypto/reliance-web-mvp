"use client";

import { useEffect, useState } from "react";

const ADMIN_KEY = process.env.ADMIN_KEY!;

async function apiGet(route: string) {
  const base = process.env.APPS_SCRIPT_URL!;
  const token = process.env.APPS_SCRIPT_TOKEN!;
  const params = new URLSearchParams({
    route,
    token,
    admin_key: ADMIN_KEY
  });

  const res = await fetch(`${base}?${params.toString()}`, { cache: "no-store" });
  return res.json();
}

async function apiPost(route: string, body: any) {
  const base = process.env.APPS_SCRIPT_URL!;
  const token = process.env.APPS_SCRIPT_TOKEN!;
  const res = await fetch(`${base}?route=${route}&token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, admin_key: ADMIN_KEY }),
    cache: "no-store"
  });
  return res.json();
}

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const r = await apiGet("admin_orders");
    setOrders(r.orders || []);
    setLoading(false);
  }

  async function update(order_id: string, field: string, value: string) {
    await apiPost("admin_update_order", {
      order_id,
      [field]: value
    });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="text-2xl font-semibold">Admin Dashboard</div>
      <div className="text-sm text-neutral-600 mt-1">
        Orders control panel
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Review</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.order_id}>
                <td className="p-2 border">{o.order_id}</td>
                <td className="p-2 border">{o.phone}</td>
                <td className="p-2 border">PKR {o.total}</td>
                <td className="p-2 border">{o.status}</td>
                <td className="p-2 border">{o.review_status}</td>
                <td className="p-2 border flex gap-2">
                  <button onClick={() => update(o.order_id,"status","Verified")} className="border px-2 py-1">Verify</button>
                  <button onClick={() => update(o.order_id,"status","Dispatched")} className="border px-2 py-1">Dispatch</button>
                  <button onClick={() => update(o.order_id,"status","Delivered")} className="border px-2 py-1">Deliver</button>
                  <button onClick={() => update(o.order_id,"review_status","Approved")} className="border px-2 py-1">Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
