import "./globals.css";
import type { Metadata } from "next";
import Analytics from "../components/Analytics";
import MegaMenu from "../components/MegaMenu";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

const SITE = "https://reliance.tajallis.com.pk";
const DEFAULT_WA = "923702578788";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Reliance by Tajalli’s",
  description:
    "Solar, batteries, ACs and home appliances in Pakistan. WhatsApp-first ordering, nationwide delivery, after-sales support.",
  openGraph: {
    title: "Reliance by Tajalli’s",
    description:
      "Solar, batteries, ACs and home appliances in Pakistan. WhatsApp-first ordering.",
    url: SITE,
    siteName: "Reliance by Tajalli’s",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tajalli’s Home Collection",
    url: SITE,
    telephone: "+92-335-4266238",
    sameAs: [],
  };

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Reliance by Tajalli’s",
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Performance */}
        <link rel="preconnect" href="https://plausible.io" />
        <link rel="preconnect" href="https://docs.google.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>

      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Analytics />

        {/* Glass Header */}
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/70 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-semibold">
                R
              </div>
              <div className="leading-tight">
                <div className="font-semibold">Reliance</div>
                <div className="text-xs text-neutral-500">by Tajalli’s</div>
              </div>
            </a>

            <nav className="flex items-center gap-2">
              <MegaMenu />
              <a
                href="https://wa.me/923354266238"
                target="_blank"
                className="text-sm font-medium px-3 py-2 rounded-xl hover:bg-black/5"
                onClick={() => {
                  // @ts-ignore
                  window.plausible?.("WhatsApp_Click", { props: { placement: "header_admin" } });
                }}
              >
                Admin
              </a>
              <a
                href={`https://wa.me/${DEFAULT_WA}`}
                target="_blank"
                className="text-sm font-medium rounded-xl bg-green-600 text-white px-4 py-2 hover:bg-green-700"
                onClick={() => {
                  // @ts-ignore
                  window.plausible?.("WhatsApp_Click", { props: { placement: "header_sales" } });
                }}
              >
                WhatsApp Sales
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

        <footer className="border-t border-neutral-200 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-neutral-600">
            <div className="font-medium text-neutral-800">Tajalli’s Home Collection</div>
            <div className="mt-1">Free delivery across Pakistan. Full after-sales support.</div>
            <div className="mt-1">Admin: +92-335-4266238 • Sales: +92-370-2578788</div>
          </div>
        </footer>

        {/* Floating WhatsApp (Sales) */}
        <FloatingWhatsApp numberDigits={DEFAULT_WA} />
      </body>
    </html>
  );
}
