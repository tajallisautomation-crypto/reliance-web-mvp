"use client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[980px] rounded-full bg-black/10 blur-3xl" />
        <div className="absolute top-40 left-[-140px] h-[320px] w-[320px] rounded-full bg-black/5 blur-2xl" />
        <div className="absolute top-52 right-[-180px] h-[420px] w-[420px] rounded-full bg-black/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-10">
        <div className="glass-strong shadow-soft rounded-[28px] overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-7 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-700">
                premium catalogue • structured installments • after-sales support
              </div>

              <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
                A premium way to shop appliances and solar in Pakistan.
              </h1>

              <p className="mt-4 text-neutral-700 max-w-xl">
                Clean listings, clear pricing, curated categories, and fast WhatsApp ordering.
                Built for trust and speed.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a className="btn bg-black text-white px-5 py-3 text-sm hover:brightness-110" href="#catalogue">
                  Explore catalogue
                </a>
                <a className="btn glass px-5 py-3 text-sm hover:bg-white" href="/portal">
                  Open customer portal
                </a>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-neutral-700">
                <div className="rounded-2xl bg-white/70 border border-white/70 p-3">
                  <div className="text-neutral-500">Delivery</div>
                  <div className="mt-1 font-medium">Nationwide COD</div>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white/70 p-3">
                  <div className="text-neutral-500">Installments</div>
                  <div className="mt-1 font-medium">3 / 6 / 12 months</div>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white/70 p-3">
                  <div className="text-neutral-500">Support</div>
                  <div className="mt-1 font-medium">After-sales backed</div>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] lg:min-h-[460px]">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.08))]" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80')",
                }}
              />
              <div className="absolute inset-0 p-6 flex items-end">
                <div className="glass rounded-2xl p-4 w-full">
                  <div className="text-sm font-medium">Today’s focus</div>
                  <div className="mt-1 text-xs text-neutral-700">
                    Solar backup + essential appliances for load-shedding readiness.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[12px] text-neutral-600">
          Tip: search any model name, then press Enter to jump to the best match.
        </div>
      </div>
    </section>
  );
}
