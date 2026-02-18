import "./globals.css";

export const metadata = {
  title: "Reliance by Tajalli’s",
  description: "Browse electronics, solar and appliances. WhatsApp-first ordering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
