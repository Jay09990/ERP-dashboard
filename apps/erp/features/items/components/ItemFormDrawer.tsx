"use client";

import { currencyApi, taxTypesApi, uomApi } from "@/features/masters/api";
import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, DollarSign, Package, Percent, ShoppingCart, Tag, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateItem, useItemCategories, useItemTypes, useUpdateItem } from "../api";
import { type Item, type ItemValues, itemSchema } from "../schema";

function extractList<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);
  for (const nestedValue of Object.values(value)) {
    const nested = extractList<T>(nestedValue, visited);
    if (nested.length > 0) return nested;
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
  const itemTypes = extractList<any>(itemTypesData);

  const { data: categoriesData = [] } = useItemCategories();
  const categories = extractList<any>(categoriesData);

  const { data: uomsData = [] } = uomApi.useList();
  const uoms = extractList<any>(uomsData);
  const { data: taxesData = [] } = taxTypesApi.useList();
  const taxes = extractList<any>(taxesData);
  const { data: currenciesData = [] } = currencyApi.useList();
  const currencies = extractList<any>(currenciesData);

  const getRecordId = (record: any, ...keys: string[]) => {
    for (const key of keys) {
      if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
    }
    return undefined;
  };

  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      item_name: "",
      item_description: "",
      item_specification: "",
      hsn_code: "",
      item_type: "",
      item_parent_category: "",
      item_category: "",
      unit_id: "",
      conv_unit_id: "",
      sales_rate: 0,
      sales_qty: 1,
      sales_convert_qty: 1,
      sales_conv_rate: 1,
      sales_currency_id: "",
      purchase_rate: 0,
      purchase_qty: 1,
      purchase_convert_qty: 1,
      purchase_conv_rate: 1,
      purchase_currency_id: "",
      tax_id: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        item_name: item.item_name,
        item_description: item.item_description ?? "",
        item_specification: item.item_specification ?? "",
        hsn_code: item.hsn_code ?? "",
        item_type: item.item_type ? item.item_type.toString() : "",
        item_parent_category: item.item_perent_category ? item.item_perent_category.toString() : "",
        item_category: item.item_category ? item.item_category.toString() : "",
        unit_id: item.unit_id ? item.unit_id.toString() : "",
        conv_unit_id: item.conv_unit_id ? item.conv_unit_id.toString() : "",
        sales_rate: item.sales_rate ?? 0,
        sales_qty: item.sales_qty ?? 1,
        sales_convert_qty: item.sales_convert_qty ?? 1,
        sales_conv_rate: item.sales_conv_rate ?? 1,
        sales_currency_id: item.sales_currency_id ? item.sales_currency_id.toString() : "",
        purchase_rate: item.purchase_rate ?? 0,
        purchase_qty: item.purchase_qty ?? 1,
        purchase_convert_qty: item.purchase_convert_qty ?? 1,
        purchase_conv_rate: item.purchase_conv_rate ?? 1,
        purchase_currency_id: item.purchase_currency_id ? item.purchase_currency_id.toString() : "",
        tax_id: item.tax_id ? item.tax_id.toString() : "",
        status: item.status || "active",
      });
    }
  }, [item, form]);

  const onSubmit = (values: ItemValues) => {
    const { item_parent_category } = values;
    const valueAsString = (value: number | string | undefined, fallback: string) =>
      value === undefined || value === "" ? fallback : String(value);
    const payload = {
      item_name: values.item_name,
      item_description: values.item_description ?? "",
      item_specification: values.item_specification ?? "",
      item_type: values.item_type ? Number(values.item_type) : null,
      item_perent_category: item_parent_category ? Number(item_parent_category) : null,
      item_category: values.item_category ? Number(values.item_category) : null,
      hsn_code: values.hsn_code ?? "",
      unit_id: values.unit_id ? Number(values.unit_id) : null,
      conv_unit_id: values.conv_unit_id ? Number(values.conv_unit_id) : null,
      sales_currency_id: values.sales_currency_id ? Number(values.sales_currency_id) : null,
      sales_qty: valueAsString(values.sales_qty, "1"),
      sales_convert_qty: valueAsString(values.sales_convert_qty, "1"),
      sales_rate: valueAsString(values.sales_rate, "0"),
      sales_conv_rate: valueAsString(values.sales_conv_rate, "0"),
      purchase_currency_id: values.purchase_currency_id ? Number(values.purchase_currency_id) : null,
      purchase_qty: valueAsString(values.purchase_qty, "1"),
      purchase_convert_qty: valueAsString(values.purchase_convert_qty, "1"),
      purchase_rate: valueAsString(values.purchase_rate, "0"),
      purchase_conv_rate: valueAsString(values.purchase_conv_rate, "0"),
      tax_id: values.tax_id ? Number(values.tax_id) : null,
      status: values.status,
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

                <label className="altrex-field" style={{ gridColumn: "span 2" }}>
                  <span>Item Description</span>
                  <textarea
                    className="altrex-input"
                    placeholder="Describe the item"
                    rows={2}
                    {...form.register("item_description")}
                  />
                </label>

                <label className="altrex-field" style={{ gridColumn: "span 2" }}>
                  <span>Item Specification</span>
                  <textarea
                    className="altrex-input"
                    placeholder="Add technical specifications"
                    rows={2}
                    {...form.register("item_specification")}
                  />
                </label>

                <label className="altrex-field">
                  <span>HSN / SAC Code</span>
                  <input className="altrex-input" placeholder="e.g. 730411" {...form.register("hsn_code")} />
                </label>

                <label className="altrex-field">
                  <span>Item Type</span>
                  <select className="altrex-input altrex-select" {...form.register("item_type")}>
                    <option value="">Select Item Type...</option>
                    {itemTypes.map((t: any) => {
                      const id = getRecordId(t, "item_type_id", "itemTypesId", "itemTypeId", "id");
                      return (
                        <option key={id} value={String(id)}>
                          {t.item_type_name ?? t.itemTypeName ?? t.name}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Parent Category</span>
                  <select className="altrex-input altrex-select" {...form.register("item_parent_category")}>
                    <option value="">Select Parent Category...</option>
                    {categories.map((c: any) => {
                      const id = getRecordId(c, "category_id", "itemCategoryId", "item_category_id", "id");
                      return (
                      <option key={`parent-${id}`} value={String(id)}>
                        {c.category_name ?? c.item_category_name ?? c.itemCategoryName ?? c.name}
                      </option>
                      );
                    })}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Category</span>
                  <select className="altrex-input altrex-select" {...form.register("item_category")}>
                    <option value="">Select Category...</option>
                    {categories.map((c: any) => {
                      const id = getRecordId(c, "category_id", "itemCategoryId", "item_category_id", "id");
                      return (
                      <option key={id} value={String(id)}>
                        {c.category_name ?? c.item_category_name ?? c.itemCategoryName ?? c.name}
                      </option>
                      );
                    })}
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
                    {uoms.map((u: any) => {
                      const id = getRecordId(u, "unit_id", "uom_id", "unitId", "uomId", "id");
                      return (
                      <option key={id} value={String(id)}>
                        {u.unit_name ?? u.uom_name ?? u.unitName ?? u.unit_code ?? u.name}
                      </option>
                      );
                    })}
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Conversion Secondary Unit</span>
                  <select className="altrex-input altrex-select" {...form.register("conv_unit_id")}>
                    <option value="">Select Conversion UOM...</option>
                    {uoms.map((u: any) => {
                      const id = getRecordId(u, "unit_id", "uom_id", "unitId", "uomId", "id");
                      return (
                      <option key={id} value={String(id)}>
                        {u.unit_name ?? u.uom_name ?? u.unitName ?? u.unit_code ?? u.name}
                      </option>
                      );
                    })}
                  </select>
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
                    <span>Sales Quantity</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="1" {...form.register("sales_qty")} />
                  </label>
                  <label className="altrex-field">
                    <span>Sales Converted Quantity</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="10" {...form.register("sales_convert_qty")} />
                  </label>
                  <label className="altrex-field">
                    <span>Selling Rate</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("sales_rate")} />
                  </label>
                  <label className="altrex-field">
                    <span>Sales Converted Rate</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("sales_conv_rate")} />
                  </label>
                  <label className="altrex-field">
                    <span>Sales Currency</span>
                    <select className="altrex-input altrex-select" {...form.register("sales_currency_id")}>
                      <option value="">Select Currency...</option>
                      {currencies.map((c: any) => {
                        const id = getRecordId(c, "currency_id", "currencyId", "id");
                        return (
                          <option key={id} value={String(id)}>
                            {c.currency_code ?? c.currencyCode ?? c.name} ({c.symbol ?? "₹"})
                          </option>
                        );
                      })}
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
                    <span>Purchase Quantity</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="1" {...form.register("purchase_qty")} />
                  </label>
                  <label className="altrex-field">
                    <span>Purchase Converted Quantity</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="10" {...form.register("purchase_convert_qty")} />
                  </label>
                  <label className="altrex-field">
                    <span>Purchase Rate</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("purchase_rate")} />
                  </label>
                  <label className="altrex-field">
                    <span>Purchase Converted Rate</span>
                    <input type="number" step="0.01" className="altrex-input" placeholder="0.00" {...form.register("purchase_conv_rate")} />
                  </label>
                  <label className="altrex-field">
                    <span>Purchase Currency</span>
                    <select className="altrex-input altrex-select" {...form.register("purchase_currency_id")}>
                      <option value="">Select Currency...</option>
                      {currencies.map((c: any) => {
                        const id = getRecordId(c, "currency_id", "currencyId", "id");
                        return (
                          <option key={id} value={String(id)}>
                            {c.currency_code ?? c.currencyCode ?? c.name} ({c.symbol ?? "₹"})
                          </option>
                        );
                      })}
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
                    {taxes.map((t: any) => {
                      const id = getRecordId(t, "tax_id", "taxTypeId", "id");
                      const suffix = t.tax_type === "fixed" ? "" : "%";
                      return (
                        <option key={id} value={String(id)}>
                          {t.tax_name ?? t.taxName ?? t.name} ({t.tax_percentage ?? t.percentage}{suffix})
                        </option>
                      );
                    })}
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
