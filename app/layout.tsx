import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

export const metadata = {
  title: "Reliance by Tajalli’s",
  description: "Premium appliances, solar, and services in Pakistan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(0,0,0,0.06),transparent_60%),radial-gradient(900px_circle_at_90%_0%,rgba(0,0,0,0.04),transparent_55%),linear-gradient(to_bottom,rgba(250,250,250,1),rgba(245,245,245,1))] text-neutral-900 antialiased">
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
