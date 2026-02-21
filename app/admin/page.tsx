import Link from "next/link";

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { ok: false, error: String(res.status) };
  return res.json();
}

export default async function AdminPage() {
  const base = process.env.SHEET_WEBAPP_URL!;
  const products = await fetchJson(`${base}?action=products`);
  const seo = await fetchJson(`${base}?action=seo_pages`);
  const sitemap = await fetchJson(`${base}?action=sitemap`);
  const outbox = await fetchJson(`${base}?action=outbox_next&limit=10`);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl">Reliance Admin</div>
        <Link className="underline" href="/admin/tools">Tools</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card title="Products" value={(products?.products?.length ?? 0).toString()} />
        <Card title="SEO Pages" value={(seo?.pages?.length ?? 0).toString()} />
        <Card title="Sitemap URLs" value={(sitemap?.sitemap?.length ?? 0).toString()} />
        <Card title="Outbox Pending (sample)" value={(outbox?.outbox?.length ?? 0).toString()} />
      </div>

      <Section title="Outbox (next 10)">
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(outbox, null, 2)}</pre>
      </Section>

      <Section title="Quick sanity">
        <div className="text-sm">If counts are 0, run “Run Everything” in Google Sheets, then refresh.</div>
      </Section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="text-2xl mt-1">{value}</div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-base mb-2">{title}</div>
      {children}
    </div>
  );
}
