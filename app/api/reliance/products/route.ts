export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET() {
  try {
    const base = mustEnv("SHEET_API_BASE");
    const token = mustEnv("SHEET_API_TOKEN");

    const url = new URL(base);
    url.searchParams.set("route", "products");
    url.searchParams.set("token", token);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();

    return Response.json(data);
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
