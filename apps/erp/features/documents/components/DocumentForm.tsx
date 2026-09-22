"use client";

import { useItems } from "@/features/items/api";
import { taxTypesApi } from "@/features/masters/api";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useSessionStore } from "@/stores/session-store";
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
  | "purchase_invoice"
  | "credit_note"
  | "debit_note";

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

interface DocumentFormProps {
  docType: DocumentType;
  title: string;
  subtitle: string;
  initialData?: any;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isSaving: boolean;
}

function getTaxValue(tax: any) {
  return Number(
    tax?.tax_percentage ??
      tax?.percentage ??
      tax?.tax_amount ??
      tax?.amount ??
      tax?.value ??
      0,
  );
}

function calculateTaxAmount(taxableAmount: number, tax: any) {
  const taxValue = getTaxValue(tax);
  return String(tax?.tax_type ?? "").toLowerCase() === "fixed"
    ? taxValue
    : (taxableAmount * taxValue) / 100;
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
  const session = useSessionStore((s) => s.session);
  const sessionUserId = Number(session?.user?.id || 1);
  const sessionCompanyId = Number(session?.company?.id || 1);

  const isVendorDoc =
    docType === "purchase_order" ||
    docType === "purchase_invoice" ||
    docType === "debit_note";
  const partyEndpoint = isVendorDoc
    ? endpoints.party.vendors
    : endpoints.party.customers;

  // Fetch Parties
  const { data: partiesData = [] } = useQuery({
    queryKey: [isVendorDoc ? "vendors-list" : "customers-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(partyEndpoint);
      return extractList(res, ["customers", "vendors", "data"]);
    },
  });

  // Use the same catalog query as the Items page so the dropdown shares its
  // cache and response handling with the item management screen.
  const {
    data: itemsResponse,
    isLoading: isItemsLoading,
    error: itemsError,
  } = useItems();
  const itemsData = useMemo(
    () =>
      extractList(itemsResponse, ["items", "Items", "rows", "records", "list"]),
    [itemsResponse],
  );

  const { data: taxTypesData = [] } = taxTypesApi.useList();
  // Memoize taxTypes to avoid recreating array references on every render
  const taxTypes = useMemo(
    () =>
      extractList(taxTypesData, [
        "taxes",
        "taxTypes",
        "tax_types",
        "rows",
        "records",
        "list",
        "data",
      ]),
    [taxTypesData],
  );

  // O(1) Map lookups for taxTypes and itemsData to avoid O(N) Array.find scans on renders & submits
  const taxTypesMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const tax of taxTypes) {
      const id = String(tax.tax_id ?? tax.id);
      map.set(id, tax);
    }
    return map;
  }, [taxTypes]);

  const itemsMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const item of itemsData) {
      const id = String(item.item_id ?? item.id);
      map.set(id, item);
    }
    return map;
  }, [itemsData]);

  // Fetch Sales Invoices for Credit Note dropdown
  const { data: salesInvoicesRes = [] } = useQuery({
    queryKey: ["sales-invoices-dropdown"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.documents.invoice);
      return extractList(res, [
        "invoices",
        "invoice",
        "data",
        "rows",
        "records",
        "list",
      ]);
    },
    enabled: docType === "credit_note",
  });

  // Fetch Purchase Invoices for Debit Note dropdown
  const { data: purchaseInvoicesRes = [] } = useQuery({
    queryKey: ["purchase-invoices-dropdown"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.documents.purchaseInvoice);
      return extractList(res, [
        "purchase_invoices",
        "purchase_invoice",
        "invoices",
        "data",
        "rows",
        "records",
        "list",
      ]);
    },
    enabled: docType === "debit_note",
  });

  // Fetch CR/DR Reasons for Credit/Debit Note dropdown
  const { data: crDrReasonsRes = [] } = useQuery({
    queryKey: ["cr-dr-reasons-dropdown"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.masters.crDrReason);
      return extractList(res, [
        "reasons",
        "crDrReasons",
        "cr_dr_reasons",
        "data",
        "rows",
        "records",
        "list",
      ]);
    },
    enabled: docType === "credit_note" || docType === "debit_note",
  });

  const filteredReasons = useMemo(() => {
    return crDrReasonsRes.filter((r: any) => {
      const typeStr = String(
        r.form_type ??
          r.type ??
          r.reason_type ??
          r.applicable_to ??
          r.applicable_on ??
          "both",
      ).toLowerCase();
      if (!typeStr || typeStr === "both" || typeStr === "all") return true;
      if (docType === "credit_note")
        return (
          typeStr === "credit" || typeStr === "credit_note" || typeStr === "cr"
        );
      if (docType === "debit_note")
        return (
          typeStr === "debit" || typeStr === "debit_note" || typeStr === "dr"
        );
      return true;
    });
  }, [crDrReasonsRes, docType]);

  // Form states
  const [partyId, setPartyId] = useState<string>(
    initialData?.party_id?.toString() || "",
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    initialData?.invoice_id?.toString() ||
      initialData?.purchase_invoice_id?.toString() ||
      initialData?.pi_id?.toString() ||
      initialData?.sales_invoice_id?.toString() ||
      "",
  );
  const [reasonId, setReasonId] = useState<string>(
    initialData?.reason_id?.toString() || "1",
  );
  const [reasonText, setReasonText] = useState<string>(
    initialData?.reason || initialData?.reason_text || "",
  );
  const [docDate, setDocDate] = useState<string>(
    initialData?.debit_date ||
      initialData?.debit_note_date ||
      initialData?.credit_date ||
      initialData?.credit_note_date ||
      initialData?.quotation_date ||
      initialData?.sales_order_date ||
      initialData?.proforma_date ||
      initialData?.delivery_date ||
      initialData?.invoice_date ||
      initialData?.purchase_order_date ||
      initialData?.pi_date ||
      initialData?.document_date ||
      initialData?.date ||
      new Date().toISOString().split("T")[0],
  );
  const [validUntil, setValidUntil] = useState<string>(
    initialData?.valid_until ||
      initialData?.due_date ||
      initialData?.expected_delivery_date ||
      "",
  );
  const [customerPoNo, setCustomerPoNo] = useState<string>(
    initialData?.customer_po_no || "",
  );
  const [customerPoDate, setCustomerPoDate] = useState<string>(
    initialData?.customer_po_date || "",
  );
  const [poNo, setPoNo] = useState<string>(initialData?.po_no || "");
  const [poDate, setPoDate] = useState<string>(initialData?.po_date || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [terms, setTerms] = useState<string>(
    initialData?.terms_conditions || "",
  );
  const [status, setStatus] = useState<
    "draft" | "approved" | "sent" | "cancelled"
  >(initialData?.status || "draft");

  // Line items state
  const [lineItems, setLineItems] = useState<
    {
      quotation_item_id?: number;
      sales_order_item_id?: number;
      proforma_item_id?: number;
      delivery_challan_item_id?: number;
      invoice_item_id?: number;
      purchase_order_item_id?: number;
      purchase_invoice_item_id?: number;
      credit_note_item_id?: number;
      debit_note_item_id?: number;
      item_id: string;
      description: string;
      quantity: number;
      hsn_code: string;
      unit_id: string;
      unit_rate: number;
      discount_percent: number;
      discount_flat: number;
      selected_taxes: number[];
    }[]
  >(
    initialData?.itemsDetails?.map((item: any, itemIndex: number) => ({
      quotation_item_id: item.quotation_item_id,
      sales_order_item_id: item.sales_order_item_id,
      proforma_item_id: item.proforma_item_id,
      delivery_challan_item_id: item.delivery_challan_item_id,
      invoice_item_id: item.invoice_item_id,
      purchase_order_item_id: item.purchase_order_item_id,
      purchase_invoice_item_id: item.purchase_invoice_item_id,
      credit_note_item_id: item.credit_note_item_id,
      debit_note_item_id: item.debit_note_item_id,
      item_id: item.item_id?.toString() || "",
      description: item.description || "",
      quantity: Number(item.quantity || 1),
      hsn_code: item.hsn_code || "",
      unit_id: item.unit_id?.toString() || "",
      unit_rate: Number(item.unit_rate || 0),
      discount_percent: Number(item.discount_percent || 0),
      discount_flat: Number(item.discount_flat || 0),
      selected_taxes: (initialData?.taxDetails ?? [])
        .filter((tax: any) => {
          const ref =
            tax.quotation_item_id ??
            tax.sales_order_item_id ??
            tax.proforma_item_id ??
            tax.delivery_challan_item_id ??
            tax.invoice_item_id ??
            tax.purchase_order_item_id ??
            tax.purchase_invoice_item_id ??
            tax.credit_note_item_id ??
            tax.debit_note_item_id ??
            tax.quotation_item_index ??
            tax.sales_order_item_index ??
            tax.proforma_item_index ??
            tax.delivery_challan_item_index ??
            tax.invoice_item_index ??
            tax.purchase_invoice_item_index ??
            tax.credit_note_item_index ??
            tax.debit_note_item_index;
          return (
            String(ref) ===
            String(
              item.quotation_item_id ??
                item.sales_order_item_id ??
                item.proforma_item_id ??
                item.delivery_challan_item_id ??
                item.invoice_item_id ??
                item.purchase_order_item_id ??
                item.purchase_invoice_item_id ??
                item.credit_note_item_id ??
                item.debit_note_item_id ??
                item.item_id ??
                itemIndex,
            )
          );
        })
        .map((tax: any) => Number(tax.tax_id))
        .filter(
          (taxId: number) =>
            Number.isFinite(taxId) &&
            taxTypes.some((t: any) => Number(t.tax_id ?? t.id) === taxId),
        ),
    })) || [
      {
        item_id: "",
        description: "",
        quantity: 1,
        hsn_code: "",
        unit_id: "",
        unit_rate: 0,
        discount_percent: 0,
        discount_flat: 0,
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
        discount_flat: 0,
        selected_taxes: [],
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemSelect = (idx: number, selectedId: string) => {
    const item = itemsMap.get(selectedId);
    setLineItems((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        const rate = isVendorDoc
          ? Number(item?.purchase_rate || 0)
          : Number(item?.sales_rate || 0);
        const rawTaxId = item?.tax_id ? Number(item.tax_id) : null;
        const isValidTax =
          rawTaxId != null &&
          Number.isFinite(rawTaxId) &&
          taxTypesMap.has(String(rawTaxId));
        return {
          ...line,
          item_id: selectedId,
          description: item?.item_name || "",
          hsn_code: item?.hsn_code || "",
          unit_id: item?.unit_id?.toString() || "",
          unit_rate: rate,
          selected_taxes: isValidTax ? [rawTaxId] : line.selected_taxes,
        };
      }),
    );
  };

  const handleToggleTax = (lineIdx: number, rawTaxId: number | string) => {
    const taxId = Number(rawTaxId);
    setLineItems((prev) =>
      prev.map((line, i) => {
        if (i !== lineIdx) return line;
        const exists = line.selected_taxes.some((id) => Number(id) === taxId);
        const updated = exists
          ? line.selected_taxes.filter((id) => Number(id) !== taxId)
          : [...line.selected_taxes, taxId];
        return { ...line, selected_taxes: updated };
      }),
    );
  };

  /**
   * Called when the user picks an invoice on a credit / debit note.
   * Auto-populates line items from the invoice's itemsDetails so every
   * item carries the required invoice_item_id (or purchase_invoice_item_id).
   */
  const handleInvoiceSelect = async (
    invoiceIdStr: string,
    sourceList: any[],
  ) => {
    setSelectedInvoiceId(invoiceIdStr);
    if (!invoiceIdStr) {
      // Reset to a single blank line when invoice is deselected
      setLineItems([
        {
          item_id: "",
          description: "",
          quantity: 1,
          hsn_code: "",
          unit_id: "",
          unit_rate: 0,
          discount_percent: 0,
          discount_flat: 0,
          selected_taxes: [],
        },
      ]);
      return;
    }

    let inv = sourceList.find(
      (i: any) =>
        String(i.invoice_id ?? i.purchase_invoice_id ?? i.pi_id ?? i.id) ===
        invoiceIdStr,
    );

    let invItems: any[] = Array.isArray(inv?.itemsDetails)
      ? inv.itemsDetails
      : [];
    let invTaxDetails: any[] = Array.isArray(inv?.taxDetails)
      ? inv.taxDetails
      : [];

    // If summary item list doesn't include itemsDetails, fetch single invoice detail from API
    if (invItems.length === 0) {
      try {
        const endpoint =
          docType === "debit_note"
            ? endpoints.documents.purchaseInvoiceDetail(invoiceIdStr)
            : endpoints.documents.invoiceDetail(invoiceIdStr);
        const res: any = await apiClient.get(endpoint);
        const detailedInv =
          res?.invoice ||
          res?.purchase_invoice ||
          res?.data ||
          res?.Invoice ||
          res?.Invoices?.[0] ||
          res?.PurchaseInvoice ||
          res;

        if (detailedInv) {
          inv = detailedInv;
          invItems = Array.isArray(detailedInv.itemsDetails)
            ? detailedInv.itemsDetails
            : Array.isArray(detailedInv.items)
              ? detailedInv.items
              : [];
          invTaxDetails = Array.isArray(detailedInv.taxDetails)
            ? detailedInv.taxDetails
            : Array.isArray(detailedInv.taxes)
              ? detailedInv.taxes
              : [];
        }
      } catch (err) {
        console.error("Failed to fetch invoice details:", err);
      }
    }

    if (invItems.length === 0) return;

    setLineItems(
      invItems.map((item: any) => {
        // Resolve taxes that belong to this item
        const itemInvItemId =
          item.invoice_item_id ??
          item.purchase_invoice_item_id ??
          item.pi_item_id ??
          item.id;
        const taxIds = invTaxDetails
          .filter(
            (td: any) =>
              String(
                td.invoice_item_id ??
                  td.purchase_invoice_item_id ??
                  td.pi_item_id,
              ) === String(itemInvItemId),
          )
          .map((td: any) => Number(td.tax_id))
          .filter(
            (taxId: number) =>
              Number.isFinite(taxId) &&
              taxTypes.some((t: any) => Number(t.tax_id ?? t.id) === taxId),
          );

        return {
          invoice_item_id: item.invoice_item_id ?? undefined,
          purchase_invoice_item_id:
            item.purchase_invoice_item_id ?? item.pi_item_id ?? undefined,
          item_id: item.item_id?.toString() || "",
          description: item.description || "",
          quantity: Number(item.quantity || 1),
          hsn_code: item.hsn_code || "",
          unit_id: item.unit_id?.toString() || "",
          unit_rate: Number(item.unit_rate || 0),
          discount_percent: Number(item.discount_percent || 0),
          discount_flat: Number(item.discount_flat || 0),
          selected_taxes: taxIds,
        };
      }),
    );
  };

  // Preview calculations (memoized with O(1) Map lookups to avoid recalculating on unrelated form state changes)
  const { subtotal, estimatedTax, grandTotal } = useMemo(() => {
    let sub = 0;
    let taxAmt = 0;

    lineItems.forEach((line) => {
      const lineSub =
        line.quantity * line.unit_rate * (1 - line.discount_percent / 100);
      sub += lineSub;

      line.selected_taxes.forEach((taxId) => {
        const taxObj = taxTypesMap.get(String(taxId));
        taxAmt += calculateTaxAmount(lineSub, taxObj);
      });
    });

    return {
      subtotal: sub,
      estimatedTax: taxAmt,
      grandTotal: sub + taxAmt,
    };
  }, [lineItems, taxTypesMap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) {
      alert("Please select a Party / Customer");
      return;
    }

    const itemIdKey =
      docType === "sales_order"
        ? "sales_order_item_id"
        : docType === "purchase_order"
          ? "purchase_order_item_id"
          : docType === "proforma"
            ? "proforma_item_id"
            : docType === "delivery_challan"
              ? "delivery_challan_item_id"
              : docType === "sales_invoice"
                ? "invoice_item_id"
                : docType === "purchase_invoice"
                  ? "purchase_invoice_item_id"
                  : docType === "credit_note"
                    ? "credit_note_item_id"
                    : docType === "debit_note"
                      ? "debit_note_item_id"
                      : "quotation_item_id";

    const docIdKey =
      docType === "sales_order"
        ? "sales_order_id"
        : docType === "purchase_order"
          ? "purchase_order_id"
          : docType === "proforma"
            ? "proforma_id"
            : docType === "delivery_challan"
              ? "delivery_challan_id"
              : docType === "sales_invoice"
                ? "invoice_id"
                : docType === "purchase_invoice"
                  ? "purchase_invoice_id"
                  : docType === "credit_note"
                    ? "credit_note_id"
                    : docType === "debit_note"
                      ? "debit_note_id"
                      : "quotation_id";

    const parentDocId =
      initialData?.[docIdKey] ??
      initialData?.purchase_invoice_id ??
      initialData?.pi_id ??
      initialData?.invoice_id ??
      initialData?.quotation_id ??
      initialData?.sales_order_id ??
      initialData?.purchase_order_id ??
      initialData?.proforma_id ??
      initialData?.delivery_challan_id ??
      initialData?.credit_note_id ??
      initialData?.debit_note_id ??
      initialData?.id;

    const itemsDetailsPayload = lineItems.map((line, lineIdx) => {
      const lineSub =
        line.quantity * line.unit_rate * (1 - line.discount_percent / 100);
      let lineTaxPercent = 0;
      let lineTaxAmt = 0;

      line.selected_taxes.forEach((taxId) => {
        const taxObj = taxTypesMap.get(String(taxId));
        if (taxObj) {
          lineTaxPercent += getTaxValue(taxObj);
          lineTaxAmt += calculateTaxAmount(lineSub, taxObj);
        }
      });

      // credit_note  → backend expects invoice_item_id
      // debit_note   → backend expects purchase_invoice_item_id
      const srcCreditItemId =
        (line as any).invoice_item_id ??
        (initialData?.itemsDetails?.[lineIdx] as any)?.invoice_item_id;

      const srcDebitItemId =
        (line as any).purchase_invoice_item_id ??
        (initialData?.itemsDetails?.[lineIdx] as any)?.purchase_invoice_item_id;

      return {
        ...(line[itemIdKey as keyof typeof line]
          ? { [itemIdKey]: line[itemIdKey as keyof typeof line] }
          : {}),
        ...(parentDocId != null ? { [docIdKey]: Number(parentDocId) } : {}),
        ...(docType === "credit_note" && srcCreditItemId != null
          ? { invoice_item_id: Number(srcCreditItemId) }
          : {}),
        ...(docType === "debit_note" && srcDebitItemId != null
          ? { purchase_invoice_item_id: Number(srcDebitItemId) }
          : {}),
        item_id: Number(line.item_id),
        description: line.description || "Line item",
        quantity: Number(line.quantity),
        hsn_code: line.hsn_code || "",
        unit_id: line.unit_id ? Number(line.unit_id) : undefined,
        unit_rate: Number(line.unit_rate),
        discount_percent: Number(line.discount_percent),
        discount_flat: Number(line.discount_flat),
        tax_percent: lineTaxPercent,
        tax_amount: Math.round(lineTaxAmt),
      };
    });

    // Build tax details array linked by item index (POST) or item ID (PUT)
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
                  : docType === "credit_note"
                    ? "credit_note_item_index"
                    : docType === "debit_note"
                      ? "debit_note_item_index"
                      : "quotation_item_index";

    const taxDetailIdKey =
      docType === "sales_order"
        ? "sales_order_tax_detail_id"
        : docType === "purchase_order"
          ? "purchase_order_tax_detail_id"
          : docType === "proforma"
            ? "proforma_tax_detail_id"
            : docType === "delivery_challan"
              ? "delivery_challan_tax_detail_id"
              : docType === "sales_invoice"
                ? "invoice_tax_detail_id"
                : docType === "purchase_invoice"
                  ? "purchase_invoice_tax_detail_id"
                  : docType === "credit_note"
                    ? "credit_note_tax_detail_id"
                    : docType === "debit_note"
                      ? "debit_note_tax_detail_id"
                      : "quotation_tax_detail_id";

    const isEditMode = Boolean(
      initialData?.quotation_id ||
        initialData?.sales_order_id ||
        initialData?.purchase_order_id ||
        initialData?.proforma_id ||
        initialData?.delivery_challan_id ||
        initialData?.invoice_id ||
        initialData?.pi_id ||
        initialData?.credit_note_id ||
        initialData?.debit_note_id ||
        initialData?.id,
    );

    lineItems.forEach((line, idx) => {
      line.selected_taxes.forEach((rawTaxId) => {
        const numericTaxId = Number(rawTaxId);
        if (!Number.isFinite(numericTaxId)) return;

        // Ensure selected tax_id is active in Tax Master using O(1) map lookup
        const activeTaxObj = taxTypesMap.get(String(numericTaxId));
        if (!activeTaxObj) return;

        if (!isEditMode) {
          // POST payload: exact format required by backend API docs
          taxDetailsPayload.push({
            [indexKey]: idx,
            tax_id: numericTaxId,
          });
        } else {
          // PUT payload: exact format required by backend API docs
          const existingTax = initialData?.taxDetails?.find((tax: any) => {
            const ref =
              tax[itemIdKey] ??
              tax[`${docType}_item_id`] ??
              tax.quotation_item_id ??
              tax.quotation_item_index;
            return (
              String(ref) ===
                String(line[itemIdKey as keyof typeof line] ?? idx) &&
              Number(tax.tax_id) === numericTaxId
            );
          });

          const detailId =
            existingTax?.[taxDetailIdKey] ?? existingTax?.tax_detail_id;

          taxDetailsPayload.push({
            ...(detailId ? { tax_detail_id: Number(detailId) } : {}),
            ...(line[itemIdKey as keyof typeof line]
              ? { [itemIdKey]: Number(line[itemIdKey as keyof typeof line]) }
              : { [indexKey]: idx }),
            tax_id: numericTaxId,
          });
        }
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
                  : docType === "credit_note"
                    ? "credit_date"
                    : docType === "debit_note"
                      ? "debit_date"
                      : "quotation_date";

    const payload = {
      party_id: Number(partyId),
      [dateKey]: docDate,
      ...(docType === "debit_note"
        ? {
            debit_date: docDate,
            ...(selectedInvoiceId
              ? {
                  purchase_invoice_id: Number(selectedInvoiceId),
                  invoice_id: Number(selectedInvoiceId),
                  pi_id: Number(selectedInvoiceId),
                }
              : {}),
            reason_id: Number(reasonId || 1),
          }
        : {}),
      ...(docType === "credit_note"
        ? {
            credit_date: docDate,
            ...(selectedInvoiceId
              ? {
                  invoice_id: Number(selectedInvoiceId),
                  sales_invoice_id: Number(selectedInvoiceId),
                }
              : {}),
            reason_id: Number(reasonId || 1),
          }
        : {}),
      ...(docType === "purchase_invoice" ? { invoice_date: docDate } : {}),
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
            expected_delivery_date: validUntil || null,
            quotation_id: initialData?.quotation_id ?? null,
            quotation_no: initialData?.quotation_no ?? null,
            customer_po_no: customerPoNo || null,
            customer_po_date: customerPoDate || null,
            billing_address_id: initialData?.billing_address_id ?? 1,
            shipping_address_id: initialData?.shipping_address_id ?? 1,
            shipping_charges: Number(initialData?.shipping_charges ?? 0),
            paid_amount: Number(initialData?.paid_amount ?? 0),
            payment_term_id: initialData?.payment_term_id ?? null,
          }
        : {}),
      ...(docType === "purchase_order" ||
      docType === "purchase_invoice" ||
      docType === "credit_note" ||
      docType === "debit_note"
        ? { due_date: validUntil || undefined }
        : {}),
      ...(docType === "delivery_challan"
        ? { expected_delivery_date: validUntil || undefined }
        : {}),
      currency_id: 1,
      round_off: Number(
        (Math.round(grandTotal) - grandTotal).toFixed(2),
      ).toFixed(2),
      notes: notes
        ? reasonText
          ? `${notes}\nReason: ${reasonText}`
          : notes
        : reasonText
          ? `Reason: ${reasonText}`
          : "",
      terms_conditions: terms,
      status,
      user_id: sessionUserId,
      company_id: sessionCompanyId,
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
          <button
            type="button"
            className="altrex-icon-button"
            aria-label="Close document dialog"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          className="altrex-dialog-body altrex-document-body"
          style={{ flex: 1, overflowY: "auto", padding: "20px", minWidth: 0 }}
        >
          <form
            id="doc-form"
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "20px", minWidth: 0 }}
          >
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
                <span>
                  {isVendorDoc ? "Vendor / Supplier *" : "Customer / Party *"}
                </span>
                <select
                  className="altrex-input altrex-select"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  required
                >
                  <option value="">Select Party...</option>
                  {partiesData.map((p: any) => (
                    <option
                      key={p.party_id ?? p.id}
                      value={(p.party_id ?? p.id).toString()}
                    >
                      {p.company_name ?? p.party_name ?? p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="altrex-field">
                <span>
                  {docType === "debit_note"
                    ? "Debit Date *"
                    : docType === "credit_note"
                      ? "Credit Date *"
                      : docType === "quotation"
                        ? "Quotation Date *"
                        : docType === "sales_order"
                          ? "Order Date *"
                          : docType === "proforma"
                            ? "Proforma Date *"
                            : docType === "delivery_challan"
                              ? "Delivery Date *"
                              : docType === "sales_invoice"
                                ? "Invoice Date *"
                                : docType === "purchase_order"
                                  ? "PO Date *"
                                  : docType === "purchase_invoice"
                                    ? "Purchase Invoice Date *"
                                    : "Document Date *"}
                </span>
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

              <label className="altrex-field">
                <span>Status</span>
                <select
                  className="altrex-input altrex-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as
                        | "draft"
                        | "approved"
                        | "sent"
                        | "cancelled",
                    )
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="sent">Sent</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              {docType === "sales_order" && (
                <>
                  <label className="altrex-field">
                    <span>Customer PO Number</span>
                    <input
                      className="altrex-input"
                      placeholder="e.g. PO-8801"
                      value={customerPoNo}
                      onChange={(e) => setCustomerPoNo(e.target.value)}
                    />
                  </label>
                  <label className="altrex-field">
                    <span>Customer PO Date</span>
                    <input
                      type="date"
                      className="altrex-input"
                      value={customerPoDate}
                      onChange={(e) => setCustomerPoDate(e.target.value)}
                    />
                  </label>
                </>
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

              {docType === "credit_note" && (
                <label className="altrex-field">
                  <span>Against Sales Invoice *</span>
                  <select
                    className="altrex-input altrex-select"
                    value={selectedInvoiceId}
                    onChange={(e) =>
                      handleInvoiceSelect(e.target.value, salesInvoicesRes)
                    }
                  >
                    <option value="">Select Sales Invoice...</option>
                    {salesInvoicesRes
                      .filter(
                        (inv: any) =>
                          !partyId ||
                          String(
                            inv.party_id ??
                              inv.customer_id ??
                              inv.party?.party_id,
                          ) === String(partyId),
                      )
                      .map((inv: any) => {
                        const invId = inv.invoice_id ?? inv.id;
                        const invNo =
                          inv.invoice_no ?? inv.doc_no ?? `#${invId}`;
                        return (
                          <option key={invId} value={invId.toString()}>
                            {invNo}{" "}
                            {inv.total_amount ? `(₹${inv.total_amount})` : ""}
                          </option>
                        );
                      })}
                  </select>
                </label>
              )}

              {docType === "debit_note" && (
                <label className="altrex-field">
                  <span>Against Purchase Invoice *</span>
                  <select
                    className="altrex-input altrex-select"
                    value={selectedInvoiceId}
                    onChange={(e) =>
                      handleInvoiceSelect(e.target.value, purchaseInvoicesRes)
                    }
                  >
                    <option value="">Select Purchase Invoice...</option>
                    {purchaseInvoicesRes
                      .filter(
                        (inv: any) =>
                          !partyId ||
                          String(
                            inv.party_id ??
                              inv.vendor_id ??
                              inv.party?.party_id,
                          ) === String(partyId),
                      )
                      .map((inv: any) => {
                        const invId =
                          inv.purchase_invoice_id ?? inv.pi_id ?? inv.id;
                        const invNo =
                          inv.purchase_invoice_no ??
                          inv.pi_no ??
                          inv.doc_no ??
                          `#${invId}`;
                        return (
                          <option key={invId} value={invId.toString()}>
                            {invNo}{" "}
                            {inv.total_amount ? `(₹${inv.total_amount})` : ""}
                          </option>
                        );
                      })}
                  </select>
                </label>
              )}

              {(docType === "credit_note" || docType === "debit_note") && (
                <label className="altrex-field">
                  <span>Reason *</span>
                  <select
                    className="altrex-input altrex-select"
                    value={reasonId}
                    onChange={(e) => {
                      setReasonId(e.target.value);
                      const selectedObj = filteredReasons.find(
                        (r: any) =>
                          String(r.reason_id ?? r.id) === e.target.value,
                      );
                      if (selectedObj) {
                        setReasonText(
                          selectedObj.reason_name ??
                            selectedObj.reason ??
                            selectedObj.name ??
                            "",
                        );
                      }
                    }}
                  >
                    <option value="">Select Reason...</option>
                    {filteredReasons.map((r: any) => (
                      <option
                        key={r.reason_id ?? r.id}
                        value={(r.reason_id ?? r.id).toString()}
                      >
                        {r.reason_name ?? r.reason ?? r.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {/* Line Items Table Repeater */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--altrex-text)",
                  }}
                >
                  Line Items & Products
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddLine}
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                >
                  <Plus size={14} /> Add Line Item
                </Button>
              </div>

              <div className="altrex-table-wrap">
                <table className="altrex-table altrex-document-line-items">
                  <colgroup>
                    <col className="altrex-document-col-item" />
                    <col className="altrex-document-col-qty" />
                    <col className="altrex-document-col-rate" />
                    <col className="altrex-document-col-discount" />
                    <col className="altrex-document-col-taxes" />
                    <col className="altrex-document-col-action" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Item / Product</th>
                      <th>Qty</th>
                      <th>Unit Rate (₹)</th>
                      <th>Disc (%) / Flat (₹)</th>
                      <th>Taxes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((line, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            className="altrex-input altrex-select"
                            value={line.item_id}
                            onChange={(e) =>
                              handleItemSelect(idx, e.target.value)
                            }
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
                                <option
                                  key={i.item_id ?? i.id}
                                  value={(i.item_id ?? i.id).toString()}
                                >
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
                                prev.map((l, i) =>
                                  i === idx
                                    ? { ...l, quantity: Number(e.target.value) }
                                    : l,
                                ),
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
                                prev.map((l, i) =>
                                  i === idx
                                    ? {
                                        ...l,
                                        unit_rate: Number(e.target.value),
                                      }
                                    : l,
                                ),
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
                                prev.map((l, i) =>
                                  i === idx
                                    ? {
                                        ...l,
                                        discount_percent: Number(
                                          e.target.value,
                                        ),
                                      }
                                    : l,
                                ),
                              )
                            }
                            style={{ height: "34px", fontSize: "13px" }}
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="altrex-input"
                            placeholder="Flat ₹"
                            value={line.discount_flat}
                            onChange={(e) =>
                              setLineItems((prev) =>
                                prev.map((l, i) =>
                                  i === idx
                                    ? {
                                        ...l,
                                        discount_flat: Number(e.target.value),
                                      }
                                    : l,
                                ),
                              )
                            }
                            style={{
                              height: "34px",
                              fontSize: "13px",
                              marginTop: "4px",
                            }}
                          />
                        </td>
                        <td>
                          <div
                            className="altrex-document-tax-options"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                              gap: "6px",
                              minWidth: 0,
                              width: "100%",
                            }}
                          >
                            {taxTypes.length === 0 ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "var(--altrex-muted)",
                                }}
                              >
                                No tax types configured
                              </span>
                            ) : (
                              taxTypes.map((t: any) => {
                                const tid = t.tax_id ?? t.id;
                                const isChecked =
                                  line.selected_taxes.includes(tid);
                                return (
                                  <button
                                    key={tid}
                                    type="button"
                                    onClick={() => handleToggleTax(idx, tid)}
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      padding: "2px 6px",
                                      minWidth: 0,
                                      maxWidth: "100%",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      borderRadius: "4px",
                                      border: isChecked
                                        ? "1px solid var(--altrex-primary)"
                                        : "1px solid var(--altrex-border)",
                                      background: isChecked
                                        ? "rgba(37,99,235,0.1)"
                                        : "transparent",
                                      color: isChecked
                                        ? "var(--altrex-primary)"
                                        : "var(--altrex-muted)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {t.tax_name} ({getTaxValue(t)}
                                    {String(t.tax_type).toLowerCase() ===
                                    "fixed"
                                      ? ""
                                      : "%"}
                                    )
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td>
                          <Button
                            type="button"
                            variant="outline"
                            aria-label={`Remove line item ${idx + 1}`}
                            onClick={() => handleRemoveLine(idx)}
                            disabled={lineItems.length === 1}
                            style={{
                              color: "var(--altrex-danger-text)",
                              padding: "4px 8px",
                            }}
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
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 300px",
                gap: "20px",
                minWidth: 0,
              }}
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
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--altrex-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Estimated Document Totals
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>
                    ₹
                    {subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <span>Est. Taxes:</span>
                  <span style={{ fontWeight: 600, color: "#8b5cf6" }}>
                    ₹
                    {estimatedTax.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
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
                  <span style={{ color: "var(--altrex-primary)" }}>
                    ₹
                    {grandTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
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
