"use client";

const brands = [
  "Haier",
  "Dawlance",
  "PEL",
  "Orient",
  "Gree",
  "Crown",
];

export default function BrandStrip() {
  return (
    <div className="bg-white py-8 border-y">
      <div className="max-w-7xl mx-auto flex justify-center flex-wrap gap-10 opacity-70">
        {brands.map((b) => (
          <div
            key={b}
            className="text-xl font-semibold text-neutral-700 hover:text-black transition"
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}
