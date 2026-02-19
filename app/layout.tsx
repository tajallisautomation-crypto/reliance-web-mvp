import "./globals.css";
import type { Metadata } from "next";
import Analytics from "../components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://reliance.tajallis.com.pk"),
  title: "Reliance by Tajalli’s",
  description: "Product catalogue powered by Tajalli’s Home Collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
