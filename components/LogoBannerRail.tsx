"use client";

const logos = [
  { name: "Haier", url: "" },
  { name: "Dawlance", url: "" },
  { name: "PEL", url: "" },
  { name: "Orient", url: "" },
  { name: "Gree", url: "" },
  { name: "Crown", url: "" },
];

export default function LogoBannerRail() {
  return (
    <section className="mx-auto max-w-7xl px-4 -mt-2">
      <div className="glass-strong rounded-[22px] shadow-soft">
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Brand rail</div>
              <div className="text-xs text-neutral-600">Reserved space for official brand logos.</div>
            </div>
            <div className="text-[11px] text-neutral-500">replace logos when ready</div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {logos.map((b) => (
              <div
                key={b.name}
                className="rounded-2xl bg-white/70 border border-white/70 h-14 grid place-items-center text-sm text-neutral-700 hover:bg-white transition"
                title={b.name}
              >
                {b.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.url} alt={b.name} className="max-h-8 max-w-[120px] object-contain" />
                ) : (
                  <span className="font-medium">{b.name}</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-black text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-sm font-medium">Banner slot</div>
            <div className="text-xs text-white/80">
              Use this area for weekly deals, seasonal promos, or service bundles.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
