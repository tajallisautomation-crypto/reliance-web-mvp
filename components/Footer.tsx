export default function Footer() {
  return (
    <footer id="trust" className="mt-14 border-t border-black/5">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-semibold">Reliance by Tajalli’s</div>
            <div className="mt-2 text-sm text-neutral-700">
              Premium appliances, solar solutions, and services with after-sales support.
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Bank details</div>
            <div className="mt-2 text-sm text-neutral-700">
              Meezan Bank<br />
              Account: 01060101874794<br />
              IBAN: PK33MEZN0001060101874794<br />
              Title: TAJALLI'S HOME COLLECTION
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Contact</div>
            <div className="mt-2 text-sm text-neutral-700">
              Admin WhatsApp: +92 335 4266238<br />
              Sales WhatsApp: +92 370 2578788
            </div>
            <div className="mt-3">
              <a className="btn inline-block bg-black text-white px-4 py-2 text-sm hover:brightness-110" href="https://wa.me/923354266238" target="_blank">
                WhatsApp now
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 text-[12px] text-neutral-500">
          © {new Date().getFullYear()} Tajalli’s Home Collection. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
