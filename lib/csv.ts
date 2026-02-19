export function parseCsv(text: string) {
  const lines = text.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || "";
    });
    return obj;
  });
}
