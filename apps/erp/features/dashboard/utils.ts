/** Pulls the first record array out of varied backend list payloads. */
export function extractRecords(value: unknown, visited = new Set<unknown>()): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);
  for (const nested of Object.values(value)) {
    const records = extractRecords(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

export function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** Prefers server-stored totals when present on list/detail rows. */
export function getDocumentAmount(doc: Record<string, unknown>): number {
  return toNumber(
    doc.grand_total ??
      doc.total_amount ??
      doc.net_amount ??
      doc.invoice_total ??
      doc.amount ??
      doc.payable_amount ??
      doc.total,
  );
}

export function getDocumentDate(doc: Record<string, unknown>): string | null {
  const raw =
    doc.invoice_date ??
    doc.pi_date ??
    doc.quotation_date ??
    doc.sales_order_date ??
    doc.purchase_order_date ??
    doc.proforma_date ??
    doc.delivery_date ??
    doc.credit_note_date ??
    doc.debit_note_date ??
    doc.created_at ??
    doc.updated_at;

  if (raw == null) return null;
  const value = String(raw);
  return value || null;
}

export function getDocumentId(doc: Record<string, unknown>): string {
  const id =
    doc.invoice_id ??
    doc.purchase_invoice_id ??
    doc.quotation_id ??
    doc.sales_order_id ??
    doc.purchase_order_id ??
    doc.proforma_id ??
    doc.delivery_challan_id ??
    doc.party_id ??
    doc.id;
  return id == null ? "" : String(id);
}

export function isInCurrentMonth(dateValue: string | null, now = new Date()): boolean {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CLOSED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "rejected",
  "converted",
  "expired",
  "closed",
  "void",
]);

const DELIVERED_STATUSES = new Set([
  "delivered",
  "completed",
  "cancelled",
  "canceled",
  "closed",
  "void",
]);

export function isActiveQuotation(doc: Record<string, unknown>): boolean {
  const status = String(doc.status ?? "draft").toLowerCase();
  return !CLOSED_STATUSES.has(status);
}

export function isPendingDelivery(doc: Record<string, unknown>): boolean {
  const status = String(doc.status ?? "draft").toLowerCase();
  return !DELIVERED_STATUSES.has(status);
}

export function formatDisplayDate(dateValue: string | null): string {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
