/**
 * Convert an array of objects into a CSV string and trigger a download.
 *
 * @param filename – name of the downloaded file (e.g. "customers.csv")
 * @param rows     – array of flat objects
 * @param columns  – optional subset/ordering of keys. If omitted, all keys of
 *                   the first row are used.
 * @param headers  – optional human-readable headers matching `columns` order.
 */
export function downloadCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: (keyof T)[],
  headers?: string[],
) {
  if (rows.length === 0) return;

  const keys = columns ?? (Object.keys(rows[0]) as (keyof T)[]);
  const headerRow = headers ?? keys.map((k) => String(k));

  const escape = (val: unknown): string => {
    if (val == null) return "";
    const str = String(val);
    // Wrap in quotes if it contains commas, quotes or newlines
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headerRow.map(escape).join(","),
    ...rows.map((row) => keys.map((k) => escape(row[k])).join(",")),
  ];

  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
