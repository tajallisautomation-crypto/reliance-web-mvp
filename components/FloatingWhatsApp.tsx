// components/FloatingWhatsApp.tsx
"use client";

export default function FloatingWhatsApp({ numberDigits }: { numberDigits: string }) {
  const href = `https://wa.me/${numberDigits}`;

  return (
    <a
      href={href}
      target="_blank"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-green-600 text-white px-5 py-3 shadow-lg hover:bg-green-700"
      onClick={() => {
        // Plausible event
        // @ts-ignore
        window.plausible?.("WhatsApp_Click", { props: { placement: "floating" } });
      }}
    >
      WhatsApp
    </a>
  );
}
