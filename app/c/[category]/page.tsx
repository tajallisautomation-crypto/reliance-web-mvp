import { fetchProducts } from "../../../lib/products";
import CatalogClient from "../../../components/CatalogClient";
import { CURATED_CATEGORIES } from "../../../lib/curatedCategories";

export const dynamic = "force-dynamic";

function categorySEOParagraph(label: string) {
  return `Explore ${label} from Tajalli’s Home Collection. We focus on reliable models suited to Pakistan’s market conditions, with WhatsApp-backed support and nationwide delivery. Prices shown are indicative; final confirmation and availability are always available on WhatsApp.`;
}

function categoryFAQs(label: string) {
  return [
    {
      q: `Do you deliver ${label} across Pakistan?`,
      a: "Yes. Delivery availability depends on your city and item size, but we support nationwide delivery in Pakistan.",
    },
    {
      q: "Can I order on WhatsApp instead of paying online?",
      a: "Yes. WhatsApp ordering is the default. You can choose cash on delivery, bank transfer, or other arrangements where applicable.",
    },
    {
      q: "Are prices final?",
      a: "Prices are indicative. Final confirmation (including promotions and delivery) is done on WhatsApp before order confirmation.",
    },
    {
      q: "Do you offer after-sales support?",
      a: "Yes. We provide support for warranty coordination and issue resolution after purchase.",
    },
  ];
}

export default async function CategoryPage({ params }: any) {
  const key = String(params.category || "").toLowerCase();
  const meta = CURATED_CATEGORIES.find((c) => c.key === key);

  const label = meta?.label || "Category";
  const blurb = meta?.blurb || "Browse products curated for Pakistan.";

  const all = await fetchProducts();
  const filtered = all.filter((p) => p.curated_category_key === key);

  const faqs = categoryFAQs(label);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-xs text-neutral-500">Curated category</div>
        <h1 className="mt-1 text-2xl font-semibold">{label}</h1>
        <div className="mt-2 text-sm text-neutral-700">{blurb}</div>
        <div className="mt-3 text-sm text-neutral-600">{categorySEOParagraph(label)}</div>

        <div className="mt-4 text-sm text-neutral-600">
          Products available: {filtered.length}
        </div>
      </div>

      <CatalogClient products={filtered} whatsappNumberDigits="923702578788" />

      <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">FAQs</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((f) => (
            <div key={f.q}>
              <div className="font-medium">{f.q}</div>
              <div className="text-sm text-neutral-700 mt-1">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
