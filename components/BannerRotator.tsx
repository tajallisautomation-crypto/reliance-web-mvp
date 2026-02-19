"use client";
import { useEffect, useState } from "react";

const banners = [
  "Zero markup bank transfers available",
  "Solar backup packages for load shedding",
  "3–12 month installment plans",
];

export default function BannerRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white text-center py-3 text-sm tracking-wide">
      {banners[index]}
    </div>
  );
}
