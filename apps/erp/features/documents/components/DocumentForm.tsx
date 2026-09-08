"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { taxTypesApi } from "@/features/masters/api";
import { Button } from "@altrex/ui";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

export type DocumentType =
  | "quotation"
  | "sales_order"
  | "proforma"
  | "delivery_challan"
  | "sales_invoice"
  | "purchase_order"
  | "purchase_invoice";

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
  return [];
}

interface DocumentFormProps {
  docType: DocumentType;
  title: string;
  subtitle: string;
  initialData?: any;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isSaving: boolean;
}

export function DocumentForm({
  docType,
  title,
  subtitle,
  initialData,
  onClose,
  onSubmit,
  isSaving,
}: DocumentFormProps) {
  const isVendorDoc = docType === "purchase_order" || docType === "purchase_invoice";
  const partyEndpoint = isVendorDoc ? endpoints.party.vendors : endpoints.party.customers;

  // Fetch Parties
  const { data: partiesData = [] } = useQuery({
    queryKey: [isVendorDoc ? "vendors-list" : "customers-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(partyEndpoint);
      return extractList(res, ["customers", "vendors", "data"]);
    },
  });

  // Fetch Items
  const {
    data: itemsData = [],
    isLoading: isItemsLoading,
    error: itemsError,
  } = useQuery({
    queryKey: ["items-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.items.items);
      return extractList(res, ["items", "rows", "records", "list"]);
    },
  });

  const { data: taxTypesData = [] } = taxTypesApi.useList();
  const taxTypes = extractList(taxTypesData, ["taxes", "data"]);

  // Form states
  const [partyId, setPartyId] = useState<string>(initialData?.party_id?.toString() || "");
  const [docDate, setDocDate] = useState<string>(
    initialData?.quotation_date ||
      initialData?.sales_order_date ||
      initialData?.proforma_date ||
      initialData?.delivery_date ||
      initialData?.invoice_date ||
      initialData?.purchase_order_date ||
      new Date().toISOString().split("T")[0],
  );
  const [validUntil, setValidUntil] = useState<string>(
    initialData?.valid_until || initialData?.due_date || initialData?.expected_delivery_date || "",
  );
  const [customerPoNo, setCustomerPoNo] = useState<string>(initialData?.customer_po_no || "");
  const [poNo, setPoNo] = useState<string>(initialData?.po_no || "");
  const [poDate, setPoDate] = useState<string>(initialData?.po_date || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [terms, setTerms] = useState<string>(initialData?.terms_conditions || "");

  // Line items state
  const [lineItems, setLineItems] = useState<
    {
      item_id: string;
      description: string;
      quantity: number;
      hsn_code: string;
      unit_id: string;
      unit_rate: number;
      discount_percent: number;
      selected_taxes: number[];
    }[]
  >(
    initialData?.itemsDetails?.map((item: any) => ({
      item_id: item.item_id?.toString() || "",
      description: item.description || "",
      quantity: Number(item.quantity || 1),
      hsn_code: item.hsn_code || "",
      unit_id: item.unit_id?.toString() || "",
      unit_rate: Number(item.unit_rate || 0),
      discount_percent: Number(item.discount_percent || 0),
      selected_taxes: [],
    })) || [
      {
        item_id: "",
        description: "",
        quantity: 1,
        hsn_code: "",
        unit_id: "",
        unit_rate: 0,
        discount_percent: 0,
        selected_taxes: [],
      },
    ],
  );

  const handleAddLine = () => {
    setLineItems((prev) => [
      ...prev,
      {
        item_id: "",
        description: "",
        quantity: 1,
        hsn_code: "",
        unit_id: "",
        unit_rate: 0,
        discount_percent: 0,
        selected_taxes: [],
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemSelect = (idx: number, selectedId: string) => {
    const item = itemsData.find((i: any) => (i.item_id ?? i.id)?.toString() === selectedId);
    setLineItems((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        const rate = isVendorDoc ? Number(item?.purchase_rate || 0) : Number(item?.sales_rate || 0);
        return {
          ...line,
          item_id: selectedId,
          description: item?.item_name || "",
          hsn_code: item?.hsn_code || "",
          unit_id: item?.unit_id?.toString() || "",
          unit_rate: rate,
          selected_taxes: item?.tax_id ? [item.tax_id] : line.selected_taxes,
        };
      }),
    );
  };

  const handleToggleTax = (lineIdx: number, taxId: number) => {
    setLineItems((prev) =>
      prev.map((line, i) => {
        if (i !== lineIdx) return line;
        const exists = line.selected_taxes.includes(taxId);
        const updated = exists
          ? line.selected_taxes.filter((id) => id !== taxId)
          : [...line.selected_taxes, taxId];
        return { ...line, selected_taxes: updated };
      }),
    );
  };

  // Preview calculations
  const { subtotal, estimatedTax, grandTotal } = useMemo(() => {
    let sub = 0;
    let taxAmt = 0;

    lineItems.forEach((line) => {
      const lineSub = line.quantity * line.unit_rate * (1 - line.discount_percent / 100);
      sub += lineSub;

      line.selected_taxes.forEach((taxId) => {
        const taxObj = taxTypes.find((t: any) => (t.tax_id ?? t.id) === taxId);
        const rate = Number(taxObj?.tax_percentage ?? 0);
        taxAmt += (lineSub * rate) / 100;
      });
    });

    return {
      subtotal: sub,
      estimatedTax: taxAmt,
      grandTotal: sub + taxAmt,
    };
  }, [lineItems, taxTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) {
      alert("Please select a Party / Customer");
      return;
    }

    const itemsDetailsPayload = lineItems.map((line) => ({
      item_id: Number(line.item_id),
      description: line.description || "Line item",
      quantity: Number(line.quantity),
      hsn_code: line.hsn_code || "",
      unit_id: line.unit_id ? Number(line.unit_id) : undefined,
      unit_rate: Number(line.unit_rate),
      discount_percent: Number(line.discount_percent),
      discount_flat: 0,
    }));

    // Build tax details array linked by item index
    const taxDetailsPayload: any[] = [];
    const indexKey =
      docType === "sales_order"
        ? "sales_order_item_index"
        : docType === "purchase_order"
        ? "purchase_order_item_index"
        : docType === "proforma"
        ? "proforma_item_index"
        : docType === "delivery_challan"
        ? "delivery_challan_item_index"
        : docType === "sales_invoice"
        ? "invoice_item_index"
        : docType === "purchase_invoice"
        ? "purchase_invoice_item_index"
        : "quotation_item_index";

    lineItems.forEach((line, idx) => {
      line.selected_taxes.forEach((taxId) => {
        taxDetailsPayload.push({
          [indexKey]: idx,
          tax_id: taxId,
        });
      });
    });

    const dateKey =
      docType === "sales_order"
        ? "sales_order_date"
        : docType === "purchase_order"
        ? "purchase_order_date"
        : docType === "proforma"
        ? "proforma_date"
        : docType === "delivery_challan"
        ? "delivery_date"
        : docType === "sales_invoice"
        ? "invoice_date"
        : docType === "purchase_invoice"
        ? "pi_date"
        : "quotation_date";

    const payload = {
      party_id: Number(partyId),
      [dateKey]: docDate,
      ...(docType === "quotation" || docType === "proforma"
        ? { valid_until: validUntil || undefined }
        : {}),
      ...(docType === "sales_invoice"
        ? {
            due_date: validUntil || undefined,
            po_no: poNo || undefined,
            po_date: poDate || undefined,
          }
        : {}),
      ...(docType === "sales_order"
        ? {
            expected_delivery_date: validUntil || undefined,
            customer_po_no: customerPoNo || undefined,
          }
        : {}),
      ...(docType === "purchase_order" || docType === "purchase_invoice"
        ? { due_date: validUntil || undefined }
        : {}),
      ...(docType === "delivery_challan"
        ? { expected_delivery_date: validUntil || undefined }
        : {}),
      currency_id: 1,
      round_off: "0.00",
      notes,
      terms_conditions: terms,
      status: "draft",
      itemsDetails: itemsDetailsPayload,
      taxDetails: taxDetailsPayload,
    };

    onSubmit(payload);
  };

  return (
    <div className="altrex-dialog-backdrop" onClick={onClose}>
      <div
        className="altrex-dialog altrex-dialog-lg altrex-document-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
          width: "min(1000px, calc(100vw - 32px))",
          maxWidth: "calc(100vw - 32px)",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div className="altrex-dialog-header" style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(37,99,235,0.1)",
                color: "var(--altrex-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 className="altrex-dialog-title">{title}</h3>
              <p className="altrex-dialog-subtitle" style={{ margin: 0 }}>
                {subtitle}
              </p>
            </div>
          </div>
          <button type="button" className="altrex-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          className="altrex-dialog-body altrex-document-body"
          style={{ flex: 1, overflowY: "auto", padding: "20px", minWidth: 0 }}
        >
          <form id="doc-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", minWidth: 0 }}>
            {/* Top Details */}
            <div
              style={{
                background: "var(--altrex-raised)",
                padding: "16px",
                borderRadius: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "14px",
                minWidth: 0,
              }}
              className="altrex-document-top-details"
            >
              <label className="altrex-field">
                <span>{isVendorDoc ? "Vendor / Supplier *" : "Customer / Party *"}</span>
                <select
                  className="altrex-input altrex-select"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  required
                >
                  <option value="">Select Party...</option>
                  {partiesData.map((p: any) => (
                    <option key={p.party_id ?? p.id} value={(p.party_id ?? p.id).toString()}>
                      {p.company_name ?? p.party_name ?? p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="altrex-field">
                <span>Document Date *</span>
                <input
                  type="date"
                  className="altrex-input"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  required
                />
              </label>

              <label className="altrex-field">
                <span>Valid Until / Due Date</span>
                <input
                  type="date"
                  className="altrex-input"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </label>

              {docType === "sales_order" && (
                <label className="altrex-field">
                  <span>Customer PO Number</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. PO-8801"
                    value={customerPoNo}
                    onChange={(e) => setCustomerPoNo(e.target.value)}
                  />
                </label>
              )}

              {docType === "sales_invoice" && (
                <>
                  <label className="altrex-field">
                    <span>PO Number</span>
                    <input
                      className="altrex-input"
                      placeholder="e.g. PO-8801"
                      value={poNo}
                      onChange={(e) => setPoNo(e.target.value)}
                    />
                  </label>
                  <label className="altrex-field">
                    <span>PO Date</span>
                    <input
                      type="date"
                      className="altrex-input"
                      value={poDate}
                      onChange={(e) => setPoDate(e.target.value)}
                    />
                  </label>
                </>
              )}
            </div>

            {/* Line Items Table Repeater */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--altrex-text)" }}>
                  Line Items & Products
                </span>
                <Button type="button" variant="outline" onClick={handleAddLine} style={{ fontSize: "12px", padding: "4px 10px" }}>
                  <Plus size={14} /> Add Line Item
                </Button>
              </div>

              <div className="altrex-table-wrap">
                <table className="altrex-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Item / Product</th>
                      <th style={{ width: "12%" }}>Qty</th>
                      <th style={{ width: "18%" }}>Unit Rate (₹)</th>
                      <th style={{ width: "12%" }}>Disc (%)</th>
                      <th style={{ width: "20%" }}>Taxes</th>
                      <th style={{ width: "8%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((line, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            className="altrex-input altrex-select"
                            value={line.item_id}
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            required
                            style={{ height: "34px", fontSize: "13px" }}
                          >
                            <option value="">
                              {isItemsLoading
                                ? "Loading products..."
                                : itemsError
                                ? "Unable to load products"
                                : itemsData.length === 0
                                ? "No products available"
                                : "Select Product..."}
                            </option>
                            {!itemsError &&
                              itemsData.map((i: any) => (
                                <option key={i.item_id ?? i.id} value={(i.item_id ?? i.id).toString()}>
                                  {i.item_name ?? i.name ?? i.product_name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="altrex-input"
                            value={line.quantity}
                            onChange={(e) =>
                              setLineItems((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, quantity: Number(e.target.value) } : l)),
                              )
                            }
                            style={{ height: "34px", fontSize: "13px" }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="altrex-input"
                            value={line.unit_rate}
                            onChange={(e) =>
                              setLineItems((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, unit_rate: Number(e.target.value) } : l)),
                              )
                            }
                            style={{ height: "34px", fontSize: "13px" }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            className="altrex-input"
                            value={line.discount_percent}
                            onChange={(e) =>
                              setLineItems((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, discount_percent: Number(e.target.value) } : l)),
                              )
                            }
                            style={{ height: "34px", fontSize: "13px" }}
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {taxTypes.map((t: any) => {
                              const tid = t.tax_id ?? t.id;
                              const isChecked = line.selected_taxes.includes(tid);
                              return (
                                <button
                                  key={tid}
                                  type="button"
                                  onClick={() => handleToggleTax(idx, tid)}
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    border: isChecked ? "1px solid var(--altrex-primary)" : "1px solid var(--altrex-border)",
                                    background: isChecked ? "rgba(37,99,235,0.1)" : "transparent",
                                    color: isChecked ? "var(--altrex-primary)" : "var(--altrex-muted)",
                                    cursor: "pointer",
                                  }}
                                >
                                  {t.tax_name} ({t.tax_percentage}%)
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemoveLine(idx)}
                            disabled={lineItems.length === 1}
                            style={{ color: "var(--altrex-danger-text)", padding: "4px 8px" }}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Summary & Notes */}
            <div
              className="altrex-document-summary"
              style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "20px", minWidth: 0 }}
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <label className="altrex-field">
                  <span>Terms & Conditions</span>
                  <textarea
                    className="altrex-input"
                    rows={2}
                    placeholder="Enter standard payment/delivery terms..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </label>
                <label className="altrex-field">
                  <span>Notes / Internal Comments</span>
                  <textarea
                    className="altrex-input"
                    rows={2}
                    placeholder="Notes visible on document..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>

              {/* Running total preview */}
              <div
                style={{
                  background: "var(--altrex-raised)",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--altrex-line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--altrex-muted)", textTransform: "uppercase" }}>
                  Estimated Document Totals
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>Est. Taxes:</span>
                  <span style={{ fontWeight: 600, color: "#8b5cf6" }}>₹{estimatedTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--altrex-line)",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: "var(--altrex-primary)" }}>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="altrex-dialog-footer" style={{ flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="doc-form" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Document"}
          </Button>
        </div>
      </div>
    </div>
  );
}
