export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  // normalize line endings
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === '"') {
      // handle escaped quotes ""
      if (inQuotes && s[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (ch === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row.map(v => v.trim()));
      row = [];
      current = "";
      continue;
    }

    current += ch;
  }

  // last cell
  if (current.length || row.length) {
    row.push(current);
    rows.push(row.map(v => v.trim()));
  }

  // drop empty trailing lines
  return rows.filter(r => r.some(cell => String(cell || "").trim() !== ""));
}
