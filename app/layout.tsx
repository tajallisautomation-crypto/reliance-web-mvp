import "./globals.css";

export const metadata = {
  title: "Reliance by Tajalli’s",
  description: "Electronics, solar, and appliances in Pakistan. WhatsApp-first ordering.",
  metadataBase: new URL("https://reliance.tajallis.com.pk"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-semibold">
                  R
                </div>
                <div className="leading-tight">
                  <div className="font-semibold">Reliance</div>
                  <div className="text-xs text-neutral-500">by Tajalli’s</div>
                </div>
              </a>

              <a
                href="https://wa.me/923354266238"
                target="_blank"
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                WhatsApp
              </a>
            </div>
          </header>

          <main>{children}</main>

          <footer className="border-t bg-white mt-12">
            <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-neutral-600">
              <div className="flex flex-col gap-2">
                <div className="font-medium text-neutral-800">Tajalli’s Home Collection</div>
                <div>Free delivery across Pakistan. Full after-sales support.</div>
                <div>Phone / WhatsApp: +92-335-4266238</div>
                <div className="text-xs text-neutral-400 mt-2">© {new Date().getFullYear()} Reliance by Tajalli’s</div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
<script defer data-domain="reliance.tajallis.com.pk" src="https://plausible.io/js/script.js"></script>
