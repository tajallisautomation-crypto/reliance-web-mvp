"use client";

import { useEffect, useState } from "react";

export default function CatalogClient() {
  const [products, setProducts] = useState<any[] | null>(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_PRODUCTS_FEED_URL as string)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || data);
      })
      .catch(() => setProducts([]));
  }, []);

  if (products === null) {
    return <div className="p-6">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="p-6">No products found.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {products.map((p, i) => (
        <div key={i} className="border rounded p-4">
          <div className="font-semibold">{p.Model}</div>
          <div>PKR {p.Min_Price}</div>
        </div>
      ))}
    </div>
  );
}
