import "./globals.css";
import type { Metadata } from "next";
import Analytics from "../components/Analytics";

export const metadata: Metadata = {
  title: "Reliance by Tajalli’s",
  description:
    "Solar systems, lithium batteries, air conditioners and home appliances in Pakistan. WhatsApp-backed sales and nationwide delivery.",
  metadataBase: new URL("https://reliance.tajallis.com.pk"),
  openGraph: {
    title: "Reliance by Tajalli’s",
    description:
      "Solar systems, lithium batteries, air conditioners and home appliances in Pakistan.",
    url: "https://reliance.tajallis.com.pk",
    siteName: "Reliance by Tajalli’s",
    locale: "en_PK",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">

        {/* Analytics */}
        <Analytics />

        {/* Header */}
        <header className="border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a
              href="/"
              className="text-lg font-semibold tracking-tight"
            >
              Reliance by Tajalli’s
            </a>

            <a
              href="https://wa.me/923702578788"
              target="_blank"
              className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-xl hover:opacity-90"
            >
              WhatsApp Sales
            </a>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-neutral-600 flex justify-between">
            <div>
              © {new Date().getFullYear()} Tajalli’s Home Collection
            </div>
            <div>
              Nationwide Delivery • Pakistan
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
