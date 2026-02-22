"use client";
import { useState } from "react";

export default function LeadModal({
  productTitle,
  productKey,
}: {
  productTitle: string;
  productKey: string;
}) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"done"|"error">("idle");

  async function submit() {
    setStatus("sending");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          phone,
          product_key: productKey,
          title: productTitle,
          source: "website"
        })
      });

      const out = await res.json();
      if (!out?.ok) throw new Error();

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
      >
        Request callback
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <div className="text-lg font-semibold mb-3">Request callback</div>

            <input
              placeholder="WhatsApp number"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={submit}
                disabled={!phone}
                className="flex-1 bg-neutral-900 text-white rounded-lg py-2 text-sm"
              >
                {status === "sending" ? "Sending..." : "Submit"}
              </button>

              <button
                onClick={()=>setOpen(false)}
                className="flex-1 border rounded-lg py-2 text-sm"
              >
                Cancel
              </button>
            </div>

            {status === "done" && (
              <div className="text-green-600 text-sm mt-3">
                Submitted successfully.
              </div>
            )}

            {status === "error" && (
              <div className="text-red-600 text-sm mt-3">
                Submission failed.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
