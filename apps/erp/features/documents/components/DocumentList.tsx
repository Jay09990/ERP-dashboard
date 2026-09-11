"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button, DataTable, FilterBar } from "@altrex/ui";
import { CheckCircle, Clock, FileText, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentForm, type DocumentType } from "./DocumentForm";

function extractList(value: any, keys: string[]): any[] {
  if (Array.isArray(value)) return value;

  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }

  for (const key of ["data", "result", "payload", "response"]) {
    if (value?.[key] && value[key] !== value) {
      const nested = extractList(value[key], keys);
      if (nested.length > 0) return nested;
    }
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      const nested = extractList(nestedValue, keys);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function extractObject(value: any, keys: string[]): any {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  for (const key of keys) {
    if (value[key] && typeof value[key] === "object" && !Array.isArray(value[key])) {
      return extractObject(value[key], keys);
    }
  }
  return value;
}

const DOCUMENT_PRINT_CONFIG: Record<
  DocumentType,
  {
    endpoint: (id: string | number) => string;
    keys: string[];
    label: string;
    itemIdKey: string;
    taxRefKey: string;
  }
> = {
  quotation: { endpoint: endpoints.documents.quotationDetail, keys: ["quotation", "quotations"], label: "QUOTE", itemIdKey: "quotation_item_id", taxRefKey: "quotation_item_id" },
  sales_order: { endpoint: endpoints.documents.salesOrderDetail, keys: ["sales_order", "salesOrders"], label: "SALES ORDER", itemIdKey: "sales_order_item_id", taxRefKey: "sales_order_item_id" },
  proforma: { endpoint: endpoints.documents.proformaDetail, keys: ["proforma"], label: "PROFORMA INVOICE", itemIdKey: "proforma_item_id", taxRefKey: "proforma_item_id" },
  delivery_challan: { endpoint: endpoints.documents.deliveryChallanDetail, keys: ["delivery_challan"], label: "DELIVERY CHALLAN", itemIdKey: "delivery_challan_item_id", taxRefKey: "delivery_challan_item_id" },
  sales_invoice: { endpoint: endpoints.documents.invoiceDetail, keys: ["invoice"], label: "TAX INVOICE", itemIdKey: "invoice_item_id", taxRefKey: "invoice_item_id" },
  purchase_order: { endpoint: endpoints.documents.purchaseOrderDetail, keys: ["purchase_order"], label: "PURCHASE ORDER", itemIdKey: "purchase_order_item_id", taxRefKey: "purchase_order_item_id" },
  purchase_invoice: { endpoint: endpoints.documents.purchaseInvoiceDetail, keys: ["purchase_invoice"], label: "PURCHASE INVOICE", itemIdKey: "purchase_invoice_item_id", taxRefKey: "purchase_invoice_item_id" },
  credit_note: { endpoint: endpoints.documents.creditNoteDetail, keys: ["credit_note"], label: "CREDIT NOTE", itemIdKey: "credit_note_item_id", taxRefKey: "credit_note_item_id" },
  debit_note: { endpoint: endpoints.documents.debitNoteDetail, keys: ["debit_note"], label: "DEBIT NOTE", itemIdKey: "debit_note_item_id", taxRefKey: "debit_note_item_id" },
};

function numberToWordsIndian(value: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const underThousand = (n: number): string =>
    n < 20 ? ones[n] : n < 100 ? `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim() : `${ones[Math.floor(n / 100)]} Hundred ${underThousand(n % 100)}`.trim();
  const parts: string[] = [];
  const crore = Math.floor(value / 10000000);
  const lakh = Math.floor((value % 10000000) / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const remainder = value % 1000;
  if (crore) parts.push(`${underThousand(crore)} Crore`);
  if (lakh) parts.push(`${underThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${underThousand(thousand)} Thousand`);
  if (remainder) parts.push(underThousand(remainder));
  return parts.join(" ") || "Zero";
}

async function printDocument(document: any, docType: DocumentType) {
  const config = DOCUMENT_PRINT_CONFIG[docType];
  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Please allow pop-ups to print this document.");
    return;
  }

  popup.document.write(`<p style="font-family:Arial;padding:32px">Preparing ${config.label.toLowerCase()}...</p>`);

  const documentId =
    document.quotation_id ?? document.sales_order_id ?? document.proforma_id ?? document.id ?? "quotation";
  const partyId = document.party_id ?? document.customer_id;
  const [detail, profile, customer, uom, taxes, banks, cities, states, countries] = await Promise.all([
    apiClient.get<any>(config.endpoint(documentId)).catch(() => document),
    apiClient.get<any>(endpoints.auth.profile).catch(() => ({})),
    partyId != null
      ? apiClient.get<any>(endpoints.party.customer(partyId)).catch(() => ({}))
      : Promise.resolve({}),
    apiClient.get<any>(endpoints.masters.uom).catch(() => []),
    apiClient.get<any>(endpoints.masters.taxTypes).catch(() => []),
    apiClient.get<any>(endpoints.masters.bank).catch(() => []),
    apiClient.get<any>(endpoints.masters.city).catch(() => []),
    apiClient.get<any>(endpoints.masters.state).catch(() => []),
    apiClient.get<any>(endpoints.masters.country).catch(() => []),
  ]);
  const quotation = extractList(detail, config.keys.concat(["data"]))[0] ?? detail ?? document;
  const company = extractObject(profile, ["profile", "company", "data", "result", "payload"]);
  const customerData = extractObject(customer, ["customer", "party", "data", "result", "payload"]);
  const items = Array.isArray(quotation.itemsDetails)
    ? quotation.itemsDetails
    : Array.isArray(quotation.items)
    ? quotation.items
    : [];
  const units = extractList(uom, ["units", "data", "rows"]);
  const taxRows = extractList(taxes, ["taxes", "taxTypes", "data", "rows"]);
  const bankRows = extractList(banks, ["banks", "data", "rows"]);
  const cityRows = extractList(cities, ["cities", "data", "rows"]);
  const stateRows = extractList(states, ["states", "data", "rows"]);
  const countryRows = extractList(countries, ["countries", "data", "rows"]);
  const date = quotation.quotation_date ?? quotation.created_at ?? "";
  const validUntil = quotation.valid_until ?? "";
  const customerName =
    customerData.company_name ??
    customerData.party_name ??
    customerData.customer_name ??
    quotation.company_name ??
    quotation.party_name ??
    "N/A";
  const lookup = (list: any[], id: any) =>
    list.find((entry) => String(entry.unit_id ?? entry.tax_id ?? entry.bank_id ?? entry.city_id ?? entry.state_id ?? entry.country_id ?? entry.id) === String(id)) ?? {};
  const money = (value: any) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const rows = items.map((item: any, index: number) => {
    const quantity = Number(item.quantity || 0);
    const rate = Number(item.unit_rate ?? item.sales_rate ?? 0);
    const taxable = Number(item.taxable_value ?? quantity * rate);
    const unit = lookup(units, item.unit_id);
    const allTaxDetails = Array.isArray(quotation.taxDetails) ? quotation.taxDetails : [];
    const lineId = item[config.itemIdKey];
    const itemTaxes = allTaxDetails.filter((tax: any) => {
      const ref = tax[config.taxRefKey] ?? tax[`${docType}_item_index`];
      return String(ref) === String(lineId ?? index);
    });
    const taxName = (tax: any) => tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "";
    const cgst = itemTaxes.find((tax: any) => /cgst/i.test(taxName(tax)));
    const sgst = itemTaxes.find((tax: any) => /sgst/i.test(taxName(tax)));
    return `<tr>
      <td>${index + 1}</td><td><strong>${escapeHtml(item.description || "Line item")}</strong></td>
      <td>${escapeHtml(item.hsn_code ?? "")}</td><td>${quantity.toFixed(2)}</td>
      <td>${escapeHtml(unit.unit_name ?? unit.unit_code ?? "NOS")}</td><td class="num">${money(rate)}</td>
      <td class="num">${money(taxable)}</td><td class="num">${money(cgst?.tax_amount)}</td>
      <td class="num">${money(sgst?.tax_amount)}</td><td class="num">${money(taxable + Number(cgst?.tax_amount || 0) + Number(sgst?.tax_amount || 0))}</td>
    </tr>`;
  }).join("");
  const allTaxDetails = Array.isArray(quotation.taxDetails) ? quotation.taxDetails : [];
  const taxableTotal = items.reduce((sum: number, item: any) => sum + Number(item.taxable_value ?? Number(item.quantity || 0) * Number(item.unit_rate || 0) * (1 - Number(item.discount_percent || 0) / 100)), 0);
  const cgstTotal = allTaxDetails.filter((tax: any) => /cgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "")).reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);
  const sgstTotal = allTaxDetails.filter((tax: any) => /sgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "")).reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);
  const roundOff = Number(quotation.round_off || 0);
  const total = taxableTotal + cgstTotal + sgstTotal + roundOff;
  const words = `${numberToWordsIndian(Math.round(total))} Only`;
  const terms = String(quotation.terms_conditions ?? "").split(/\r?\n/).filter(Boolean);
  const addresses = Array.isArray(customerData.addresses) ? customerData.addresses : [];
  const billingAddress = addresses.find((address: any) => ["billing", "both"].includes(address.address_type)) ?? {};
  const shippingAddress = addresses.find((address: any) => ["shipping", "both"].includes(address.address_type)) ?? billingAddress;
  const bank = lookup(bankRows, company.bank_id);
  const addressText = (address: any) => `${address.address_line1 ?? ""} ${address.address_line2 ?? ""}, ${lookup(cityRows, address.city_id).city_name ?? ""}, ${lookup(stateRows, address.state_id).state_name ?? ""} ${address.pincode ?? ""}, ${lookup(countryRows, address.country_id).country_name ?? ""}`;

  popup.document.open();
  popup.document.write(`<!doctype html>
    <html><head><title>${escapeHtml(config.label)} #${escapeHtml(documentId)}</title>
    <style>
      @page { size: A4; margin: 12mm; } * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #172033; margin: 0; font-size: 10px; }
      .page { min-height: 273mm; position: relative; } .page-break { page-break-before: always; }
      header { display: flex; justify-content: space-between; border-bottom: 2px solid #172033; padding-bottom: 10px; }
      h1 { margin: 0 0 5px; font-size: 22px; } h2 { font-size: 14px; margin: 12px 0 6px; }
      p { margin: 3px 0; line-height: 1.35; } .muted { color: #64748b; }
      .box { border: 1px solid #cbd5e1; padding: 9px; margin-top: 10px; } .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; } th, td { border: 1px solid #cbd5e1; padding: 5px; vertical-align: top; }
      th { background: #e2e8f0; font-size: 8px; } td span { color: #475569; } .num { text-align: right; white-space: nowrap; }
      .totals { width: 42%; margin-left: auto; } .totals td { padding: 5px 8px; } .grand { font-size: 13px; font-weight: bold; background: #e2e8f0; }
      .footer { position: absolute; bottom: 0; width: 100%; border-top: 1px solid #cbd5e1; padding-top: 8px; }
      @media print { .page { min-height: 273mm; } }
    </style></head><body>
      <section class="page">
        <header><div><h1>${escapeHtml(company.company_name ?? "Company Name")}</h1><p>${escapeHtml(addressText(company))}</p><p>${escapeHtml(company.phone ?? "")} | ${escapeHtml(company.email ?? "")}</p><p>GSTIN: ${escapeHtml(company.gst_no ?? "N/A")} | ${escapeHtml(company.website ?? "")}</p></div>
          <div><h1>${config.label}</h1><p><strong>Quote:</strong> ${escapeHtml(quotation.quotation_no ?? `#${documentId}`)}</p><p><strong>Issue Date:</strong> ${escapeHtml(date)}</p><p><strong>Valid Until:</strong> ${escapeHtml(validUntil)}</p><p><strong>Status:</strong> ${escapeHtml(quotation.status ?? "draft")}</p></div></header>
        <div class="grid"><div class="box"><h2>Quote To</h2><strong>${escapeHtml(customerName)}</strong><p>${escapeHtml(addressText(billingAddress))}</p><p>GSTIN: ${escapeHtml(customerData.gst_no ?? "N/A")}</p></div><div class="box"><h2>Ship To</h2><strong>${escapeHtml(customerName)}</strong><p>${escapeHtml(addressText(shippingAddress))}</p></div></div>
        <table><thead><tr><th>S.No</th><th>Item / Description</th><th>HSN/SAC</th><th>Qty</th><th>UoM</th><th>Price (INR)</th><th>Taxable Value</th><th>CGST</th><th>SGST</th><th>Amount (INR)</th></tr></thead><tbody>${rows || "<tr><td colspan=\"10\">No line items</td></tr>"}</tbody></table>
        <table class="totals"><tr><td>Total Taxable Value</td><td class="num">INR ${money(taxableTotal)}</td></tr><tr><td>CGST</td><td class="num">INR ${money(cgstTotal)}</td></tr><tr><td>SGST</td><td class="num">INR ${money(sgstTotal)}</td></tr><tr><td>Round Off</td><td class="num">INR ${money(quotation.round_off)}</td></tr><tr class="grand"><td>Total Value</td><td class="num">INR ${money(total)}</td></tr></table>
        <p><strong>Total in words:</strong> INR ${escapeHtml(words)}</p>
        <div class="footer"><strong>Bank Name:</strong> ${escapeHtml(bank.bank_name ?? bank.name ?? "")} &nbsp; <strong>Account Holder:</strong> ${escapeHtml(company.account_holder_name ?? "")} &nbsp; <strong>Account:</strong> ${escapeHtml(company.account_no ?? "")} &nbsp; <strong>IFSC:</strong> ${escapeHtml(company.ifsc_code ?? "")}</div>
      </section>
      <section class="page page-break"><h2>Terms and Conditions</h2><ol>${terms.map((term) => `<li>${escapeHtml(term.replace(/^\d+[.)]\s*/, ""))}</li>`).join("")}</ol><div class="box" style="margin-top:60px;text-align:right;height:110px"><strong>Provider Signature</strong></div></section>
    </body></html>`);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 250);
}

interface DocumentListProps {
  docType: DocumentType;
  title: string;
  subtitle: string;
  eyebrow?: string;
  useList: () => { data?: any; isLoading: boolean; error: any };
  useCreate: () => { mutate: (body: any, opts?: any) => void; isPending: boolean };
  useUpdate: () => { mutate: (args: { id: string; body: any }, opts?: any) => void; isPending: boolean };
  useDelete: () => { mutate: (id: string, opts?: any) => void; isPending: boolean };
}

export function DocumentList({
  docType,
  title,
  subtitle,
  eyebrow = "Commercial Document",
  useList,
  useCreate,
  useUpdate,
  useDelete,
}: DocumentListProps) {
  const [search, setSearch] = useState("");
  const [activeDoc, setActiveDoc] = useState<any | null>(null);
  const [isOpenForm, setIsOpenForm] = useState(false);

  const { data: responseData, isLoading, error } = useList();
  const docs = useMemo(
    () =>
      extractList(responseData, [
        "quotations",
        "Quotations",
        "quotation",
        "documents",
        "items",
        "rows",
        "records",
        "list",
      ]),
    [responseData],
  );

  const { mutate: createDoc, isPending: isCreating } = useCreate();
  const { mutate: updateDoc, isPending: isUpdating } = useUpdate();
  const { mutate: deleteDoc, isPending: isDeleting } = useDelete();

  const getId = (doc: any) =>
    doc.quotation_id ??
    doc.sales_order_id ??
    doc.proforma_id ??
    doc.delivery_challan_id ??
    doc.invoice_id ??
    doc.purchase_order_id ??
    doc.purchase_invoice_id ??
    doc.credit_note_id ??
    doc.debit_note_id ??
    doc.id;

  const filtered = useMemo(() => {
    if (!search.trim()) return docs;
    return docs.filter((d) =>
      Object.values(d).some((val) => val && String(val).toLowerCase().includes(search.toLowerCase())),
    );
  }, [docs, search]);

  const draftCount = docs.filter((d) => d.status === "draft").length;
  const approvedCount = docs.filter((d) => d.status === "approved" || d.status === "sent").length;

  const columns = [
    {
      key: "id" as any,
      label: "Document Ref",
      render: (d: any) => {
        const id = getId(d);
        const date =
          d.quotation_date ||
          d.sales_order_date ||
          d.proforma_date ||
          d.delivery_date ||
          d.invoice_date ||
          d.purchase_order_date ||
          d.credit_note_date ||
          d.debit_note_date ||
          d.created_at;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(37,99,235,0.1)",
                color: "var(--altrex-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              <FileText size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600, color: "var(--altrex-text)", fontSize: "14px" }}>
                #DOC-{id}
              </span>
              <span style={{ fontSize: "12px", color: "var(--altrex-muted)" }}>
                {date ? new Date(date).toLocaleDateString("en-IN") : "N/A"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status" as any,
      label: "Status",
      render: (d: any) => {
        const status = d.status || "draft";
        const isApproved = status === "approved" || status === "sent";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              background: isApproved ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
              color: isApproved ? "#10b981" : "#f59e0b",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isApproved ? "#10b981" : "#f59e0b",
              }}
            />
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "action" as any,
      label: "Actions",
      render: (d: any) => {
        const id = getId(d)?.toString() ?? "";
        return (
          <div className="altrex-row-actions" style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outline"
              onClick={() => {
                setActiveDoc(d);
                setIsOpenForm(true);
              }}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => printDocument(d, docType)}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm(`Are you sure you want to delete document #DOC-${id}?`)) {
                  deleteDoc(id);
                }
              }}
              disabled={isDeleting}
              style={{
                color: "var(--altrex-danger-text)",
                borderColor: "rgba(220, 38, 38, 0.2)",
                fontSize: "12px",
                padding: "4px 10px",
              }}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleFormSubmit = (payload: any) => {
    if (activeDoc) {
      const id = getId(activeDoc).toString();
      updateDoc(
        { id, body: payload },
        {
          onSuccess: () => {
            setIsOpenForm(false);
            setActiveDoc(null);
          },
        },
      );
    } else {
      createDoc(payload, {
        onSuccess: () => {
          setIsOpenForm(false);
        },
      });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">{eyebrow}</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>{title}</h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            {subtitle}
          </p>
        </div>
        <Button
          onClick={() => {
            setActiveDoc(null);
            setIsOpenForm(true);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Create New Document
        </Button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(37, 99, 235, 0.1)",
              color: "var(--altrex-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              TOTAL DOCUMENTS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {docs.length}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              DRAFT DOCUMENTS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {draftCount}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              APPROVED / SENT
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {approvedCount}
            </div>
          </div>
        </div>
      </div>

      <FilterBar>
        <input
          className="altrex-input"
          placeholder="Search documents by reference, party, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "320px" }}
        />
      </FilterBar>

      {isLoading ? (
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading documents...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load documents from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filtered}
          rowKey={(d, idx) => getId(d) ?? idx}
        />
      )}

      {isOpenForm && (
        <DocumentForm
          docType={docType}
          title={activeDoc ? `Edit ${title}` : `Create New ${title}`}
          subtitle={subtitle}
          initialData={activeDoc}
          onClose={() => {
            setIsOpenForm(false);
            setActiveDoc(null);
          }}
          onSubmit={handleFormSubmit}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
