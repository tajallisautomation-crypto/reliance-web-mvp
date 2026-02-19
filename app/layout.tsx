import "./globals.css";
import Analytics from "../components/Analytics";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

export const metadata = {
  title: "Reliance by Tajalli’s",
  description: "Appliances, solar, and services with cash & installment options."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <FloatingWhatsApp />
        {children}
      </body>
    </html>
  );
}
