/**
 * Helper utility to export array of objects to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  headers: { key: keyof T | string; label: string; transform?: (val: any, row: T) => string }[],
  data: T[]
) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const csvRows: string[] = [];

  // Header row
  const headerLabels = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`);
  csvRows.push(headerLabels.join(","));

  // Data rows
  for (const row of data) {
    const values = headers.map((h) => {
      let rawVal: any = row[h.key];
      if (h.transform) {
        rawVal = h.transform(rawVal, row);
      } else if (rawVal === null || rawVal === undefined) {
        rawVal = "";
      } else if (typeof rawVal === "object") {
        rawVal = JSON.stringify(rawVal);
      }
      const strVal = String(rawVal).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
