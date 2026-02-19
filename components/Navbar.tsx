"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50",
        scrolled ? "glass shadow-soft" : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center text-sm">
              R
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Reliance by Tajalli’s</div>
              <div className="text-[11px] text-neutral-600">Appliances • Solar • Services</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
            <a className="hover:text-black transition" href="#catalogue">Catalogue</a>
            <a className="hover:text-black transition" href="/portal">Portal</a>
            <a className="hover:text-black transition" href="#trust">Trust</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="btn px-4 py-2 text-sm glass-strong hover:bg-white"
              href="https://wa.me/923354266238"
              target="_blank"
            >
              WhatsApp
            </a>
            <a className="btn px-4 py-2 text-sm bg-black text-white hover:brightness-110" href="#catalogue">
              Browse
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
