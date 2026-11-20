"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export type ReferenceOption = {
  value: string;
  label: string;
};

type ListDefinition = {
  queryKey: readonly unknown[];
  endpoint: string;
  params?: Record<string, string>;
  listKeys: string[];
  idKeys: string[];
  labelKeys: string[];
  recordKeyFragments?: string[];
  includeStatuses?: string[];
};

const listDefinitions = {
  customers: {
    queryKey: ["customers", "list", undefined],
    endpoint: endpoints.party.customers,
    listKeys: ["customers", "parties"],
    idKeys: ["party_id", "id"],
    labelKeys: ["party_name", "customer_name", "name"],
  },
  quotations: {
    queryKey: ["quotations", "list", undefined],
    endpoint: endpoints.documents.quotation,
    listKeys: [
      "quotations",
      "Quotations",
      "quotation",
      "Quotation",
      "quotes",
      "quote",
      "quotationList",
      "quotation_list",
    ],
    idKeys: ["quotation_id", "id"],
    labelKeys: ["quotation_no", "quotation_number", "document_no"],
  },
  salesOrders: {
    queryKey: ["sales-orders", "list", undefined],
    endpoint: endpoints.documents.salesOrder,
    listKeys: [
      "sales_orders",
      "Sales_Orders",
      "salesOrders",
      "SalesOrders",
      "sales_order",
      "salesOrder",
      "SalesOrder",
      "sales_order_list",
      "salesOrderList",
      "salesOrdersList",
      "orders",
      "orderList",
      "order_list",
    ],
    idKeys: [
      "sales_order_id",
      "salesOrderId",
      "salesOrderID",
      "sales_orderId",
      "order_id",
      "orderId",
      "id",
    ],
    labelKeys: [
      "sales_order_no",
      "salesOrderNo",
      "sales_order_number",
      "order_no",
      "order_number",
      "document_no",
    ],
    recordKeyFragments: ["salesorder", "orderlist", "orders"],
    includeStatuses: ["approved", "confirmed"],
  },
  users: {
    queryKey: ["users", "list", undefined],
    endpoint: endpoints.auth.users,
    listKeys: ["users"],
    idKeys: ["user_id", "id"],
    labelKeys: ["full_name", "fullName", "name", "email"],
  },
  currencies: {
    queryKey: ["currency", "list", undefined],
    endpoint: endpoints.masters.currency,
    listKeys: ["currencies", "currency"],
    idKeys: ["currency_id", "currency_mst_id", "currencyId", "id"],
    labelKeys: ["currency_name", "currency_code", "name"],
  },
  items: {
    queryKey: ["items", "list", undefined],
    endpoint: endpoints.items.items,
    listKeys: ["items"],
    idKeys: ["item_id", "id"],
    labelKeys: ["item_name", "item_code", "name"],
  },
  units: {
    queryKey: ["uom", "list", undefined],
    endpoint: endpoints.masters.uom,
    listKeys: ["units", "uom", "uoms"],
    idKeys: ["unit_id", "uom_id", "id"],
    labelKeys: ["unit_name", "unit_code", "name"],
  },
  cities: {
    queryKey: ["cities", "list", undefined],
    endpoint: endpoints.masters.city,
    listKeys: ["cities", "city"],
    idKeys: ["city_id", "id"],
    labelKeys: ["city_name", "name"],
  },
  states: {
    queryKey: ["states", "list", undefined],
    endpoint: endpoints.masters.state,
    listKeys: ["states", "state"],
    idKeys: ["state_id", "id"],
    labelKeys: ["state_name", "name"],
  },
  countries: {
    queryKey: ["countries", "list", undefined],
    endpoint: endpoints.masters.country,
    listKeys: ["countries", "country"],
    idKeys: ["country_id", "id"],
    labelKeys: ["country_name", "name"],
  },
  projects: {
    queryKey: ["projects", {}],
    params: {},
    endpoint: endpoints.projects.list,
    listKeys: ["projects", "project"],
    idKeys: ["project_id", "id"],
    labelKeys: ["project_name", "project_code"],
  },
  warehouses: {
    queryKey: ["warehouses", "list", undefined],
    endpoint: endpoints.inventory.warehouse,
    listKeys: ["warehouses", "warehouse"],
    idKeys: ["warehouse_id", "id"],
    labelKeys: ["warehouse_name", "name"],
  },
  batches: {
    queryKey: ["batches", "list", undefined],
    endpoint: endpoints.inventory.batch,
    listKeys: ["batches", "batch"],
    idKeys: ["batch_id", "id"],
    labelKeys: ["batch_no", "batch_number"],
  },
  purchaseOrders: {
    queryKey: ["purchase-orders", "list", undefined],
    endpoint: endpoints.documents.purchaseOrder,
    listKeys: ["purchase_orders", "purchaseOrders", "orders"],
    idKeys: ["purchase_order_id", "id"],
    labelKeys: ["purchase_order_no", "purchase_order_number", "po_no"],
  },
  vendors: {
    queryKey: ["vendors", "list", undefined],
    endpoint: endpoints.party.vendors,
    listKeys: ["vendors", "parties", "data"],
    idKeys: ["party_id", "id"],
    labelKeys: ["party_name", "vendor_name", "name"],
  },
  trades: {
    queryKey: ["manpower", "trades"],
    endpoint: endpoints.manpower.trades,
    listKeys: ["trades", "trade", "data"],
    idKeys: ["trade_id", "id"],
    labelKeys: ["trade_name", "name"],
  },
  equipment: {
    queryKey: ["equipment", "list", undefined],
    endpoint: endpoints.equipment.list,
    listKeys: ["equipment", "equipments", "data"],
    idKeys: ["equipment_id", "id"],
    labelKeys: ["equipment_name", "name"],
  },
} satisfies Record<string, ListDefinition>;

function normalizeKey(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function fieldValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  const normalizedKeys = new Set(keys.map(normalizeKey));
  const matchingKey = Object.keys(record).find((key) =>
    normalizedKeys.has(normalizeKey(key)),
  );
  return matchingKey === undefined ? undefined : record[matchingKey];
}

function hasRecordId(
  value: unknown,
  idKeys: string[],
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return idKeys.some((key) => {
    const id = fieldValue(record, [key]);
    return (
      (typeof id === "number" && Number.isSafeInteger(id)) ||
      (typeof id === "string" && id.trim() !== "")
    );
  });
}

function findRecords(
  value: unknown,
  definition: ListDefinition,
  allowEmpty = false,
): unknown[] | null {
  if (Array.isArray(value)) {
    if (
      (value.length > 0 &&
        value.every((entry) => hasRecordId(entry, definition.idKeys))) ||
      (allowEmpty && value.length === 0)
    ) {
      return value;
    }
    for (const entry of value) {
      const nested = findRecords(entry, definition);
      if (nested !== null) return nested;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const normalizedListKeys = new Set(definition.listKeys.map(normalizeKey));
  for (const [key, nested] of Object.entries(record)) {
    if (
      normalizedListKeys.has(normalizeKey(key)) &&
      Array.isArray(nested) &&
      (nested.length === 0 ||
        nested.every((entry) => hasRecordId(entry, definition.idKeys)))
    ) {
      return nested;
    }
  }
  for (const key of ["data", "result", "payload", "response"]) {
    if (key in record) {
      const result = findRecords(record[key], definition, true);
      if (result !== null) return result;
    }
  }
  for (const [key, nested] of Object.entries(record)) {
    if (
      ["success", "message", "status"].includes(key) ||
      (Array.isArray(nested) &&
        !definition.recordKeyFragments?.some((fragment) =>
          normalizeKey(key).includes(fragment),
        ) &&
        !nested.every((entry) => hasRecordId(entry, definition.idKeys)))
    ) {
      continue;
    }
    const result = findRecords(nested, definition);
    if (result !== null) return result;
  }
  return null;
}

function optionsFromResponse(
  response: unknown,
  definition: ListDefinition,
  eligibleSalesOrdersOnly = false,
): ReferenceOption[] {
  const records = findRecords(response, definition);
  if (!records) {
    throw new Error(
      `Could not identify ${definition.listKeys[0]} records in the reference-data response.`,
    );
  }
  const options = records.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    const candidateId = fieldValue(record, definition.idKeys);
    const id =
      typeof candidateId === "number" || typeof candidateId === "string"
        ? candidateId
        : undefined;
    if (id == null || String(id).trim() === "") return [];

    const status = record.status;
    if (
      eligibleSalesOrdersOnly &&
      definition.includeStatuses &&
      typeof status === "string" &&
      !definition.includeStatuses.includes(status.toLowerCase())
    ) {
      return [];
    }

    const candidateLabel = fieldValue(record, definition.labelKeys);
    const label =
      typeof candidateLabel === "number" || typeof candidateLabel === "string"
        ? candidateLabel
        : undefined;
    const suffix = `#${String(id)}`;
    return [
      {
        value: String(id),
        label:
          label == null || String(label).trim() === ""
            ? suffix
            : `${String(label)} (${suffix})`,
      },
    ];
  });
  if (records.length > 0 && options.length === 0) {
    throw new Error(
      `Reference-data records are missing expected ID fields (${definition.idKeys.join(", ")}).`,
    );
  }
  return options;
}

function useReferenceList(
  definition: ListDefinition,
  enabled: boolean,
  eligibleSalesOrdersOnly = false,
) {
  return useQuery({
    queryKey: definition.queryKey,
    queryFn: () =>
      apiClient.get<unknown>(definition.endpoint, definition.params),
    enabled,
    staleTime: 5 * 60 * 1000,
    select: (response: unknown) =>
      optionsFromResponse(response, definition, eligibleSalesOrdersOnly),
  });
}

export function useProjectHeaderLookups(
  enabled: boolean,
  eligibleSalesOrdersOnly = false,
) {
  const customers = useReferenceList(listDefinitions.customers, true);
  const quotations = useReferenceList(listDefinitions.quotations, enabled);
  const salesOrders = useReferenceList(
    listDefinitions.salesOrders,
    enabled,
    eligibleSalesOrdersOnly,
  );
  const users = useReferenceList(listDefinitions.users, enabled);
  const currencies = useReferenceList(listDefinitions.currencies, enabled);
  const items = useReferenceList(listDefinitions.items, enabled);
  const units = useReferenceList(listDefinitions.units, enabled);
  const queries = [
    customers,
    quotations,
    salesOrders,
    users,
    currencies,
    items,
    units,
  ];

  return {
    options: {
      party_id: customers.data ?? [],
      quotation_id: quotations.data ?? [],
      sales_order_id: salesOrders.data ?? [],
      project_manager_id: users.data ?? [],
      project_engineer_id: users.data ?? [],
      currency_id: currencies.data ?? [],
      item_id: items.data ?? [],
      unit_id: units.data ?? [],
    },
    isCustomersLoading: customers.isLoading,
    isLoading: enabled && queries.some((query) => query.isLoading),
    error: queries.find((query) => query.error)?.error,
  };
}

export function useProjectChildLookups(enabled: boolean) {
  const users = useReferenceList(listDefinitions.users, enabled);
  const items = useReferenceList(listDefinitions.items, enabled);
  const units = useReferenceList(listDefinitions.units, enabled);
  const cities = useReferenceList(listDefinitions.cities, enabled);
  const states = useReferenceList(listDefinitions.states, enabled);
  const countries = useReferenceList(listDefinitions.countries, enabled);
  const trades = useReferenceList(listDefinitions.trades, enabled);
  const equipment = useReferenceList(listDefinitions.equipment, enabled);
  const vendors = useReferenceList(listDefinitions.vendors, enabled);
  const queries = [
    users,
    items,
    units,
    cities,
    states,
    countries,
    trades,
    equipment,
    vendors,
  ];
  return {
    options: {
      assigned_to: users.data ?? [],
      item_id: items.data ?? [],
      unit_id: units.data ?? [],
      city_id: cities.data ?? [],
      state_id: states.data ?? [],
      country_id: countries.data ?? [],
      trade_id: trades.data ?? [],
      equipment_id: equipment.data ?? [],
      subcontractor_id: vendors.data ?? [],
      vendor_id: vendors.data ?? [],
    },
    isLoading: enabled && queries.some((query) => query.isLoading),
    error: queries.find((query) => query.error)?.error,
  };
}

export function useProcurementLookups(
  enabled: boolean,
  kind: "requisition" | "grn" | "site-issue",
) {
  const projects = useReferenceList(
    listDefinitions.projects,
    enabled && (kind === "requisition" || kind === "site-issue"),
  );
  const items = useReferenceList(listDefinitions.items, enabled);
  const units = useReferenceList(listDefinitions.units, enabled);
  const warehouses = useReferenceList(
    listDefinitions.warehouses,
    enabled && kind !== "requisition",
  );
  const batches = useReferenceList(
    listDefinitions.batches,
    enabled && kind !== "requisition",
  );
  const purchaseOrders = useReferenceList(
    listDefinitions.purchaseOrders,
    enabled && kind === "grn",
  );
  const queries = [projects, items, units, warehouses, batches, purchaseOrders];
  return {
    options: {
      project_id: projects.data ?? [],
      item_id: items.data ?? [],
      unit_id: units.data ?? [],
      warehouse_id: warehouses.data ?? [],
      batch_id: batches.data ?? [],
      purchase_order_id: purchaseOrders.data ?? [],
    },
    isLoading: enabled && queries.some((query) => query.isLoading),
    error: queries.find((query) => query.error)?.error,
  };
}
