/**
 * Sanitizes cell values to prevent CSV / Formula Injection attacks
 * when CSV files are opened in spreadsheet applications like Excel or Google Sheets.
 * Prevents formula triggers (=, +, -, @, tab, CR, %, |) across multi-line text values.
 */
export function sanitizeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "number") return String(val);
  const str = String(val);
  // Strip null bytes before formula character checks
  const cleaned = str.replace(/\0/g, "");
  // Check if start of string or any line in multi-line text starts with formula triggers after optional whitespace
  if (/(^|[\r\n]+)\s*([=+@\-\t\r%|])/.test(cleaned)) {
    return cleaned.replace(/(^|[\r\n]+)(\s*)([=+@\-\t\r%|])/g, "$1$2'$3");
  }
  return cleaned;
}

/**
 * Helper utility to export array of objects to CSV file
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic CSV export supports arbitrary record types
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  headers: {
    key: keyof T | string;
    label: string;
    // biome-ignore lint/suspicious/noExplicitAny: Value type varies by exported field
    transform?: (val: any, row: T) => string;
  }[],
  data: T[],
) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const csvRows: string[] = [];

  // Header row
  const headerLabels = headers.map(
    (h) => `"${sanitizeCSVValue(h.label).replace(/"/g, '""')}"`,
  );
  csvRows.push(headerLabels.join(","));

  // Data rows
  for (const row of data) {
    const values = headers.map((h) => {
      // biome-ignore lint/suspicious/noExplicitAny: Property dynamic access for CSV values
      let rawVal: any = (row as any)[h.key];
      if (h.transform) {
        rawVal = h.transform(rawVal, row);
      } else if (rawVal === null || rawVal === undefined) {
        rawVal = "";
      } else if (typeof rawVal === "object") {
        rawVal = JSON.stringify(rawVal);
      }
      const strVal = sanitizeCSVValue(rawVal).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Sanitize filename against path traversal and control characters
  const safeFilename = filename.replace(/[/\\?%*:|"<>\[\]\r\n\0]/g, "_");

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${safeFilename}_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
