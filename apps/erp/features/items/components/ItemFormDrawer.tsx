"use client";

import { currencyApi, taxTypesApi, uomApi } from "@/features/masters/api";
import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, DollarSign, Package, Percent, ShoppingCart, Tag, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateItem, useItemCategories, useItemTypes, useUpdateItem } from "../api";
import { type Item, type ItemValues, itemSchema } from "../schema";

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

interface Props {
  item: Item | null;
  onClose: () => void;
}

export function ItemFormDrawer({ item, onClose }: Props) {
  const isEdit = !!item;
  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem();

  // Fetch dropdown data
  const { data: itemTypesData = [] } = useItemTypes();
  const itemTypes = extractList(itemTypesData, ["types", "Types", "item_types"]);

  const { data: categoriesData = [] } = useItemCategories();
  const categories = extractList(categoriesData, ["categories", "Categories", "item_categories"]);

  const { data: uomsData = [] } = uomApi.useList();
  const uoms = extractList(uomsData, ["uoms", "UOMs", "units", "Units"]);
  const { data: taxesData = [] } = taxTypesApi.useList();
  const taxes = extractList(taxesData, ["taxes", "Taxes", "tax_types"]);
  const { data: currenciesData = [] } = currencyApi.useList();
  const currencies = extractList(currenciesData, ["currencies", "Currencies", "currency"]);

  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      item_name: "",
      item_code: "",
      hsn_code: "",
      item_type: "",
      item_category: "",
      unit_id: "",
      conv_unit_id: "",
      conv_rate: 1,
      sales_rate: 0,
      sales_min_price: 0,
      sales_discount_percent: 0,
      sales_currency_id: "",
      purchase_rate: 0,
      purchase_min_price: 0,
      purchase_discount_percent: 0,
      purchase_currency_id: "",
      tax_id: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        item_name: item.item_name,
        item_code: item.item_code ?? "",
        hsn_code: item.hsn_code ?? "",
        item_type: item.item_type ? item.item_type.toString() : "",
        item_category: item.item_category ? item.item_category.toString() : "",
        unit_id: item.unit_id ? item.unit_id.toString() : "",
        conv_unit_id: item.conv_unit_id ? item.conv_unit_id.toString() : "",
        conv_rate: item.conv_rate ?? 1,
        sales_rate: item.sales_rate ?? 0,
        sales_min_price: item.sales_min_price ?? 0,
        sales_discount_percent: item.sales_discount_percent ?? 0,
        sales_currency_id: item.sales_currency_id ? item.sales_currency_id.toString() : "",
        purchase_rate: item.purchase_rate ?? 0,
        purchase_min_price: item.purchase_min_price ?? 0,
        purchase_discount_percent: item.purchase_discount_percent ?? 0,
        purchase_currency_id: item.purchase_currency_id ? item.purchase_currency_id.toString() : "",
        tax_id: item.tax_id ? item.tax_id.toString() : "",
        status: item.status || "active",
      });
    }
  }, [item, form]);

  const onSubmit = (values: ItemValues) => {
    const payload = {
      ...values,
      item_type: values.item_type ? Number(values.item_type) : null,
      item_category: values.item_category ? Number(values.item_category) : null,
      unit_id: values.unit_id ? Number(values.unit_id) : null,
      conv_unit_id: values.conv_unit_id ? Number(values.conv_unit_id) : null,
      conv_rate: values.conv_rate ? Number(values.conv_rate) : 1,
      sales_rate: values.sales_rate ? Number(values.sales_rate) : 0,
      sales_min_price: values.sales_min_price ? Number(values.sales_min_price) : 0,
      sales_discount_percent: values.sales_discount_percent ? Number(values.sales_discount_percent) : 0,
      sales_currency_id: values.sales_currency_id ? Number(values.sales_currency_id) : null,
      purchase_rate: values.purchase_rate ? Number(values.purchase_rate) : 0,
      purchase_min_price: values.purchase_min_price ? Number(values.purchase_min_price) : 0,
      purchase_discount_percent: values.purchase_discount_percent ? Number(values.purchase_discount_percent) : 0,
      purchase_currency_id: values.purchase_currency_id ? Number(values.purchase_currency_id) : null,
      tax_id: values.tax_id ? Number(values.tax_id) : null,
    };

    if (isEdit && item) {
      updateItem(
        { id: (item.item_id ?? (item as any).id).toString(), body: payload as any },
        { onSuccess: () => onClose() },
      );
    } else {
      createItem(payload as any, { onSuccess: () => onClose() });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="altrex-dialog-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="altrex-dialog altrex-dialog-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="altrex-dialog-header" style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: isEdit ? "rgba(37,99,235,0.1)" : "rgba(16,185,129,0.1)",
                color: isEdit ? "var(--altrex-primary)" : "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <h3 className="altrex-dialog-title">
                {isEdit ? "Edit Product Item" : "Create New Item"}
              </h3>
              <p className="altrex-dialog-subtitle" style={{ margin: 0 }}>
                {isEdit
                  ? "Update product specifications, UOM conversions, and pricing setups."
                  : "Add a new inventory item with dual sales/purchase pricing and tax rates."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="altrex-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="altrex-dialog-body" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <form id="item-form" onSubmit={form.handleSubmit(onSubmit)} style={{ display: "grid", gap: "24px" }}>
            
            {/* Section 1: Basic Identity */}
            <div style={{ background: "var(--altrex-raised)", padding: "16px", borderRadius: "10px", border: "1px solid var(--altrex-line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontWeight: 700, fontSize: "14px", color: "var(--altrex-text)" }}>
                <Tag size={16} style={{ color: "var(--altrex-primary)" }} />
                Item Specifications & Identity
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label className="altrex-field" style={{ gridColumn: "span 2" }}>
                  <span>Item Name *</span>
                  <input className="altrex-input" placeholder="e.g. Industrial Steel Pipe 50mm" {...form.register("item_name")} />
                  {form.formState.errors.item_name && (
                    <span className="altrex-form-error">{form.formState.errors.item_name.message}</span>
                  )}
                </label>

                <label className="altrex-field">
                  <span>Item Code / SKU</span>
                  <input className="altrex-input" placeholder="e.g. SK-5001" {...form.register("item_code")} />
                </label>

                <label className="altrex-field">
                  <span>HSN / SAC Code</span>
                  <input className="altrex-input" placeholder="e.g. 730411" {...form.register("hsn_code")} />
                </label>

                <label className="altrex-field">
                  <span>Item Type</span>
                  <select className="altrex-input altrex-select" {...form.register("item_type")}>
                    <option value="">Select Item Type...</option>
                    {itemTypes.map((t: any) => (
                      <option key={t.item_type_id ?? t.id} value={(t.item_type_id ?? t.id).toString()}>
                        {t.item_type_name ?? t.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Category</span>
                  <select className="altrex-input altrex-select" {...form.register("item_category")}>
                    <option value="">Select Category...</option>
                    {categories.map((c: any) => (
                      <option key={c.category_id ?? c.id} value={(c.category_id ?? c.id).toString()}>
                        {c.category_name ?? c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Section 2: Units of Measure & Conversion */}
            <div style={{ background: "var(--altrex-raised)", padding: "16px", borderRadius: "10px", border: "1px solid var(--altrex-line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontWeight: 700, fontSize: "14px", color: "var(--altrex-text)" }}>
                <ArrowRightLeft size={16} style={{ color: "#8b5cf6" }} />
                Units of Measure & Conversion Rate
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <label className="altrex-field">
                  <span>Primary Base Unit (UOM)</span>
                  <select className="altrex-input altrex-select" {...form.register("unit_id")}>
                    <option value="">Select Base UOM...</option>
                    {uoms.map((u: any) => (
                      <option key={u.unit_id ?? u.id} value={(u.unit_id ?? u.id).toString()}>
                        {u.unit_name ?? u.unit_code ?? u.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Conversion Secondary Unit</span>
                  <select className="altrex-input altrex-select" {...form.register("conv_unit_id")}>
                    <option value="">Select Conversion UOM...</option>
                    {uoms.map((u: any) => (
                      <option key={u.unit_id ?? u.id} value={(u.unit_id ?? u.id).toString()}>
                        {u.unit_name ?? u.unit_code ?? u.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Conversion Rate Factor</span>
                  <input
                    type="number"
                    step="0.0001"
                    className="altrex-input"
                    placeholder="e.g. 10 (1 Box = 10 Pcs)"
                    {...form.register("conv_rate")}
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Dual Sales & Purchase Pricing */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Sales Pricing Block */}
              <div style={{ background: "rgba(16,185,129,0.04)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontWeight: 700, fontSize: "14px", color: "#10b981" }}>
                  <ShoppingCart size={16} />
                  Sales Pricing & Setup
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  <label className="altrex-field">
                    <span>Selling Rate</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("sales_rate")} />
                  </label>
                  <label className="altrex-field">
                    <span>Minimum Sales Price</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("sales_min_price")} />
                  </label>
                  <label className="altrex-field">
                    <span>Default Sales Discount (%)</span>
                    <input type="number" step="0.1" className="altrex-input" placeholder="0%" {...form.register("sales_discount_percent")} />
                  </label>
                  <label className="altrex-field">
                    <span>Sales Currency</span>
                    <select className="altrex-input altrex-select" {...form.register("sales_currency_id")}>
                      <option value="">Select Currency...</option>
                      {currencies.map((c: any) => (
                        <option key={c.currency_id ?? c.id} value={(c.currency_id ?? c.id).toString()}>
                          {c.currency_code ?? c.name} ({c.symbol ?? "₹"})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Purchase Pricing Block */}
              <div style={{ background: "rgba(59,130,246,0.04)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontWeight: 700, fontSize: "14px", color: "#3b82f6" }}>
                  <DollarSign size={16} />
                  Purchase Pricing & Setup
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  <label className="altrex-field">
                    <span>Purchase Rate</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("purchase_rate")} />
                  </label>
                  <label className="altrex-field">
                    <span>Minimum Purchase Price</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("purchase_min_price")} />
                  </label>
                  <label className="altrex-field">
                    <span>Purchase Discount (%)</span>
                    <input type="number" step="0.1" className="altrex-input" placeholder="0%" {...form.register("purchase_discount_percent")} />
                  </label>
                  <label className="altrex-field">
                    <span>Purchase Currency</span>
                    <select className="altrex-input altrex-select" {...form.register("purchase_currency_id")}>
                      <option value="">Select Currency...</option>
                      {currencies.map((c: any) => (
                        <option key={c.currency_id ?? c.id} value={(c.currency_id ?? c.id).toString()}>
                          {c.currency_code ?? c.name} ({c.symbol ?? "₹"})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Tax & Status */}
            <div style={{ background: "var(--altrex-raised)", padding: "16px", borderRadius: "10px", border: "1px solid var(--altrex-line)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label className="altrex-field">
                  <span>Applicable Tax Type</span>
                  <select className="altrex-input altrex-select" {...form.register("tax_id")}>
                    <option value="">Select Tax Rate...</option>
                    {taxes.map((t: any) => (
                      <option key={t.tax_id ?? t.id} value={(t.tax_id ?? t.id).toString()}>
                        {t.tax_name ?? t.name} ({t.tax_percentage ?? t.percentage}%)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Item Status</span>
                  <select className="altrex-input altrex-select" {...form.register("status")}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="altrex-dialog-footer" style={{ flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="item-form" disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </div>
    </div>
  );
}
