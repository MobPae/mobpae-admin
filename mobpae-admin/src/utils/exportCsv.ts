/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * @param rows  Array of plain objects (values will be stringified)
 * @param filename  Desired filename without extension
 */
export function exportToCsv<T extends Record<string, unknown>>(rows: T[], filename: string) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape  = (v: unknown) => {
    let s = v == null ? "" : String(v);
    // Neutralize CSV/formula injection: spreadsheet apps treat leading =, +, -, @
    // (or tab/CR) as the start of a formula. Prefix with a literal-text marker.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(h => escape(row[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
