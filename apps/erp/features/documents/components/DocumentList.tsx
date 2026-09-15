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
    refLabel: string;
    dateKey: string;
  }
> = {
  quotation:        { endpoint: endpoints.documents.quotationDetail,       keys: ["quotation", "quotations"],         label: "QUOTE",            refLabel: "Quote #",         dateKey: "quotation_date",      itemIdKey: "quotation_item_id",       taxRefKey: "quotation_item_id" },
  sales_order:      { endpoint: endpoints.documents.salesOrderDetail,      keys: ["sales_order", "salesOrders"],      label: "SALES ORDER",      refLabel: "Order #",         dateKey: "sales_order_date",    itemIdKey: "sales_order_item_id",     taxRefKey: "sales_order_item_id" },
  proforma:         { endpoint: endpoints.documents.proformaDetail,        keys: ["proforma"],                        label: "PROFORMA INVOICE",  refLabel: "Proforma #",      dateKey: "proforma_date",       itemIdKey: "proforma_item_id",        taxRefKey: "proforma_item_id" },
  delivery_challan: { endpoint: endpoints.documents.deliveryChallanDetail, keys: ["delivery_challan"],                label: "DELIVERY CHALLAN",  refLabel: "Challan #",       dateKey: "delivery_date",       itemIdKey: "delivery_challan_item_id",taxRefKey: "delivery_challan_item_id" },
  sales_invoice:    { endpoint: endpoints.documents.invoiceDetail,         keys: ["invoice"],                         label: "TAX INVOICE",      refLabel: "Invoice #",       dateKey: "invoice_date",        itemIdKey: "invoice_item_id",         taxRefKey: "invoice_item_id" },
  purchase_order:   { endpoint: endpoints.documents.purchaseOrderDetail,   keys: ["purchase_order"],                  label: "PURCHASE ORDER",   refLabel: "PO #",            dateKey: "purchase_order_date", itemIdKey: "purchase_order_item_id",  taxRefKey: "purchase_order_item_id" },
  purchase_invoice: { endpoint: endpoints.documents.purchaseInvoiceDetail, keys: ["purchase_invoice"],                label: "PURCHASE INVOICE", refLabel: "Bill #",          dateKey: "purchase_invoice_date",itemIdKey: "purchase_invoice_item_id",taxRefKey: "purchase_invoice_item_id" },
  credit_note:      { endpoint: endpoints.documents.creditNoteDetail,      keys: ["credit_note"],                     label: "CREDIT NOTE",      refLabel: "Credit Note #",   dateKey: "credit_note_date",    itemIdKey: "credit_note_item_id",     taxRefKey: "credit_note_item_id" },
  debit_note:       { endpoint: endpoints.documents.debitNoteDetail,       keys: ["debit_note"],                      label: "DEBIT NOTE",       refLabel: "Debit Note #",    dateKey: "debit_note_date",     itemIdKey: "debit_note_item_id",      taxRefKey: "debit_note_item_id" },
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
    document.quotation_id ?? document.sales_order_id ?? document.proforma_id ??
    document.delivery_challan_id ?? document.invoice_id ?? document.purchase_order_id ??
    document.purchase_invoice_id ?? document.credit_note_id ?? document.debit_note_id ??
    document.id ?? "document";
  const partyId = document.party_id ?? document.customer_id ?? document.vendor_id;
  const [detail, profile, customer, uom, taxes, banks, cities, states, countries] = await Promise.all([
    apiClient.get<any>(config.endpoint(documentId)).catch(() => document),
    apiClient.get<any>(endpoints.auth.profile).catch(() => ({})),
    partyId != null
      ? apiClient.get<any>(endpoints.party.customer(partyId)).catch(() =>
          apiClient.get<any>(endpoints.party.vendor(partyId)).catch(() => ({}))
        )
      : Promise.resolve({}),
    apiClient.get<any>(endpoints.masters.uom).catch(() => []),
    apiClient.get<any>(endpoints.masters.taxTypes).catch(() => []),
    apiClient.get<any>(endpoints.masters.bank).catch(() => []),
    apiClient.get<any>(endpoints.masters.city).catch(() => []),
    apiClient.get<any>(endpoints.masters.state).catch(() => []),
    apiClient.get<any>(endpoints.masters.country).catch(() => []),
  ]);

  const quotation = extractList(detail, config.keys.concat(["data"]))[0] ?? detail ?? document;

  // Profile API returns { profile_details: {...}, bank_details: {...} } envelope layout
  const profileObj = (profile as any)?.data ?? (profile as any)?.profile ?? (profile as any)?.result ?? profile;
  const profileDetails = profileObj?.profile_details ?? profileObj?.company ?? profileObj?.profile ?? profileObj?.data ?? (profileObj?.company_name ? profileObj : {});
  const bankDetails = profileObj?.bank_details ?? profileObj?.bank ?? (profileObj?.account_no ? profileObj : {});
  const company: any = {
    ...profileDetails,
    ...bankDetails,
    bank_id: bankDetails?.bank_id ?? profileDetails?.bank_id ?? null,
  };

  // Customer API returns { customers: [...] } — pull first element
  const customerList = extractList(customer, ["customers", "vendors", "parties", "customer", "vendor", "data", "rows"]);
  const customerData: any = customerList.length > 0 ? customerList[0] : (extractObject(customer, ["customer", "party", "data", "result", "payload"]) ?? {});

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

  const date = quotation[config.dateKey] ?? quotation.debit_date ?? quotation.debit_note_date ??
    quotation.credit_date ?? quotation.credit_note_date ?? quotation.quotation_date ??
    quotation.sales_order_date ?? quotation.invoice_date ?? quotation.delivery_date ?? quotation.created_at ?? "";
  const validUntil = quotation.valid_until ?? quotation.due_date ?? "";
  const docRefNo = quotation.quotation_no ?? quotation.sales_order_no ?? quotation.proforma_no ??
    quotation.invoice_no ?? quotation.purchase_order_no ?? quotation.purchase_invoice_no ??
    quotation.credit_note_no ?? quotation.debit_note_no ?? quotation.doc_no ?? `#${documentId}`;

  const customerName =
    customerData.party_name ??
    customerData.company_name ??
    customerData.customer_name ??
    customerData.name ??
    quotation.party_name ??
    quotation.company_name ??
    "N/A";

  const lookup = (list: any[], id: any) =>
    list.find((entry) => String(entry.unit_id ?? entry.tax_id ?? entry.bank_id ?? entry.city_id ?? entry.state_id ?? entry.country_id ?? entry.id) === String(id)) ?? {};
  const money = (value: any) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => { try { return d ? new Date(d).toLocaleDateString("en-IN") : ""; } catch { return d ?? ""; } };

  const rows = items.map((item: any, index: number) => {
    const quantity = Number(item.quantity || 0);
    const rate = Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0);
    const flatDiscount = Number(item.discount_flat ?? 0);
    const pctDiscount = Number(item.discount_percent ?? 0);
    const grossRate = item.total_rate != null ? Number(item.total_rate) : quantity * rate;
    const taxable = item.taxable_value != null
      ? Number(item.taxable_value)
      : (item.total_rate != null && (flatDiscount > 0 || pctDiscount > 0))
      ? (grossRate - (flatDiscount || (grossRate * (pctDiscount / 100))))
      : (item.total_amount != null && item.tax_amount != null)
      ? (Number(item.total_amount) - Number(item.tax_amount))
      : (grossRate - (flatDiscount || (grossRate * (pctDiscount / 100))));

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
    const igst = itemTaxes.find((tax: any) => /igst/i.test(taxName(tax)));
    const itemTaxSum = itemTaxes.length > 0
      ? itemTaxes.reduce((sum: number, t: any) => sum + Number(t.tax_amount || 0), 0)
      : Number(item.tax_amount || 0);

    const cgstAmt = cgst ? Number(cgst.tax_amount) : (igst ? Number(igst.tax_amount) : (itemTaxes.length === 1 ? Number(itemTaxes[0].tax_amount) : (itemTaxSum > 0 && !sgst ? itemTaxSum / 2 : 0)));
    const sgstAmt = sgst ? Number(sgst.tax_amount) : (itemTaxes.length > 1 ? Number(itemTaxes[1].tax_amount) : (itemTaxSum > 0 && !cgst && !igst ? itemTaxSum / 2 : 0));

    const lineTotal = item.total_amount != null ? Number(item.total_amount) : (taxable + itemTaxSum);
    const uomStr = escapeHtml(unit.unit_code ?? unit.unit_name ?? item.unit_name ?? "NOS");
    return `<tr>
      <td class="center">${index + 1}</td>
      <td><strong>${escapeHtml(item.item_name ?? item.description ?? "Line item")}</strong>${item.item_name && item.description ? `<br><span style="color:#64748b;font-size:8.5px">${escapeHtml(item.description)}</span>` : ""}</td>
      <td class="center">${escapeHtml(item.hsn_code ?? "")}</td>
      <td class="center">${quantity}<br><span style="font-size:7.5px;color:#475569">${uomStr}</span></td>
      <td class="num">${money(rate)}</td>
      <td class="num">${money(taxable)}</td>
      <td class="num">${money(cgstAmt)}</td>
      <td class="num">${money(sgstAmt)}</td>
      <td class="num">${money(lineTotal)}</td>
    </tr>`;
  }).join("");

  const allTaxDetails = Array.isArray(quotation.taxDetails) ? quotation.taxDetails : [];
  const subtotalAmount = quotation.subtotal_amount != null
    ? Number(quotation.subtotal_amount)
    : items.reduce((sum: number, item: any) => sum + Number(item.total_rate ?? (Number(item.quantity || 0) * Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0))), 0);
  
  const discountValue = quotation.discount_value != null
    ? Number(quotation.discount_value)
    : items.reduce((sum: number, item: any) => sum + Number(item.discount_flat ?? ((Number(item.quantity || 0) * Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0)) * (Number(item.discount_percent || 0) / 100))), 0);

  const taxableTotal = (quotation.subtotal_amount != null && quotation.discount_value != null)
    ? (Number(quotation.subtotal_amount) - Number(quotation.discount_value))
    : items.reduce((sum: number, item: any) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0);
        const gross = Number(item.total_rate ?? (qty * rate));
        const disc = Number(item.discount_flat ?? (gross * (Number(item.discount_percent || 0) / 100)));
        if (item.taxable_value != null) return sum + Number(item.taxable_value);
        if (item.total_amount != null && item.tax_amount != null) return sum + (Number(item.total_amount) - Number(item.tax_amount));
        return sum + (gross - disc);
      }, 0);

  const cgstTotal = allTaxDetails.filter((tax: any) => /cgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "")).reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);
  const sgstTotal = allTaxDetails.filter((tax: any) => /sgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "")).reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);
  const igstTotal = allTaxDetails.filter((tax: any) => /igst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? "")).reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);

  const itemTaxTotal = items.reduce((sum: number, item: any) => sum + Number(item.tax_amount || 0), 0);
  const totalTaxAmount = quotation.total_tax_amount != null
    ? Number(quotation.total_tax_amount)
    : (cgstTotal + sgstTotal + igstTotal || itemTaxTotal);

  const roundOff = Number(quotation.round_off || 0);
  const total = quotation.total_amount != null ? Number(quotation.total_amount) : (taxableTotal + totalTaxAmount + roundOff);
  const words = `${numberToWordsIndian(Math.round(total))} Only`;
  const terms = String(quotation.terms_conditions ?? "").split(/\r?\n/).filter(Boolean);
  const hasTerms = terms.length > 0;

  const addresses = Array.isArray(customerData.addresses) ? customerData.addresses : [];
  const billingAddress = addresses.find((a: any) => ["billing", "both"].includes(a.address_type)) ?? addresses[0] ?? {};
  const shippingAddress = addresses.find((a: any) => ["shipping", "both"].includes(a.address_type)) ?? billingAddress;

  const contactPersons: any[] = Array.isArray(customerData.contactpersons) ? customerData.contactpersons : [];
  const primaryContact = contactPersons[0] ?? null;

  const bank = lookup(bankRows, company.bank_id);

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
    const attention = addr.attention_to ?? addr.contact_name ?? primaryContact?.name ?? "";
    const addrPhone = addr.phone ?? customerData.phone ?? primaryContact?.phone ?? "";
    const addrStr = addressText(addr);
    return `<div>
      <div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px">${escapeHtml(title)}</div>
      <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:2px">${escapeHtml(customerName)}</div>
      ${attention ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">${escapeHtml(attention)}</p>` : ""}
      ${addrStr ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">${escapeHtml(addrStr)}</p>` : ""}
      ${addrPhone ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">Ph: ${escapeHtml(addrPhone)}</p>` : ""}
      ${customerData.gst_no ? `<p style="margin:1px 0;color:#475569;font-size:9.5px">GSTIN: ${escapeHtml(customerData.gst_no)}</p>` : ""}
    </div>`;
  };

  popup.document.open();
  popup.document.write(`<!doctype html>
<html><head><title>${escapeHtml(config.label)} #${escapeHtml(String(documentId))}</title>
<style>
  @page { size: A4 portrait; margin: 5px; }
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
  .page { position: relative; padding: 10px; width: 100%; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  p { margin: 1px 0; line-height: 1.3; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 14px; }
  table.items-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9px; }
  table.items-table th { background-color: #2b5b84 !important; color: #ffffff !important; font-weight: 700; text-transform: uppercase; padding: 6px 4px; border: 1px solid #2b5b84; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  table.items-table td { border: 1px solid #cbd5e1; padding: 5px 6px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .center { text-align: center; }
  .total-row td { font-weight: 700; background-color: #f8fafc !important; border-top: 2px solid #2b5b84; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px; gap: 20px; }
  .bank-box { font-size: 9.5px; color: #334155; line-height: 1.5; }
  .totals-box { text-align: right; font-size: 10px; line-height: 1.6; }
  .terms-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; pt: 10px; border-top: 1px solid #e2e8f0; }
  .terms-box { max-width: 65%; font-size: 9px; color: #334155; }
  .terms-box ol { margin: 4px 0 0 14px; padding: 0; }
  .terms-box li { margin-bottom: 3px; font-style: italic; }
  .sig-box { text-align: right; width: 30%; }
</style></head><body>
<section class="page">
  <header>
    <div style="max-width:58%">
      ${company.logo ? `<img src="${company.logo}" style="max-height:55px;max-width:220px;object-fit:contain;margin-bottom:4px"><br>` : ""}
      <div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:2px">${escapeHtml(company.company_name ?? "Company Name")}</div>
      ${companyAddressText() ? `<p style="color:#475569">${escapeHtml(companyAddressText())}</p>` : ""}
      ${company.phone ? `<p style="color:#475569">+91${escapeHtml(company.phone.replace(/^(\+91|91)/, ""))}</p>` : ""}
      ${company.email ? `<p style="color:#475569">${escapeHtml(company.email)}</p>` : ""}
      <p style="color:#475569"><strong>GSTIN:</strong> ${escapeHtml(company.gst_no ?? "N/A")} ${company.website ? `&nbsp;<strong>Website:</strong> ${escapeHtml(company.website)}` : ""}</p>
      ${company.contact_name ? `<p style="color:#475569"><strong>Contact Name:</strong> ${escapeHtml(company.contact_name)}</p>` : ""}
    </div>

    <div style="width:38%;text-align:right">
      <div style="font-size:22px;font-weight:700;color:#0f172a;letter-spacing:0.5px">${config.label}</div>
      <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:8px">${escapeHtml(docRefNo)}</div>
      
      <div style="background-color:#2b5b84!important;color:#ffffff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;padding:6px 12px;display:flex;justify-content:space-between;align-items:center;border-radius:2px;margin-bottom:8px">
        <span style="font-size:11px;font-weight:600">Amount Due:</span>
        <span style="font-size:14px;font-weight:700">INR ${money(total)}</span>
      </div>

      <div style="font-size:9.5px;color:#334155;line-height:1.5">
        <div><strong>Issue Date:</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${escapeHtml(fmtDate(date))}</div>
        ${validUntil ? `<div><strong>Valid Until:</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${escapeHtml(fmtDate(validUntil))}</div>` : ""}
      </div>
    </div>
  </header>

  <div class="grid">
    ${partyBoxHtml(docType === "purchase_order" || docType === "purchase_invoice" ? "Bill To" : "Quote To", billingAddress)}
    ${partyBoxHtml(docType === "delivery_challan" ? "Deliver To" : "Ship To", shippingAddress)}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:4%">S.No</th>
        <th style="width:28%">Item Description</th>
        <th style="width:10%">HSN/SAC</th>
        <th style="width:8%">Qty<br><span style="font-size:7.5px;font-weight:400">UoM</span></th>
        <th style="width:11%">Price<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:12%">Taxable Value<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:9%">CGST<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:9%">SGST<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
        <th style="width:12%">Amount<br><span style="font-size:7.5px;font-weight:400">(INR)</span></th>
      </tr>
    </thead>
    <tbody>
      ${rows || "<tr><td colspan=\"9\" class=\"center\">No line items</td></tr>"}
      <tr class="total-row">
        <td colspan="5" style="text-align:right">Total ${cgstTotal || sgstTotal || igstTotal ? `@18%` : ""}</td>
        <td class="num">${money(taxableTotal)}</td>
        <td class="num">${money(cgstTotal)}</td>
        <td class="num">${money(sgstTotal)}</td>
        <td class="num">${money(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="summary-section">
    <div class="bank-box">
      <div><strong>Bank Name:</strong> ${escapeHtml(bank.bank_name ?? bank.name ?? company.bank_name ?? "N/A")}</div>
      <div><strong>Account Number:</strong> ${escapeHtml(company.account_no ?? "N/A")}</div>
      <div><strong>Branch Name:</strong> ${escapeHtml(company.branch_name ?? "N/A")}</div>
      <div><strong>IFSC Code:</strong> ${escapeHtml(company.ifsc_code ?? "N/A")}</div>
    </div>

    <div class="totals-box">
      ${subtotalAmount > 0 && discountValue > 0 ? `<div><strong>Subtotal:</strong> &nbsp;&nbsp; INR ${money(subtotalAmount)}</div>` : ""}
      ${discountValue > 0 ? `<div><strong>Discount:</strong> &nbsp;&nbsp; - INR ${money(discountValue)}</div>` : ""}
      <div><strong>Total Taxable Value:</strong> &nbsp;&nbsp; INR ${money(taxableTotal)}</div>
      ${totalTaxAmount > 0 ? `<div><strong>Total Tax:</strong> &nbsp;&nbsp; INR ${money(totalTaxAmount)}</div>` : ""}
      ${roundOff !== 0 ? `<div><strong>Round Off:</strong> &nbsp;&nbsp; INR ${money(roundOff)}</div>` : ""}
      <div><strong>Total Value (in figure):</strong> &nbsp;&nbsp; INR ${money(total)}</div>
      <div><strong>Total Value (in words):</strong> &nbsp;&nbsp; <strong>INR ${escapeHtml(words)}</strong></div>
    </div>
  </div>

  <div class="terms-section">
    <div class="terms-box">
      <div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:4px">Terms &amp; Conditions</div>
      ${hasTerms ? `<ol>${terms.map((t) => `<li>${escapeHtml(t.replace(/^\d+[.)]\s*/, ""))}</li>`).join("")}</ol>` : "<p style=\"font-style:italic\">Standard commercial terms apply.</p>"}
    </div>

    <div class="sig-box">
      ${company.authorized_signature ? `<img src="${company.authorized_signature}" style="max-height:45px;object-fit:contain;margin-bottom:4px"><br>` : ""}
      <div style="border-top:1px solid #cbd5e1;padding-top:4px;font-size:10px;font-weight:700;color:#0f172a">Provider Signature</div>
    </div>
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
              aria-label={`Edit document #DOC-${id}`}
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
              aria-label={`Print or view PDF for document #DOC-${id}`}
              onClick={() => printDocument(d, docType)}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              aria-label={`Delete document #DOC-${id}`}
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
