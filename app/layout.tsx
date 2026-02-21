import "./globals.css";
import Navbar from "@/components/Navbar";
import BannerRotator from "@/components/BannerRotator";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: "Reliance by Tajalli’s",
  description: "Appliances • Solar • Services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <BannerRotator />
        <main>{children}</main>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
