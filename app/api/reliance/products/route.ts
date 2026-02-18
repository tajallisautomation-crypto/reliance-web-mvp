export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAOZShzlaPpI0_7RT2xIU1178t-BTsoqf7FBYUk9NZeG0n2NiHebAU1KxkFg6LTm0YQeyhytLESTWC/pub?gid=2007149046&single=true&output=csv";

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines.map(line => line.split(","));
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });
    const text = await res.text();

    const rows = parseCSV(text);

    return Response.json({
      ok: true,
      totalRows: rows.length,
      headerRow: rows[0],
      firstDataRow: rows[1]
    });

  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
