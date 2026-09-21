"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button, DataTable, FilterBar } from "@altrex/ui";
import {
  ArrowUpDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CreditCard,
  FileText,
  Mail,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DocumentForm, type DocumentType } from "./DocumentForm";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

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
    if (
      value[key] &&
      typeof value[key] === "object" &&
      !Array.isArray(value[key])
    ) {
      return extractObject(value[key], keys);
    }
  }
  return value;
}

export const DOCUMENT_PRINT_CONFIG: Record<
  DocumentType,
  {
    endpoint: (id: string | number) => string;
    keys: string[];
    label: string;
    itemIdKey: string;
    taxRefKey: string;
    refLabel: string;
    dateKey: string;
  }
> = {
  quotation: {
    endpoint: endpoints.documents.quotationDetail,
    keys: ["quotation", "Quotation", "Quotations", "quotations"],
    label: "QUOTE",
    refLabel: "Quote #",
    dateKey: "quotation_date",
    itemIdKey: "quotation_item_id",
    taxRefKey: "quotation_item_id",
  },
  sales_order: {
    endpoint: endpoints.documents.salesOrderDetail,
    keys: ["sales_order", "SalesOrder", "SalesOrders", "salesOrders"],
    label: "SALES ORDER",
    refLabel: "Order #",
    dateKey: "sales_order_date",
    itemIdKey: "sales_order_item_id",
    taxRefKey: "sales_order_item_id",
  },
  proforma: {
    endpoint: endpoints.documents.proformaDetail,
    keys: ["proforma", "Proforma", "Proformas", "proformas"],
    label: "PROFORMA INVOICE",
    refLabel: "Proforma #",
    dateKey: "proforma_date",
    itemIdKey: "proforma_item_id",
    taxRefKey: "proforma_item_id",
  },
  delivery_challan: {
    endpoint: endpoints.documents.deliveryChallanDetail,
    keys: [
      "delivery_challan",
      "DeliveryChallan",
      "DeliveryChallans",
      "delivery_challans",
    ],
    label: "DELIVERY CHALLAN",
    refLabel: "Challan #",
    dateKey: "delivery_date",
    itemIdKey: "delivery_challan_item_id",
    taxRefKey: "delivery_challan_item_id",
  },
  sales_invoice: {
    endpoint: endpoints.documents.invoiceDetail,
    keys: ["invoice", "Invoice", "Invoices", "invoices"],
    label: "TAX INVOICE",
    refLabel: "Invoice #",
    dateKey: "invoice_date",
    itemIdKey: "invoice_item_id",
    taxRefKey: "invoice_item_id",
  },
  purchase_order: {
    endpoint: endpoints.documents.purchaseOrderDetail,
    keys: [
      "purchase_order",
      "PurchaseOrder",
      "PurchaseOrders",
      "purchase_orders",
    ],
    label: "PURCHASE ORDER",
    refLabel: "PO #",
    dateKey: "purchase_order_date",
    itemIdKey: "purchase_order_item_id",
    taxRefKey: "purchase_order_item_id",
  },
  purchase_invoice: {
    endpoint: endpoints.documents.purchaseInvoiceDetail,
    keys: [
      "purchase_invoice",
      "PurchaseInvoice",
      "PurchaseInvoices",
      "purchase_invoices",
      "Invoices",
      "invoices",
    ],
    label: "PURCHASE BILL",
    refLabel: "Bill #",
    dateKey: "purchase_invoice_date",
    itemIdKey: "purchase_invoice_item_id",
    taxRefKey: "purchase_invoice_item_id",
  },
  credit_note: {
    endpoint: endpoints.documents.creditNoteDetail,
    keys: ["credit_note", "CreditNote", "CreditNotes", "credit_notes"],
    label: "CREDIT NOTE",
    refLabel: "Credit Note #",
    dateKey: "credit_note_date",
    itemIdKey: "credit_note_item_id",
    taxRefKey: "credit_note_item_id",
  },
  debit_note: {
    endpoint: endpoints.documents.debitNoteDetail,
    keys: ["debit_note", "DebitNote", "DebitNotes", "debit_notes"],
    label: "DEBIT NOTE",
    refLabel: "Debit Note #",
    dateKey: "debit_note_date",
    itemIdKey: "debit_note_item_id",
    taxRefKey: "debit_note_item_id",
  },
};

export function numberToWordsIndian(value: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const underThousand = (n: number): string =>
    n < 20
      ? ones[n]
      : n < 100
        ? `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim()
        : `${ones[Math.floor(n / 100)]} Hundred ${underThousand(n % 100)}`.trim();
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

  popup.document.write(
    `<p style="font-family:Arial;padding:32px">Preparing ${config.label.toLowerCase()}...</p>`,
  );

  const documentId =
    document.quotation_id ??
    document.sales_order_id ??
    document.proforma_id ??
    document.delivery_challan_id ??
    document.invoice_id ??
    document.purchase_order_id ??
    document.purchase_invoice_id ??
    document.credit_note_id ??
    document.debit_note_id ??
    document.id ??
    "document";
  const partyId =
    document.party_id ?? document.customer_id ?? document.vendor_id;
  const [
    detail,
    profile,
    customer,
    uom,
    taxes,
    banks,
    cities,
    states,
    countries,
  ] = await Promise.all([
    apiClient.get<any>(config.endpoint(documentId)).catch(() => document),
    apiClient.get<any>(endpoints.auth.profile).catch(() => ({})),
    partyId != null
      ? apiClient
          .get<any>(endpoints.party.customer(partyId))
          .catch(() =>
            apiClient
              .get<any>(endpoints.party.vendor(partyId))
              .catch(() => ({})),
          )
      : Promise.resolve({}),
    apiClient.get<any>(endpoints.masters.uom).catch(() => []),
    apiClient.get<any>(endpoints.masters.taxTypes).catch(() => []),
    apiClient.get<any>(endpoints.masters.bank).catch(() => []),
    apiClient.get<any>(endpoints.masters.city).catch(() => []),
    apiClient.get<any>(endpoints.masters.state).catch(() => []),
    apiClient.get<any>(endpoints.masters.country).catch(() => []),
  ]);

  const quotation =
    extractList(detail, config.keys.concat(["data"]))[0] ?? detail ?? document;

  // Profile API returns { profile_details: {...}, bank_details: {...} } envelope layout
  const profileObj =
    (profile as any)?.data ??
    (profile as any)?.profile ??
    (profile as any)?.result ??
    profile;
  const profileDetails =
    profileObj?.profile_details ??
    profileObj?.company ??
    profileObj?.profile ??
    profileObj?.data ??
    (profileObj?.company_name ? profileObj : {});
  const bankDetails =
    profileObj?.bank_details ??
    profileObj?.bank ??
    (profileObj?.account_no ? profileObj : {});
  const company: any = {
    ...profileDetails,
    ...bankDetails,
    bank_id: bankDetails?.bank_id ?? profileDetails?.bank_id ?? null,
  };

  // Customer API returns { customers: [...] } — pull first element
  const customerList = extractList(customer, [
    "customers",
    "vendors",
    "parties",
    "customer",
    "vendor",
    "data",
    "rows",
  ]);
  const customerData: any =
    customerList.length > 0
      ? customerList[0]
      : (extractObject(customer, [
          "customer",
          "party",
          "data",
          "result",
          "payload",
        ]) ?? {});

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

  const date =
    quotation[config.dateKey] ??
    quotation.debit_date ??
    quotation.debit_note_date ??
    quotation.credit_date ??
    quotation.credit_note_date ??
    quotation.quotation_date ??
    quotation.sales_order_date ??
    quotation.invoice_date ??
    quotation.delivery_date ??
    quotation.created_at ??
    "";
  const validUntil =
    quotation.valid_until ??
    quotation.due_date ??
    quotation.shipping_date ??
    quotation.expected_delivery_date ??
    "";
  const docRefNo =
    quotation.quotation_no ??
    quotation.sales_order_no ??
    quotation.proforma_no ??
    quotation.invoice_no ??
    quotation.purchase_order_no ??
    quotation.purchase_invoice_no ??
    quotation.pi_no ??
    quotation.credit_note_no ??
    quotation.debit_note_no ??
    quotation.doc_no ??
    `#${documentId}`;

  const customerName =
    customerData.party_name ??
    customerData.company_name ??
    customerData.customer_name ??
    customerData.name ??
    quotation.party_name ??
    quotation.company_name ??
    "N/A";

  const lookup = (list: any[], id: any) =>
    list.find(
      (entry) =>
        String(
          entry.unit_id ??
            entry.tax_id ??
            entry.bank_id ??
            entry.city_id ??
            entry.state_id ??
            entry.country_id ??
            entry.id,
        ) === String(id),
    ) ?? {};
  const money = (value: any) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  const fmtDate = (d: string) => {
    try {
      return d
        ? new Date(d).toLocaleDateString("en-GB").replace(/\//g, " - ")
        : "";
    } catch {
      return d ?? "";
    }
  };

  const hasDiscountInItems = items.some(
    (item: any) =>
      Number(item.discount_flat || 0) > 0 ||
      Number(item.discount_percent || 0) > 0,
  );

  const rows = items
    .map((item: any, index: number) => {
      const quantity = Number(item.quantity || 0);
      const rate = Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0);
      const flatDiscount = Number(item.discount_flat ?? 0);
      const pctDiscount = Number(item.discount_percent ?? 0);
      const grossRate =
        item.total_rate != null ? Number(item.total_rate) : quantity * rate;
      const discAmt =
        flatDiscount > 0 ? flatDiscount : grossRate * (pctDiscount / 100);
      const taxable =
        item.taxable_value != null
          ? Number(item.taxable_value)
          : item.total_rate != null && (flatDiscount > 0 || pctDiscount > 0)
            ? grossRate - discAmt
            : item.total_amount != null && item.tax_amount != null
              ? Number(item.total_amount) - Number(item.tax_amount)
              : grossRate - discAmt;

      const unit = lookup(units, item.unit_id);
      const allTaxDetails = Array.isArray(quotation.taxDetails)
        ? quotation.taxDetails
        : [];
      const lineId = item[config.itemIdKey];
      const itemTaxes = allTaxDetails.filter((tax: any) => {
        const ref = tax[config.taxRefKey] ?? tax[`${docType}_item_index`];
        return String(ref) === String(lineId ?? index);
      });
      const taxName = (tax: any) =>
        tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "";
      const cgst = itemTaxes.find((tax: any) => /cgst/i.test(taxName(tax)));
      const sgst = itemTaxes.find((tax: any) => /sgst/i.test(taxName(tax)));
      const igst = itemTaxes.find((tax: any) => /igst/i.test(taxName(tax)));
      const itemTaxSum =
        itemTaxes.length > 0
          ? itemTaxes.reduce(
              (sum: number, t: any) => sum + Number(t.tax_amount || 0),
              0,
            )
          : Number(item.tax_amount || 0);

      const cgstAmt = cgst
        ? Number(cgst.tax_amount)
        : igst
          ? Number(igst.tax_amount)
          : itemTaxes.length === 1
            ? Number(itemTaxes[0].tax_amount)
            : itemTaxSum > 0 && !sgst
              ? itemTaxSum / 2
              : 0;
      const sgstAmt = sgst
        ? Number(sgst.tax_amount)
        : itemTaxes.length > 1
          ? Number(itemTaxes[1].tax_amount)
          : itemTaxSum > 0 && !cgst && !igst
            ? itemTaxSum / 2
            : 0;

      const cgstPctVal =
        cgst?.tax_percent ??
        (cgstAmt > 0 && taxable > 0 ? (cgstAmt / taxable) * 100 : 9);
      const sgstPctVal =
        sgst?.tax_percent ??
        (sgstAmt > 0 && taxable > 0 ? (sgstAmt / taxable) * 100 : 9);

      const lineTotal =
        item.total_amount != null
          ? Number(item.total_amount)
          : taxable + itemTaxSum;
      const uomStr = escapeHtml(
        unit.unit_code ?? unit.unit_name ?? item.unit_name ?? "NOS",
      );

      if (docType === "delivery_challan") {
        return `<tr>
        <td class="center">${index + 1}</td>
        <td><strong>${escapeHtml(item.item_name ?? item.description ?? "Line item")}</strong>${item.item_name && item.description ? `<br><span style="color:#64748b;font-size:8.5px">${escapeHtml(item.description)}</span>` : ""}</td>
        <td class="center">${escapeHtml(item.hsn_code ?? "")}</td>
        <td class="num"><strong>${quantity.toFixed(2)}</strong><br><span style="font-size:7.5px;color:#475569">${uomStr}</span></td>
      </tr>`;
      }

      return `<tr>
      <td class="center">${index + 1}</td>
      <td><strong>${escapeHtml(item.item_name ?? item.description ?? "Line item")}</strong>${item.item_name && item.description ? `<br><span style="color:#64748b;font-size:8.5px">${escapeHtml(item.description)}</span>` : ""}</td>
      <td class="center">${escapeHtml(item.hsn_code ?? "")}</td>
      <td class="num">${quantity.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}<br><span style="font-size:7.5px;color:#475569">${uomStr}</span></td>
      <td class="num">${money(rate)}</td>
      ${hasDiscountInItems ? `<td class="num">${money(discAmt)}${pctDiscount > 0 ? `<br><span style="font-size:7.5px;color:#475569">${pctDiscount}%</span>` : ""}</td>` : ""}
      <td class="num">${money(taxable)}</td>
      <td class="num">${money(cgstAmt)}<br><span style="font-size:7.5px;color:#475569">${cgstPctVal}%</span></td>
      <td class="num">${money(sgstAmt)}<br><span style="font-size:7.5px;color:#475569">${sgstPctVal}%</span></td>
      <td class="num"><strong>${money(lineTotal)}</strong></td>
    </tr>`;
    })
    .join("");

  const allTaxDetails = Array.isArray(quotation.taxDetails)
    ? quotation.taxDetails
    : [];
  const subtotalAmount =
    quotation.subtotal_amount != null
      ? Number(quotation.subtotal_amount)
      : items.reduce(
          (sum: number, item: any) =>
            sum +
            Number(
              item.total_rate ??
                Number(item.quantity || 0) *
                  Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0),
            ),
          0,
        );

  const discountValue =
    quotation.discount_value != null
      ? Number(quotation.discount_value)
      : items.reduce(
          (sum: number, item: any) =>
            sum +
            Number(
              item.discount_flat ??
                Number(item.quantity || 0) *
                  Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0) *
                  (Number(item.discount_percent || 0) / 100),
            ),
          0,
        );

  const taxableTotal =
    quotation.subtotal_amount != null && quotation.discount_value != null
      ? Number(quotation.subtotal_amount) - Number(quotation.discount_value)
      : items.reduce((sum: number, item: any) => {
          const qty = Number(item.quantity || 0);
          const rate = Number(
            item.unit_rate ?? item.sales_rate ?? item.rate ?? 0,
          );
          const gross = Number(item.total_rate ?? qty * rate);
          const disc = Number(
            item.discount_flat ??
              gross * (Number(item.discount_percent || 0) / 100),
          );
          if (item.taxable_value != null)
            return sum + Number(item.taxable_value);
          if (item.total_amount != null && item.tax_amount != null)
            return sum + (Number(item.total_amount) - Number(item.tax_amount));
          return sum + (gross - disc);
        }, 0);

  const cgstTotal = allTaxDetails
    .filter((tax: any) =>
      /cgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? ""),
    )
    .reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);
  const sgstTotal = allTaxDetails
    .filter((tax: any) =>
      /sgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? ""),
    )
    .reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);
  const igstTotal = allTaxDetails
    .filter((tax: any) =>
      /igst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? ""),
    )
    .reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);

  const itemTaxTotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.tax_amount || 0),
    0,
  );
  const totalTaxAmount =
    quotation.total_tax_amount != null
      ? Number(quotation.total_tax_amount)
      : cgstTotal + sgstTotal + igstTotal || itemTaxTotal;

  const roundOff = Number(quotation.round_off || 0);
  const total =
    quotation.total_amount != null
      ? Number(quotation.total_amount)
      : taxableTotal + totalTaxAmount + roundOff;
  const words = `${numberToWordsIndian(Math.round(total))} Only`;
  const terms = String(quotation.terms_conditions ?? "")
    .split(/\r?\n/)
    .filter(Boolean);
  const hasTerms = terms.length > 0;

  const addresses = Array.isArray(customerData.addresses)
    ? customerData.addresses
    : [];
  const billingAddress =
    addresses.find((a: any) => ["billing", "both"].includes(a.address_type)) ??
    addresses[0] ??
    {};
  const shippingAddress =
    addresses.find((a: any) => ["shipping", "both"].includes(a.address_type)) ??
    billingAddress;

  const contactPersons: any[] = Array.isArray(customerData.contactpersons)
    ? customerData.contactpersons
    : [];
  const primaryContact = contactPersons[0] ?? null;

  const bank = lookup(bankRows, company.bank_id);

  const placeOfSupply = () => {
    const stateObj = lookup(
      stateRows,
      billingAddress.state_id ?? company.state_id,
    );
    const code = stateObj.state_code ?? stateObj.code ?? "GJ (24)";
    const name = stateObj.state_name ?? stateObj.name ?? "GJ";
    return `${name} (${code.replace(/^(GJ|IN-)?/i, "")})`;
  };

  const addressText = (addr: any) => {
    const parts = [
      addr.address_line1,
      addr.address_line2,
      lookup(cityRows, addr.city_id).city_name,
      lookup(stateRows, addr.state_id).state_name,
      addr.pincode,
      lookup(countryRows, addr.country_id).country_name,
    ].filter(Boolean);
    return parts.join(", ") || "";
  };

  const companyAddressText = () => {
    const parts = [
      company.address_line1,
      company.address_line2,
      lookup(cityRows, company.city_id).city_name,
      lookup(stateRows, company.state_id).state_name,
      company.pincode,
      lookup(countryRows, company.country_id).country_name,
    ].filter(Boolean);
    return parts.join(", ") || "";
  };

  const partyBoxHtml = (title: string, addr: any) => {
    const attention =
      addr.attention_to ?? addr.contact_name ?? primaryContact?.name ?? "";
    const addrPhone =
      addr.phone ?? customerData.phone ?? primaryContact?.phone ?? "";
    const addrStr = addressText(addr);
    return `<div>
      <div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px">${escapeHtml(title)}</div>
      <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:2px">${escapeHtml(customerName)}</div>
      ${attention ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">${escapeHtml(attention)}</p>` : ""}
      ${addrStr ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">${escapeHtml(addrStr)}</p>` : ""}
      ${addrPhone ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">Ph: ${escapeHtml(addrPhone)}</p>` : ""}
      ${customerData.gst_no ? `<p style="margin:1px 0;color:#475569;font-size:9.5px"><strong>GSTIN:</strong> ${escapeHtml(customerData.gst_no)}</p>` : ""}
    </div>`;
  };

  const isCopyLabelDoc =
    docType === "sales_invoice" || docType === "purchase_invoice";
  const isCreditNote = docType === "credit_note";
  const isDebitNote = docType === "debit_note";
  const isDeliveryChallan = docType === "delivery_challan";

  const origInvoiceNo =
    quotation.invoice_no ??
    quotation.sales_invoice_no ??
    quotation.purchase_invoice_no ??
    quotation.pi_no ??
    "";
  const origInvoiceDate =
    quotation.invoice_date ??
    quotation.pi_date ??
    quotation.document_date ??
    "";
  const origDocNo =
    quotation.doc_no ??
    quotation.document_no ??
    quotation.purchase_invoice_no ??
    quotation.pi_no ??
    "";
  const origDocDate =
    quotation.doc_date ?? quotation.document_date ?? quotation.pi_date ?? "";

  popup.document.open();
  popup.document.write(`<!doctype html>
<html><head><title>${escapeHtml(config.label)} #${escapeHtml(String(docRefNo))}</title>
<style>
  @page { size: A4 portrait; margin: 8px; }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 9.5px; background: #ffffff; }
  .page { position: relative; padding: 12px; width: 100%; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  p { margin: 1px 0; line-height: 1.35; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 14px; }
  table.items-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9px; }
  table.items-table th { background-color: #2b5b84 !important; color: #ffffff !important; font-weight: 700; text-transform: uppercase; padding: 6px 4px; border: 1px solid #2b5b84; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  table.items-table td { border: 1px solid #cbd5e1; padding: 5px 6px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .center { text-align: center; }
  .total-row td { font-weight: 700; background-color: #f8fafc !important; border-top: 2px solid #2b5b84; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px; gap: 20px; }
  .bank-box { font-size: 9.5px; color: #334155; line-height: 1.5; }
  .totals-box { text-align: right; font-size: 10px; line-height: 1.65; min-width: 320px; }
  .terms-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; pt: 10px; border-top: 1px solid #e2e8f0; }
  .terms-box { max-width: 65%; font-size: 9px; color: #334155; }
  .terms-box ol { margin: 4px 0 0 14px; padding: 0; }
  .terms-box li { margin-bottom: 3px; font-style: italic; }
  .sig-box { text-align: right; width: 30%; }
</style></head><body>
<section class="page">
  <header>
    <div style="max-width:56%">
      ${company.logo ? `<img src="${company.logo}" style="max-height:55px;max-width:220px;object-fit:contain;margin-bottom:4px"><br>` : ""}
      <div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:2px">${escapeHtml(company.company_name ?? "Teton Projects Pvt. Ltd.")}</div>
      ${companyAddressText() ? `<p style="color:#475569">${escapeHtml(companyAddressText())}</p>` : ""}
      ${company.phone ? `<p style="color:#475569">+91${escapeHtml(company.phone.replace(/^(\+91|91)/, ""))}</p>` : ""}
      ${company.email ? `<p style="color:#475569">${escapeHtml(company.email)}</p>` : ""}
      <p style="color:#475569"><strong>GSTIN:</strong> ${escapeHtml(company.gst_no ?? "24AAHCT3033A1ZZ")} ${company.website ? `&nbsp;<strong>Website:</strong> ${escapeHtml(company.website)}` : ""}</p>
      ${company.contact_name ? `<p style="color:#475569"><strong>Contact Name:</strong> ${escapeHtml(company.contact_name)}</p>` : ""}
    </div>

    <div style="width:40%;text-align:right">
      ${isCopyLabelDoc ? `<div style="font-size:9px;color:#64748b;font-weight:600;margin-bottom:2px">Original Copy</div>` : ""}
      <div style="font-size:22px;font-weight:700;color:#0f172a;letter-spacing:0.5px">${config.label}</div>
      <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:8px">${escapeHtml(docRefNo)}</div>
      
      ${
        !isDeliveryChallan
          ? `
      <div style="background-color:#2b5b84!important;color:#ffffff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;border-radius:2px;margin-bottom:8px">
        <span style="font-size:11px;font-weight:600">${isCreditNote ? "Credits Available:" : "Amount Due:"}</span>
        <span style="font-size:14px;font-weight:700">INR ${money(total)}</span>
      </div>
      `
          : ""
      }

      <div style="font-size:9.5px;color:#334155;line-height:1.5">
        ${
          isCreditNote
            ? `
          <div><strong>Date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(date))}</div>
          ${origInvoiceNo ? `<div><strong>Invoice no:</strong> &nbsp;&nbsp; ${escapeHtml(origInvoiceNo)}</div>` : ""}
          ${origInvoiceDate ? `<div><strong>Invoice date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(origInvoiceDate))}</div>` : ""}
          <div><strong>Place of Supply:</strong> &nbsp;&nbsp; ${escapeHtml(placeOfSupply())}</div>
        `
            : isDebitNote
              ? `
          <div><strong>Date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(date))}</div>
          ${origDocNo ? `<div><strong>Document no:</strong> &nbsp;&nbsp; ${escapeHtml(origDocNo)}</div>` : ""}
          ${origDocDate ? `<div><strong>Document date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(origDocDate))}</div>` : ""}
          ${origInvoiceNo ? `<div><strong>Invoice No.:</strong> &nbsp;&nbsp; ${escapeHtml(origInvoiceNo)}</div>` : ""}
          <div><strong>Place of Supply:</strong> &nbsp;&nbsp; ${escapeHtml(placeOfSupply())}</div>
        `
              : isDeliveryChallan
                ? `
          <div><strong>Date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(date))}</div>
          <div><strong>Shipping Date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(validUntil || date))}</div>
          <div><strong>Place of Supply:</strong> &nbsp;&nbsp; ${escapeHtml(placeOfSupply())}</div>
        `
                : `
          <div><strong>Issue Date:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(date))}</div>
          ${validUntil ? `<div><strong>${docType === "quotation" || docType === "purchase_order" ? "Valid Until" : "Due Date"}:</strong> &nbsp;&nbsp; ${escapeHtml(fmtDate(validUntil))}</div>` : ""}
          <div><strong>Place of Supply:</strong> &nbsp;&nbsp; ${escapeHtml(placeOfSupply())}</div>
        `
        }
      </div>
    </div>
  </header>

  <div class="grid">
    ${partyBoxHtml(docType === "quotation" ? "Quote To" : docType === "purchase_order" || docType === "purchase_invoice" || docType === "debit_note" ? "Vendor" : "Bill To", billingAddress)}
    ${partyBoxHtml("Ship To", shippingAddress)}
  </div>

  ${
    isDeliveryChallan
      ? `
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:6%">S.No</th>
        <th style="width:54%">Item Description</th>
        <th style="width:20%">HSN</th>
        <th style="width:20%">Qty<br><span style="font-size:7.5px;font-weight:400">UoM</span></th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="4" class="center">No line items</td></tr>'}
    </tbody>
  </table>
  `
      : `
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:4%">S.No</th>
        <th style="width:${hasDiscountInItems ? "24%" : "28%"}">Item Description</th>
        <th style="width:10%">HSN/SAC</th>
        <th style="width:8%">Qty<br><span style="font-size:7.5px;font-weight:400">UoM</span></th>
        <th style="width:10%">Price<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        ${hasDiscountInItems ? `<th style="width:10%">Discount<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>` : ""}
        <th style="width:12%">Taxable Value<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:9%">CGST<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:9%">SGST<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:12%">Amount<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="${hasDiscountInItems ? 10 : 9}" class="center">No line items</td></tr>`}
      <tr class="total-row">
        <td colspan="${hasDiscountInItems ? 6 : 5}" style="text-align:right">Total ${cgstTotal || sgstTotal || igstTotal ? `@18%` : ""}</td>
        <td class="num">${money(taxableTotal)}</td>
        <td class="num">${money(cgstTotal)}</td>
        <td class="num">${money(sgstTotal)}</td>
        <td class="num">${money(total)}</td>
      </tr>
    </tbody>
  </table>
  `
  }

  ${
    !isDeliveryChallan
      ? `
  <div class="summary-section">
    <div class="bank-box">
      <div><strong>Bank Name:</strong> ${escapeHtml(bank.bank_name ?? bank.name ?? company.bank_name ?? "ICICI Bank")}</div>
      <div><strong>Account Number:</strong> ${escapeHtml(company.account_no ?? "137005002624")}</div>
      <div><strong>Branch Name:</strong> ${escapeHtml(company.branch_name ?? "Sanand Branch")}</div>
      <div><strong>IFSC Code:</strong> ${escapeHtml(company.ifsc_code ?? "ICIC0001370")}</div>
    </div>

    <div class="totals-box">
      ${discountValue > 0 ? `<div><strong>Discount:</strong> &nbsp;&nbsp; (-) INR ${money(discountValue)}</div>` : ""}
      <div><strong>Total Taxable Value:</strong> &nbsp;&nbsp; INR ${money(taxableTotal)}</div>
      <div><strong>Total Tax Amount:</strong> &nbsp;&nbsp; INR ${money(totalTaxAmount)}</div>
      ${roundOff !== 0 ? `<div><strong>Rounded Off:</strong> &nbsp;&nbsp; ${roundOff < 0 ? "(-)" : ""} INR ${money(Math.abs(roundOff))}</div>` : ""}
      <div><strong>Total Value (in figure):</strong> &nbsp;&nbsp; INR ${money(total)}</div>
      <div><strong>Total Value (in words):</strong> &nbsp;&nbsp; <strong>INR ${escapeHtml(words)}</strong></div>
    </div>
  </div>
  `
      : ""
  }

  <div class="terms-section">
    ${
      isCreditNote
        ? `
      <div class="sig-box" style="text-align:left;width:30%">
        <div style="border-top:1px solid #cbd5e1;padding-top:4px;font-size:10px;font-weight:700;color:#0f172a">Provider Signature</div>
      </div>
      <div class="sig-box" style="text-align:right;width:30%">
        <div style="border-top:1px solid #cbd5e1;padding-top:4px;font-size:10px;font-weight:700;color:#0f172a">Receiver Signature</div>
      </div>
    `
        : `
      <div class="terms-box">
        <div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:4px">Terms &amp; Conditions</div>
        ${hasTerms ? `<ol>${terms.map((t) => `<li>${escapeHtml(t.replace(/^\d+[.)]\s*/, ""))}</li>`).join("")}</ol>` : '<p style="font-style:italic">Payment within 7 Days.</p>'}
      </div>

      <div class="sig-box">
        ${company.authorized_signature ? `<img src="${company.authorized_signature}" style="max-height:45px;object-fit:contain;margin-bottom:4px"><br>` : ""}
        <div style="border-top:1px solid #cbd5e1;padding-top:4px;font-size:10px;font-weight:700;color:#0f172a">Provider Signature</div>
      </div>
    `
    }
  </div>
</section>
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
  useCreate: () => {
    mutate: (body: any, opts?: any) => void;
    isPending: boolean;
  };
  useUpdate: () => {
    mutate: (args: { id: string; body: any }, opts?: any) => void;
    isPending: boolean;
  };
  useDelete: () => {
    mutate: (id: string, opts?: any) => void;
    isPending: boolean;
  };
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
  const [statusFilter, setStatusFilter] = useState("");
  const [activeDoc, setActiveDoc] = useState<any | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.document) {
        printDocument(e.detail.document, e.detail.docType);
      }
    };
    window.addEventListener("altrex-print-doc", handler);
    return () => window.removeEventListener("altrex-print-doc", handler);
  }, []);

  // Sorting state
  const [sortField, setSortField] = useState<string>("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: responseData, isLoading, error } = useList();
  const docs = useMemo(
    () =>
      extractList(responseData, [
        "quotations",
        "Quotations",
        "quotation",
        "invoices",
        "purchase_invoices",
        "credit_notes",
        "debit_notes",
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

  const getDocNo = (doc: any) =>
    doc.invoice_no ??
    doc.purchase_invoice_no ??
    doc.pi_no ??
    doc.quotation_no ??
    doc.sales_order_no ??
    doc.proforma_no ??
    doc.delivery_challan_no ??
    doc.credit_note_no ??
    doc.debit_note_no ??
    doc.doc_no ??
    `#${getId(doc)}`;

  const getDate = (doc: any) =>
    doc.invoice_date ??
    doc.pi_date ??
    doc.quotation_date ??
    doc.sales_order_date ??
    doc.proforma_date ??
    doc.delivery_date ??
    doc.credit_date ??
    doc.credit_note_date ??
    doc.debit_date ??
    doc.debit_note_date ??
    doc.purchase_order_date ??
    doc.created_at ??
    "";

  const getDueDate = (doc: any) =>
    doc.due_date ?? doc.valid_until ?? doc.expected_delivery_date ?? "";

  const getPartyName = (doc: any) =>
    doc.party_name ??
    doc.company_name ??
    doc.customer_name ??
    doc.vendor_name ??
    doc.party?.company_name ??
    doc.party?.party_name ??
    "N/A";

  const getTaxAmount = (doc: any) => {
    if (doc.total_tax_amount != null) return Number(doc.total_tax_amount);
    if (Array.isArray(doc.itemsDetails)) {
      return doc.itemsDetails.reduce(
        (sum: number, i: any) => sum + Number(i.tax_amount || 0),
        0,
      );
    }
    return 0;
  };

  const getGrandTotal = (doc: any) => {
    if (doc.total_amount != null) return Number(doc.total_amount);
    if (doc.grand_total != null) return Number(doc.grand_total);
    const sub = Number(doc.subtotal_amount || 0);
    const tax = getTaxAmount(doc);
    return sub + tax;
  };

  const getBalanceDue = (doc: any) => {
    if (doc.balance_due != null) return Number(doc.balance_due);
    const total = getGrandTotal(doc);
    const paid = Number(doc.paid_amount || 0);
    return total - paid;
  };

  const isVendorDoc =
    docType === "purchase_order" ||
    docType === "purchase_invoice" ||
    docType === "debit_note";
  const partyLabel = isVendorDoc ? "Vendor Name" : "Client Name";

  // Filter & Search
  const filtered = useMemo(() => {
    let result = docs;
    if (statusFilter) {
      result = result.filter(
        (d) =>
          (d.status || "draft").toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        [getDocNo(d), getPartyName(d), d.notes, d.status].some(
          (val) => val && String(val).toLowerCase().includes(q),
        ),
      );
    }
    return result;
  }, [docs, search, statusFilter]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortField === "date") {
        valA = getDate(a);
        valB = getDate(b);
      } else if (sortField === "docNo") {
        valA = getDocNo(a);
        valB = getDocNo(b);
      } else if (sortField === "party") {
        valA = getPartyName(a);
        valB = getPartyName(b);
      } else if (sortField === "dueDate") {
        valA = getDueDate(a);
        valB = getDueDate(b);
      } else if (sortField === "tax") {
        valA = getTaxAmount(a);
        valB = getTaxAmount(b);
      } else if (sortField === "amount") {
        valA = getGrandTotal(a);
        valB = getGrandTotal(b);
      } else if (sortField === "balance") {
        valA = getBalanceDue(a);
        valB = getBalanceDue(b);
      } else {
        valA = getId(a);
        valB = getId(b);
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDocs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safeCurrentPage, pageSize]);

  // Calculate totals
  const pageTaxTotal = useMemo(
    () => paginatedDocs.reduce((sum, d) => sum + getTaxAmount(d), 0),
    [paginatedDocs],
  );
  const pageAmountTotal = useMemo(
    () => paginatedDocs.reduce((sum, d) => sum + getGrandTotal(d), 0),
    [paginatedDocs],
  );
  const pageBalanceTotal = useMemo(
    () => paginatedDocs.reduce((sum, d) => sum + getBalanceDue(d), 0),
    [paginatedDocs],
  );

  const grandTaxTotal = useMemo(
    () => sorted.reduce((sum, d) => sum + getTaxAmount(d), 0),
    [sorted],
  );
  const grandAmountTotal = useMemo(
    () => sorted.reduce((sum, d) => sum + getGrandTotal(d), 0),
    [sorted],
  );
  const grandBalanceTotal = useMemo(
    () => sorted.reduce((sum, d) => sum + getBalanceDue(d), 0),
    [sorted],
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedDocs.map((d) => String(getId(d)))));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (idStr: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idStr)) next.delete(idStr);
      else next.add(idStr);
      return next;
    });
  };

  const fmtCurrency = (num: number) => {
    return `₹ ${num.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  };

  const fmtTableDate = (d: string) => {
    if (!d) return "—";
    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return d;
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day} - ${month} - ${year}`;
    } catch {
      return d;
    }
  };

  const exportCsv = () => {
    const headers = [
      "Issue Date",
      "Doc No",
      "Status",
      partyLabel,
      "Due Date",
      "Tax",
      "Amount",
      "Balance",
      "Dr/Cr",
    ];
    const rows = sorted.map((d) => [
      fmtTableDate(getDate(d)),
      getDocNo(d),
      d.status || "draft",
      getPartyName(d),
      fmtTableDate(getDueDate(d)),
      getTaxAmount(d).toFixed(2),
      getGrandTotal(d).toFixed(2),
      getBalanceDue(d).toFixed(2),
      docType === "credit_note" ? "Cr" : "Dr",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${docType}_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minWidth: 0,
      }}
    >
      {previewDoc ? (
        <div
          style={{
            display: "flex",
            gap: "16px",
            minWidth: 0,
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Left Column: Condensed Document List matching SleekBill */}
          <div
            style={{
              width: "350px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: "var(--altrex-surface)",
              borderRadius: "8px",
              border: "1px solid var(--altrex-border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            {/* Top Toolbar for Condensed List */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom: "1px solid var(--altrex-border)",
                background: "var(--altrex-canvas)",
                gap: "8px",
              }}
            >
              <select
                className="altrex-input altrex-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: "32px",
                  fontSize: "12px",
                  width: "150px",
                  background: "var(--altrex-surface)",
                  color: "var(--altrex-text)",
                }}
              >
                <option value="">Filter {title}</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setActiveDoc(null);
                  setIsOpenForm(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "12px",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> + New
              </button>
            </div>

            {/* Condensed Cards List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--altrex-muted)",
                    fontSize: "13px",
                  }}
                >
                  Loading list...
                </div>
              ) : paginatedDocs.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--altrex-muted)",
                    fontSize: "13px",
                  }}
                >
                  No documents found.
                </div>
              ) : (
                paginatedDocs.map((d) => {
                  const idStr = String(getId(d));
                  const isSelected = String(getId(previewDoc)) === idStr;
                  const docNo = getDocNo(d);
                  const amount = getGrandTotal(d);
                  const dateStr = fmtTableDate(getDate(d));
                  const partyName = getPartyName(d);
                  const docTag =
                    docType === "credit_note"
                      ? "CN"
                      : docType === "debit_note"
                        ? "DN"
                        : docType === "sales_invoice"
                          ? "INV"
                          : docType === "purchase_invoice"
                            ? "BILL"
                            : "DOC";

                  return (
                    <div
                      key={idStr}
                      onClick={() => setPreviewDoc(d)}
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid var(--altrex-line)",
                        cursor: "pointer",
                        backgroundColor: isSelected
                          ? "color-mix(in srgb, var(--altrex-primary) 14%, var(--altrex-surface))"
                          : "transparent",
                        borderLeft: isSelected
                          ? "4px solid var(--altrex-primary)"
                          : "4px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Line 1: Party Name & Amount */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "12.5px",
                            color: "var(--altrex-text)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                          }}
                          title={partyName}
                        >
                          {partyName}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "12.5px",
                            color: "var(--altrex-text)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtCurrency(amount)}
                        </span>
                      </div>

                      {/* Line 2: Doc No & Date on left, Status Badge tag on right */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--altrex-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {docNo} {dateStr !== "—" ? `- ${dateStr}` : ""}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: isSelected
                              ? "#3b82f6"
                              : "var(--altrex-muted)",
                            background: isSelected
                              ? "rgba(59, 130, 246, 0.12)"
                              : "var(--altrex-canvas)",
                            padding: "1px 6px",
                            borderRadius: "3px",
                            border: "1px solid var(--altrex-border)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {docTag}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Left Column Pagination Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderTop: "1px solid var(--altrex-border)",
                background: "var(--altrex-canvas)",
                fontSize: "11.5px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  style={{
                    padding: "2px 8px",
                    fontSize: "12px",
                    border: "1px solid var(--altrex-border)",
                    background: "var(--altrex-surface)",
                    color: "var(--altrex-text)",
                    borderRadius: "4px",
                    cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                    opacity: safeCurrentPage === 1 ? 0.4 : 1,
                  }}
                >
                  &lt;
                </button>
                <span style={{ color: "var(--altrex-text)", fontWeight: 600 }}>
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  style={{
                    padding: "2px 8px",
                    fontSize: "12px",
                    border: "1px solid var(--altrex-border)",
                    background: "var(--altrex-surface)",
                    color: "var(--altrex-text)",
                    borderRadius: "4px",
                    cursor:
                      safeCurrentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                    opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                  }}
                >
                  &gt;
                </button>
              </div>

              <span style={{ color: "var(--altrex-muted)", fontSize: "11px" }}>
                Total: {sorted.length}
              </span>
            </div>
          </div>

          {/* Right Column: Inline Document Preview Pane */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <DocumentPreviewModal
              inline
              doc={previewDoc}
              docType={docType}
              onClose={() => setPreviewDoc(null)}
              onEdit={() => {
                setActiveDoc(previewDoc);
                setIsOpenForm(true);
              }}
              onDelete={() => {
                const idStr = String(getId(previewDoc));
                const docNo = getDocNo(previewDoc);
                if (confirm(`Delete document ${docNo}?`)) {
                  deleteDoc(idStr, {
                    onSuccess: () => setPreviewDoc(null),
                  });
                }
              }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Top Controls Toolbar matching user screenshot */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              background: "var(--altrex-surface)",
              padding: "12px 16px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid var(--altrex-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* Status Filter Dropdown */}
              <select
                className="altrex-input altrex-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "160px",
                  height: "36px",
                  fontSize: "13px",
                  background: "var(--altrex-canvas)",
                  color: "var(--altrex-text)",
                }}
              >
                <option value="">Filter {title}</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Search Box */}
              <div style={{ position: "relative", width: "240px" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--altrex-muted)",
                  }}
                />
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    paddingLeft: "32px",
                    height: "36px",
                    fontSize: "13px",
                    width: "100%",
                    background: "var(--altrex-canvas)",
                    color: "var(--altrex-text)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Green + New Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveDoc(null);
                  setIsOpenForm(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "7px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <Plus size={16} />
                New
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={exportCsv}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "var(--altrex-raised)",
                  color: "var(--altrex-text)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "7px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--altrex-border)",
                  cursor: "pointer",
                }}
              >
                Export
              </button>
            </div>
          </div>

          {/* Main Table Matching Screenshot */}
          <div
            style={{
              background: "var(--altrex-surface)",
              borderRadius: "8px",
              border: "1px solid var(--altrex-border)",
              overflowX: "auto",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12.5px",
                color: "var(--altrex-text)",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--altrex-raised)",
                    borderBottom: "1px solid var(--altrex-border)",
                    color: "var(--altrex-text)",
                  }}
                >
                  <th
                    style={{
                      padding: "10px 12px",
                      width: "36px",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        paginatedDocs.length > 0 &&
                        paginatedDocs.every((d) =>
                          selectedIds.has(String(getId(d))),
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Issue Date{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    onClick={() => handleSort("docNo")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Doc. No.{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("party")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {partyLabel}{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    onClick={() => handleSort("dueDate")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Due Date{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    onClick={() => handleSort("tax")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Tax{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Amount{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Date of Payment
                  </th>
                  <th
                    onClick={() => handleSort("balance")}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Balance{" "}
                    <ArrowUpDown
                      size={12}
                      style={{ display: "inline", marginLeft: "4px" }}
                    />
                  </th>
                  <th
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Dr/Cr
                  </th>
                  <th
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "var(--altrex-muted)",
                      }}
                    >
                      <span className="altrex-spinner" /> Loading documents...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "#ef4444",
                      }}
                    >
                      Failed to load documents from server.
                    </td>
                  </tr>
                ) : paginatedDocs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "var(--altrex-muted)",
                      }}
                    >
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map((doc) => {
                    const idStr = String(getId(doc));
                    const isSelected = selectedIds.has(idStr);
                    const docNo = getDocNo(doc);
                    const isApproved =
                      (doc.status || "draft") === "approved" ||
                      (doc.status || "draft") === "sent";

                    return (
                      <tr
                        key={idStr}
                        onClick={() => setPreviewDoc(doc)}
                        style={{
                          borderBottom: "1px solid var(--altrex-line)",
                          backgroundColor: isSelected
                            ? "color-mix(in srgb, var(--altrex-primary) 10%, transparent)"
                            : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <td
                          style={{ padding: "10px 12px", textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRow(idStr);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            color: "var(--altrex-muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtTableDate(getDate(doc))}
                        </td>
                        <td
                          style={{ padding: "10px 12px", whiteSpace: "nowrap" }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDoc(doc);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--altrex-link)",
                              fontWeight: 600,
                              cursor: "pointer",
                              padding: 0,
                              textDecoration: "none",
                            }}
                          >
                            {docNo}
                          </button>
                        </td>
                        <td
                          style={{ padding: "10px 12px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              title={isApproved ? "Sent" : "Not Sent"}
                              style={{ display: "inline-flex" }}
                            >
                              <Mail
                                size={14}
                                style={{
                                  color: isApproved ? "#10b981" : "#ef4444",
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                            <span
                              title={isApproved ? "Paid / Approved" : "Unpaid"}
                              style={{ display: "inline-flex" }}
                            >
                              <CreditCard
                                size={14}
                                style={{
                                  color: isApproved ? "#10b981" : "#ef4444",
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            color: "var(--altrex-text)",
                            maxWidth: "200px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={getPartyName(doc)}
                          >
                            {getPartyName(doc)}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            color: "var(--altrex-muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtTableDate(getDueDate(doc))}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtCurrency(getTaxAmount(doc))}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtCurrency(getGrandTotal(doc))}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            color: "var(--altrex-muted)",
                          }}
                        >
                          {doc.payment_date
                            ? fmtTableDate(doc.payment_date)
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtCurrency(getBalanceDue(doc))}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            color: "var(--altrex-muted)",
                          }}
                        >
                          {docType === "credit_note" ? "Cr" : "Dr"}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDoc(doc);
                                setIsOpenForm(true);
                              }}
                              style={{
                                background: "var(--altrex-raised)",
                                color: "var(--altrex-text)",
                                border: "1px solid var(--altrex-border)",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "11.5px",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                printDocument(doc, docType);
                              }}
                              style={{
                                background: "var(--altrex-raised)",
                                color: "var(--altrex-text)",
                                border: "1px solid var(--altrex-border)",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "11.5px",
                                cursor: "pointer",
                              }}
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete document ${docNo}?`)) {
                                  deleteDoc(idStr);
                                }
                              }}
                              disabled={isDeleting}
                              style={{
                                background: "rgba(220, 38, 38, 0.08)",
                                color: "#dc2626",
                                border: "1px solid rgba(220, 38, 38, 0.2)",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                fontSize: "11.5px",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Footer Totals Row matching Screenshot */}
              <tfoot
                style={{
                  background: "var(--altrex-raised)",
                  fontWeight: 700,
                  borderTop: "2px solid var(--altrex-border)",
                  color: "var(--altrex-text)",
                }}
              >
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "10px 12px",
                      color: "var(--altrex-text)",
                    }}
                  >
                    Totals on page
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtCurrency(pageTaxTotal)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtCurrency(pageAmountTotal)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    —
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtCurrency(pageBalanceTotal)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {docType === "credit_note" ? "Cr" : "Dr"}
                  </td>
                  <td />
                </tr>
                <tr style={{ borderTop: "1px solid var(--altrex-line)" }}>
                  <td
                    colSpan={6}
                    style={{
                      padding: "10px 12px",
                      color: "var(--altrex-text)",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtCurrency(grandTaxTotal)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtCurrency(grandAmountTotal)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    —
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtCurrency(grandBalanceTotal)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {docType === "credit_note" ? "Cr" : "Dr"}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination Controls Footer matching Screenshot */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "8px 4px",
            }}
          >
            {/* Page Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--altrex-border)",
                  background: "var(--altrex-surface)",
                  color: "var(--altrex-text)",
                  borderRadius: "4px",
                  cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                  opacity: safeCurrentPage === 1 ? 0.4 : 1,
                }}
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--altrex-border)",
                  background: "var(--altrex-surface)",
                  color: "var(--altrex-text)",
                  borderRadius: "4px",
                  cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                  opacity: safeCurrentPage === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - safeCurrentPage) <= 2,
                )
                .map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    style={{
                      padding: "4px 10px",
                      fontSize: "12.5px",
                      fontWeight: p === safeCurrentPage ? 700 : 500,
                      border: "1px solid var(--altrex-border)",
                      background:
                        p === safeCurrentPage
                          ? "var(--altrex-primary)"
                          : "var(--altrex-surface)",
                      color:
                        p === safeCurrentPage
                          ? "#ffffff"
                          : "var(--altrex-text)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--altrex-border)",
                  background: "var(--altrex-surface)",
                  color: "var(--altrex-text)",
                  borderRadius: "4px",
                  cursor:
                    safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--altrex-border)",
                  background: "var(--altrex-surface)",
                  color: "var(--altrex-text)",
                  borderRadius: "4px",
                  cursor:
                    safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronsRight size={14} />
              </button>
            </div>

            {/* Page Size Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                className="altrex-input altrex-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  height: "32px",
                  fontSize: "12.5px",
                  width: "120px",
                  background: "var(--altrex-surface)",
                  color: "var(--altrex-text)",
                  border: "1px solid var(--altrex-border)",
                }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </>
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
    </div>
  );
}
