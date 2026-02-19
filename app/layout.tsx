import "./globals.css";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

export const metadata = {
  title: "Reliance by Tajalli’s",
  description: "Premium Appliances & Solar Solutions in Pakistan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 antialiased">
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
