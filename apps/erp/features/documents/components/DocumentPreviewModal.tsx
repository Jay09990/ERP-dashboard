"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Edit, FileText, Printer, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DOCUMENT_PRINT_CONFIG, numberToWordsIndian } from "./DocumentList";
import type { DocumentType } from "./DocumentForm";

function extractList(value: any, keys: string[]): any[] {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  for (const key of ["data", "result", "payload", "response", "Invoices", "Quotations", "SalesOrders", "PurchaseOrders", "CreditNotes", "DebitNotes", "PurchaseInvoices", "DeliveryChallans", "items", "rows", "records"]) {
    if (value?.[key] && value[key] !== value) {
      const nested = extractList(value[key], keys);
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

interface DocumentPreviewModalProps {
  doc?: any;
  document?: any;
  docType: DocumentType;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  inline?: boolean;
}

export function DocumentPreviewModal({
  doc,
  document: propDoc,
  docType,
  onClose,
  onEdit,
  onDelete,
  inline = false,
}: DocumentPreviewModalProps) {
  const docSummary = doc || propDoc || {};
  const isVendorDoc = docType === "purchase_order" || docType === "purchase_invoice" || docType === "debit_note";
  const [detail, setDetail] = useState<any>(docSummary);
  const [company, setCompany] = useState<any>({});
  const [customerData, setCustomerData] = useState<any>({});
  const [units, setUnits] = useState<any[]>([]);
  const [taxRows, setTaxRows] = useState<any[]>([]);
  const [bankRows, setBankRows] = useState<any[]>([]);
  const [cityRows, setCityRows] = useState<any[]>([]);
  const [stateRows, setStateRows] = useState<any[]>([]);
  const [countryRows, setCountryRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config = DOCUMENT_PRINT_CONFIG[docType];

  useEffect(() => {
    let isMounted = true;
    const documentId =
      docSummary.quotation_id ??
      docSummary.sales_order_id ??
      docSummary.proforma_id ??
      docSummary.delivery_challan_id ??
      docSummary.invoice_id ??
      docSummary.purchase_order_id ??
      docSummary.purchase_invoice_id ??
      docSummary.credit_note_id ??
      docSummary.debit_note_id ??
      docSummary.id;

    async function loadData() {
      setIsLoading(true);
      try {
        const detRes = documentId != null
          ? await apiClient.get<any>(config.endpoint(documentId)).catch(() => docSummary)
          : docSummary;

        const docDetail = extractList(detRes, config.keys.concat(["data", "Invoices", "Quotations", "SalesOrders", "PurchaseOrders", "CreditNotes", "DebitNotes", "rows", "records", "items"]))[0] ?? (detRes && !detRes.message && typeof detRes === "object" ? detRes : docSummary);

        const partyId = docSummary.party_id ?? docSummary.customer_id ?? docSummary.vendor_id ?? docDetail.party_id ?? docDetail.customer_id ?? docDetail.vendor_id;

        const [profRes, custRes, uomRes, taxRes, bankRes, cityRes, stateRes, countryRes] =
          await Promise.all([
            apiClient.get<any>(endpoints.auth.profile).catch(() => ({})),
            partyId != null
              ? apiClient.get<any>(endpoints.party.customer(partyId)).catch(() =>
                  apiClient.get<any>(endpoints.party.vendor(partyId)).catch(() => ({})),
                )
              : Promise.resolve({}),
            apiClient.get<any>(endpoints.masters.uom).catch(() => []),
            apiClient.get<any>(endpoints.masters.taxTypes).catch(() => []),
            apiClient.get<any>(endpoints.masters.bank).catch(() => []),
            apiClient.get<any>(endpoints.masters.city).catch(() => []),
            apiClient.get<any>(endpoints.masters.state).catch(() => []),
            apiClient.get<any>(endpoints.masters.country).catch(() => []),
          ]);

        if (!isMounted) return;

        setDetail(docDetail);

        const profileObj = (profRes as any)?.data ?? (profRes as any)?.profile ?? (profRes as any)?.result ?? profRes;
        const profileDetails = profileObj?.profile_details ?? profileObj?.company ?? profileObj?.profile ?? profileObj?.data ?? (profileObj?.company_name ? profileObj : {});
        const bankDetails = profileObj?.bank_details ?? profileObj?.bank ?? (profileObj?.account_no ? profileObj : {});
        setCompany({
          ...profileDetails,
          ...bankDetails,
          bank_id: bankDetails?.bank_id ?? profileDetails?.bank_id ?? null,
        });

        const customerList = extractList(custRes, ["customers", "vendors", "parties", "customer", "vendor", "data", "rows"]);
        setCustomerData(customerList.length > 0 ? customerList[0] : (extractObject(custRes, ["customer", "party", "vendor", "data", "result", "payload"]) ?? {}));

        setUnits(extractList(uomRes, ["units", "data", "rows"]));
        setTaxRows(extractList(taxRes, ["taxes", "taxTypes", "data", "rows"]));
        setBankRows(extractList(bankRes, ["banks", "data", "rows"]));
        setCityRows(extractList(cityRes, ["cities", "data", "rows"]));
        setStateRows(extractList(stateRes, ["states", "data", "rows"]));
        setCountryRows(extractList(countryRes, ["countries", "data", "rows"]));
      } catch (err) {
        console.error("Preview load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [docSummary, docType]);

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

  const money = (val: any) =>
    Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

  const fmtDate = (d: string) => {
    try {
      return d ? new Date(d).toLocaleDateString("en-GB").replace(/\//g, " - ") : "";
    } catch {
      return d ?? "";
    }
  };

  const documentId =
    detail.quotation_id ??
    detail.sales_order_id ??
    detail.proforma_id ??
    detail.delivery_challan_id ??
    detail.invoice_id ??
    detail.purchase_order_id ??
    detail.purchase_invoice_id ??
    detail.credit_note_id ??
    detail.debit_note_id ??
    detail.id ??
    docSummary.quotation_id ??
    docSummary.invoice_id ??
    docSummary.id;

  const docRefNo =
    detail.quotation_no ??
    detail.sales_order_no ??
    detail.proforma_no ??
    detail.invoice_no ??
    detail.purchase_order_no ??
    detail.purchase_invoice_no ??
    detail.pi_no ??
    detail.credit_note_no ??
    detail.debit_note_no ??
    detail.doc_no ??
    docSummary.quotation_no ??
    docSummary.invoice_no ??
    docSummary.pi_no ??
    docSummary.credit_note_no ??
    docSummary.debit_note_no ??
    `#${documentId}`;

  const date =
    detail[config.dateKey] ??
    detail.debit_date ??
    detail.debit_note_date ??
    detail.credit_date ??
    detail.credit_note_date ??
    detail.quotation_date ??
    detail.sales_order_date ??
    detail.invoice_date ??
    detail.delivery_date ??
    detail.created_at ??
    docSummary[config.dateKey] ??
    docSummary.invoice_date ??
    docSummary.created_at ??
    "";

  const validUntil =
    detail.valid_until ??
    detail.due_date ??
    detail.shipping_date ??
    detail.expected_delivery_date ??
    docSummary.due_date ??
    "";

  const items = Array.isArray(detail.itemsDetails) && detail.itemsDetails.length > 0
    ? detail.itemsDetails
    : Array.isArray(detail.items) && detail.items.length > 0
    ? detail.items
    : Array.isArray(docSummary.itemsDetails)
    ? docSummary.itemsDetails
    : Array.isArray(docSummary.items)
    ? docSummary.items
    : [];

  const allTaxDetails = Array.isArray(detail.taxDetails)
    ? detail.taxDetails
    : Array.isArray(docSummary.taxDetails)
    ? docSummary.taxDetails
    : [];

  const customerName =
    customerData.party_name ??
    customerData.company_name ??
    customerData.customer_name ??
    customerData.name ??
    detail.party_name ??
    detail.company_name ??
    detail.customer_name ??
    docSummary.party_name ??
    docSummary.company_name ??
    "N/A";

  const addresses = Array.isArray(customerData.addresses) ? customerData.addresses : [];
  const billingAddress =
    addresses.find((a: any) => ["billing", "both"].includes(a.address_type)) ?? addresses[0] ?? {};
  const shippingAddress =
    addresses.find((a: any) => ["shipping", "both"].includes(a.address_type)) ?? billingAddress;

  const contactPersons: any[] = Array.isArray(customerData.contactpersons) ? customerData.contactpersons : [];
  const primaryContact = contactPersons[0] ?? null;

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

  const placeOfSupply = () => {
    const stateObj = lookup(stateRows, billingAddress.state_id ?? company.state_id);
    const code = stateObj.state_code ?? stateObj.code ?? "GJ (24)";
    const name = stateObj.state_name ?? stateObj.name ?? "Gujarat";
    return `${name} (${code.replace(/^(GJ|IN-)?/i, "")})`;
  };

  const hasDiscountInItems = items.some(
    (item: any) => Number(item.discount_flat || 0) > 0 || Number(item.discount_percent || 0) > 0,
  );

  const discountValue = detail.discount_value != null
    ? Number(detail.discount_value)
    : items.reduce(
        (sum: number, item: any) =>
          sum +
          Number(
            item.discount_flat ??
              (Number(item.quantity || 0) * Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0)) *
                (Number(item.discount_percent || 0) / 100),
          ),
        0,
      );

  const taxableTotal = (detail.subtotal_amount != null && detail.discount_value != null)
    ? (Number(detail.subtotal_amount) - Number(detail.discount_value))
    : items.reduce((sum: number, item: any) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0);
        const gross = Number(item.total_rate ?? (qty * rate));
        const disc = Number(item.discount_flat ?? (gross * (Number(item.discount_percent || 0) / 100)));
        if (item.taxable_value != null) return sum + Number(item.taxable_value);
        if (item.total_amount != null && item.tax_amount != null) return sum + (Number(item.total_amount) - Number(item.tax_amount));
        return sum + (gross - disc);
      }, 0);

  const cgstTotal = allTaxDetails
    .filter((tax: any) => /cgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? ""))
    .reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);

  const sgstTotal = allTaxDetails
    .filter((tax: any) => /sgst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? ""))
    .reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);

  const igstTotal = allTaxDetails
    .filter((tax: any) => /igst/i.test(tax.tax_name ?? lookup(taxRows, tax.tax_id).tax_name ?? ""))
    .reduce((sum: number, tax: any) => sum + Number(tax.tax_amount || 0), 0);

  const itemTaxTotal = items.reduce((sum: number, item: any) => sum + Number(item.tax_amount || 0), 0);
  const totalTaxAmount = detail.total_tax_amount != null
    ? Number(detail.total_tax_amount)
    : (cgstTotal + sgstTotal + igstTotal || itemTaxTotal);

  const roundOff = Number(detail.round_off || docSummary.round_off || 0);
  const total = detail.total_amount != null ? Number(detail.total_amount) : (taxableTotal + totalTaxAmount + roundOff);
  const words = `${numberToWordsIndian(Math.round(total))} Only`;

  const bank = lookup(bankRows, company.bank_id);
  const terms = String(detail.terms_conditions ?? docSummary.terms_conditions ?? "").split(/\r?\n/).filter(Boolean);
  const hasTerms = terms.length > 0;

  const isCreditNote = docType === "credit_note";
  const isDebitNote = docType === "debit_note";
  const isDeliveryChallan = docType === "delivery_challan";
  const isApproved = (detail.status || "draft") === "approved" || (detail.status || "draft") === "sent";

  const renderPaperCard = () => (
    <div
      style={{
        width: "100%",
        maxWidth: "820px",
        background: "#ffffff",
        color: "#1e293b",
        padding: "32px",
        borderRadius: "4px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        position: "relative",
        fontSize: "11px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Status Ribbon if Approved */}
      {isApproved && (
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "-32px",
            background: "#10b981",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            padding: "4px 36px",
            transform: "rotate(-45deg)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            letterSpacing: "1px",
          }}
        >
          Approved
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ maxWidth: "56%" }}>
          {company.logo && (
            <img
              src={company.logo}
              alt="Company Logo"
              style={{ maxHeight: "55px", maxWidth: "200px", objectFit: "contain", marginBottom: "6px" }}
            />
          )}
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "3px" }}>
            {company.company_name ?? "Teton Projects PVT LTD"}
          </div>
          <p style={{ margin: "2px 0", color: "#475569" }}>
            {companyAddressText() || "Plot 88, GIDC Industrial Estate, Vatva Phase IV, Ahmedabad, Gujarat, 400057, India"}
          </p>
          <p style={{ margin: "2px 0", color: "#475569" }}>+{company.phone ?? "9109811223344"}</p>
          <p style={{ margin: "2px 0", color: "#475569" }}>{company.email ?? "sales@bharatsteel.in"}</p>
          <p style={{ margin: "2px 0", color: "#475569" }}>
            <strong>GSTIN:</strong> {company.gst_no ?? "2TAAACA123411Z5"}{" "}
            <span>&nbsp;<strong>Website:</strong> {company.website ?? "https://tetonmep.com/"}</span>
          </p>
          <p style={{ margin: "2px 0", color: "#475569" }}>
            <strong>Contact Name:</strong> {company.contact_name ?? "Ramesh Gupta"}
          </p>
        </div>

        <div style={{ width: "40%", textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>
            {config.label}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
            {docRefNo}
          </div>

          {!isDeliveryChallan && (
            <div
              style={{
                backgroundColor: "#2b5b84",
                color: "#ffffff",
                padding: "8px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "3px",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                {isCreditNote ? "Credits Available:" : "Amount Due:"}
              </span>
              <span style={{ fontSize: "15px", fontWeight: 800 }}>INR {money(total)}</span>
            </div>
          )}

          <div style={{ fontSize: "10.5px", color: "#334155", lineHeight: 1.6 }}>
            <div>
              <strong>Issue Date:</strong> &nbsp;&nbsp; {fmtDate(date)}
            </div>
            {validUntil && (
              <div>
                <strong>
                  {docType === "quotation" || docType === "purchase_order"
                    ? "Valid Until:"
                    : isDeliveryChallan
                    ? "Shipping Date:"
                    : "Due Date:"}
                </strong>{" "}
                &nbsp;&nbsp; {fmtDate(validUntil)}
              </div>
            )}
            <div>
              <strong>Place of Supply:</strong> &nbsp;&nbsp; {placeOfSupply()}
            </div>
          </div>
        </div>
      </div>

      {/* Party Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
          background: "#f8fafc",
          padding: "14px",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
            {docType === "quotation" ? "Quote To" : isVendorDoc ? "Vendor" : "Bill To"}
          </div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>{customerName}</div>
          {primaryContact?.name && (
            <p style={{ margin: "2px 0", color: "#475569" }}>{primaryContact.name}</p>
          )}
          {addressText(billingAddress) ? (
            <p style={{ margin: "2px 0", color: "#475569" }}>{addressText(billingAddress)}</p>
          ) : null}
          {customerData.phone && (
            <p style={{ margin: "2px 0", color: "#475569" }}>Ph: {customerData.phone}</p>
          )}
          {customerData.gst_no && (
            <p style={{ margin: "2px 0", color: "#475569" }}>
              <strong>GSTIN:</strong> {customerData.gst_no}
            </p>
          )}
        </div>

        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
            Ship To
          </div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>{customerName}</div>
          {addressText(shippingAddress) ? (
            <p style={{ margin: "2px 0", color: "#475569" }}>{addressText(shippingAddress)}</p>
          ) : null}
        </div>
      </div>

      {/* Items Table matching official PDF output */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#2b5b84", color: "#ffffff", fontWeight: 700 }}>
            <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "center", width: "4%" }}>
              S.NO
            </th>
            <th style={{ padding: "7px 6px", border: "1px solid #2b5b84", textAlign: "left" }}>
              ITEM DESCRIPTION
            </th>
            <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "center", width: "9%" }}>
              HSN/SAC
            </th>
            <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "center", width: "9%" }}>
              QTY UOM
            </th>
            {!isDeliveryChallan && (
              <>
                <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "right", width: "10%" }}>
                  PRICE (INR)
                </th>
                {hasDiscountInItems && (
                  <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "right", width: "10%" }}>
                    DISCOUNT (INR)
                  </th>
                )}
                <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "right", width: "11%" }}>
                  TAXABLE VALUE (INR)
                </th>
                <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "right", width: "10%" }}>
                  CGST (INR)
                </th>
                <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "right", width: "10%" }}>
                  SGST (INR)
                </th>
                <th style={{ padding: "7px 4px", border: "1px solid #2b5b84", textAlign: "right", width: "12%" }}>
                  AMOUNT (INR)
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={isDeliveryChallan ? 4 : (hasDiscountInItems ? 10 : 9)} style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                Loading preview details...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={isDeliveryChallan ? 4 : (hasDiscountInItems ? 10 : 9)} style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                No items in document.
              </td>
            </tr>
          ) : (
            items.map((item: any, idx: number) => {
              const quantity = Number(item.quantity || 0);
              const rate = Number(item.unit_rate ?? item.sales_rate ?? item.rate ?? 0);
              const flatDiscount = Number(item.discount_flat ?? 0);
              const pctDiscount = Number(item.discount_percent ?? 0);
              const grossRate = item.total_rate != null ? Number(item.total_rate) : quantity * rate;
              const discAmt = flatDiscount > 0 ? flatDiscount : grossRate * (pctDiscount / 100);
              const taxable = item.taxable_value != null
                ? Number(item.taxable_value)
                : (item.total_rate != null && (flatDiscount > 0 || pctDiscount > 0))
                ? (grossRate - discAmt)
                : (item.total_amount != null && item.tax_amount != null)
                ? (Number(item.total_amount) - Number(item.tax_amount))
                : (grossRate - discAmt);

              const unit = lookup(units, item.unit_id);
              const lineId = item[config.itemIdKey];
              const itemTaxes = allTaxDetails.filter((tax: any) => {
                const ref = tax[config.taxRefKey] ?? tax[`${docType}_item_index`];
                return String(ref) === String(lineId ?? idx);
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

              const cgstPctVal = cgst?.tax_percent ?? (cgstAmt > 0 && taxable > 0 ? (cgstAmt / taxable) * 100 : 9);
              const sgstPctVal = sgst?.tax_percent ?? (sgstAmt > 0 && taxable > 0 ? (sgstAmt / taxable) * 100 : 9);

              const lineTotal = item.total_amount != null ? Number(item.total_amount) : (taxable + itemTaxSum);
              const uomStr = unit.unit_code ?? unit.unit_name ?? item.unit_name ?? "NOS";

              if (isDeliveryChallan) {
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "6px 4px", textAlign: "center", border: "1px solid #cbd5e1" }}>{idx + 1}</td>
                    <td style={{ padding: "6px 6px", border: "1px solid #cbd5e1" }}>
                      <strong>{item.item_name ?? item.description ?? "Line item"}</strong>
                      {item.item_name && item.description && (
                        <div style={{ color: "#64748b", fontSize: "8.5px" }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ padding: "6px 4px", textAlign: "center", border: "1px solid #cbd5e1" }}>{item.hsn_code || "—"}</td>
                    <td style={{ padding: "6px 4px", textAlign: "center", border: "1px solid #cbd5e1" }}>
                      <strong>{quantity.toFixed(2)}</strong>
                      <br />
                      <span style={{ fontSize: "8px", color: "#64748b" }}>{uomStr}</span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={idx} style={{ borderBottom: "1px solid #cbd5e1" }}>
                  <td style={{ padding: "6px 4px", textAlign: "center", border: "1px solid #cbd5e1" }}>{idx + 1}</td>
                  <td style={{ padding: "6px 6px", border: "1px solid #cbd5e1" }}>
                    <strong>{item.item_name ?? item.description ?? "Line item"}</strong>
                    {item.item_name && item.description && (
                      <div style={{ color: "#64748b", fontSize: "8.5px" }}>{item.description}</div>
                    )}
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "center", border: "1px solid #cbd5e1" }}>{item.hsn_code || "—"}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center", border: "1px solid #cbd5e1" }}>
                    {quantity.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    <br />
                    <span style={{ fontSize: "8px", color: "#64748b" }}>{uomStr}</span>
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "right", border: "1px solid #cbd5e1" }}>{money(rate)}</td>
                  {hasDiscountInItems && (
                    <td style={{ padding: "6px 4px", textAlign: "right", border: "1px solid #cbd5e1" }}>
                      {money(discAmt)}
                      {pctDiscount > 0 && <span style={{ fontSize: "8px", color: "#64748b" }}><br />{pctDiscount}%</span>}
                    </td>
                  )}
                  <td style={{ padding: "6px 4px", textAlign: "right", border: "1px solid #cbd5e1" }}>{money(taxable)}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", border: "1px solid #cbd5e1" }}>
                    {money(cgstAmt)}
                    <br />
                    <span style={{ fontSize: "8px", color: "#64748b" }}>{cgstPctVal}%</span>
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "right", border: "1px solid #cbd5e1" }}>
                    {money(sgstAmt)}
                    <br />
                    <span style={{ fontSize: "8px", color: "#64748b" }}>{sgstPctVal}%</span>
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "right", border: "1px solid #cbd5e1", fontWeight: 700 }}>{money(lineTotal)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Bottom Summary Section */}
      {!isDeliveryChallan && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {/* Bank Details */}
          <div style={{ fontSize: "10.5px", color: "#334155", lineHeight: 1.6 }}>
            <div>
              <strong>Bank Name:</strong> {bank.bank_name ?? company.bank_name ?? company.bank ?? "HDFC Bank"}
            </div>
            <div>
              <strong>Account Number:</strong> {company.account_no ?? company.account_number ?? "50200012345678"}
            </div>
            <div>
              <strong>Branch Name:</strong> {company.branch_name ?? company.branch ?? "Vile Parle East, Mumbai"}
            </div>
            <div>
              <strong>IFSC Code:</strong> {company.ifsc_code ?? bank.ifsc_code ?? "HDFC0001234"}
            </div>
          </div>

          {/* Financial Totals Box */}
          <div style={{ textAlign: "right", fontSize: "11px", lineHeight: 1.7, minWidth: "320px" }}>
            {discountValue > 0 && (
              <div>
                <strong>Discount:</strong> &nbsp;&nbsp; (-) INR {money(discountValue)}
              </div>
            )}
            <div>
              <strong>Total Taxable Value:</strong> &nbsp;&nbsp; INR {money(taxableTotal)}
            </div>
            <div>
              <strong>Total Tax Amount:</strong> &nbsp;&nbsp; INR {money(totalTaxAmount)}
            </div>
            {roundOff !== 0 && (
              <div>
                <strong>Rounded Off:</strong> &nbsp;&nbsp; {roundOff < 0 ? "(-)" : ""} INR {money(Math.abs(roundOff))}
              </div>
            )}
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              Total Value (in figure): &nbsp;&nbsp; INR {money(total)}
            </div>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#334155" }}>
              Total Value (in words): &nbsp;&nbsp; INR {words}
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      {hasTerms && (
        <div style={{ marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
          <div style={{ fontWeight: 700, fontSize: "11px", color: "#1e293b", marginBottom: "4px" }}>
            Terms &amp; Conditions
          </div>
          {terms.map((term: string, i: number) => (
            <div key={i} style={{ fontSize: "10px", color: "#475569" }}>
              {i + 1}. {term}
            </div>
          ))}
        </div>
      )}

      {/* Provider Signature */}
      <div
        style={{
          display: "flex",
          justifyContent: isCreditNote ? "space-between" : "flex-end",
          marginTop: "40px",
          paddingTop: "12px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        {isCreditNote && (
          <div style={{ textAlign: "left", width: "200px" }}>
            <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "4px", fontWeight: 700, fontSize: "11px" }}>
              Provider Signature
            </div>
          </div>
        )}
        <div style={{ textAlign: "right", width: "200px" }}>
          <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "4px", fontWeight: 700, fontSize: "11px" }}>
            {isCreditNote ? "Receiver Signature" : "Provider Signature"}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          minHeight: "750px",
          background: "var(--altrex-canvas)",
          borderRadius: "8px",
          border: "1px solid var(--altrex-border)",
          overflow: "hidden",
        }}
      >
        {/* SleekBill Top Action Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--altrex-surface)",
            padding: "10px 20px",
            borderBottom: "1px solid var(--altrex-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={onEdit}
              style={{
                backgroundColor: "#f59e0b",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "12.5px",
                padding: "6px 14px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Edit size={14} /> Edit
            </button>
            <button
              type="button"
              disabled
              style={{
                backgroundColor: "var(--altrex-raised)",
                color: "var(--altrex-muted)",
                fontWeight: 500,
                fontSize: "12.5px",
                padding: "6px 14px",
                borderRadius: "5px",
                border: "1px solid var(--altrex-border)",
                cursor: "default",
                opacity: 0.7,
              }}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                const printEvt = new CustomEvent("altrex-print-doc", { detail: { document: detail, docType } });
                window.dispatchEvent(printEvt);
              }}
              style={{
                backgroundColor: "var(--altrex-surface)",
                color: "var(--altrex-text)",
                fontWeight: 500,
                fontSize: "12.5px",
                padding: "6px 14px",
                borderRadius: "5px",
                border: "1px solid var(--altrex-border)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FileText size={14} /> PDF
            </button>
            <button
              type="button"
              onClick={() => {
                const printEvt = new CustomEvent("altrex-print-doc", { detail: { document: detail, docType } });
                window.dispatchEvent(printEvt);
              }}
              style={{
                backgroundColor: "var(--altrex-surface)",
                color: "var(--altrex-text)",
                fontWeight: 500,
                fontSize: "12.5px",
                padding: "6px 14px",
                borderRadius: "5px",
                border: "1px solid var(--altrex-border)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              onClick={onDelete}
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                color: "#dc2626",
                fontWeight: 500,
                fontSize: "12.5px",
                padding: "6px 12px",
                borderRadius: "5px",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close preview"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--altrex-muted)",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Paper Container */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 16px",
            display: "flex",
            justifyContent: "center",
            background: "var(--altrex-canvas)",
          }}
        >
          {renderPaperCard()}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top Action Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--altrex-surface)",
          padding: "10px 24px",
          borderBottom: "1px solid var(--altrex-border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={onEdit}
            style={{
              backgroundColor: "#f59e0b",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "12.5px",
              padding: "6px 14px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Edit size={14} /> Edit
          </button>

          <button
            type="button"
            onClick={() => {
              const printEvt = new CustomEvent("altrex-print-doc", { detail: { document: detail, docType } });
              window.dispatchEvent(printEvt);
            }}
            style={{
              backgroundColor: "var(--altrex-surface)",
              color: "var(--altrex-text)",
              fontWeight: 500,
              fontSize: "12.5px",
              padding: "6px 14px",
              borderRadius: "5px",
              border: "1px solid var(--altrex-border)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FileText size={14} /> PDF
          </button>

          <button
            type="button"
            onClick={() => {
              const printEvt = new CustomEvent("altrex-print-doc", { detail: { document: detail, docType } });
              window.dispatchEvent(printEvt);
            }}
            style={{
              backgroundColor: "var(--altrex-surface)",
              color: "var(--altrex-text)",
              fontWeight: 500,
              fontSize: "12.5px",
              padding: "6px 14px",
              borderRadius: "5px",
              border: "1px solid var(--altrex-border)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Printer size={14} /> Print
          </button>

          <button
            type="button"
            onClick={onDelete}
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.08)",
              color: "#dc2626",
              fontWeight: 500,
              fontSize: "12.5px",
              padding: "6px 12px",
              borderRadius: "5px",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--altrex-muted)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Preview Canvas displaying A4 Paper Document */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 16px",
          display: "flex",
          justifyContent: "center",
          background: "var(--altrex-canvas)",
        }}
      >
        {renderPaperCard()}
      </div>
    </div>
  );
}
