// app/p/[slug]/page.tsx
export const dynamic = "force-dynamic"; 

import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. Fetch data from your Google Sheet/API using the slug
  // const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <h1>{product.name}</h1>
      {/* Your product UI here */}
    </main>
  );
}
