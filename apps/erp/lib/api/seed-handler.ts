/** Serves local ERP fixtures through the BFF without contacting the backend. */
import { NextResponse, type NextRequest } from "next/server";
import { erpSeed } from "@/mocks/seed";

type SeedRecord = Record<string, unknown>;

const collections: Record<string, readonly unknown[]> = {
  "/api/master/country": erpSeed.masters.countries,
  "/api/master/state": erpSeed.masters.states,
  "/api/master/city": erpSeed.masters.cities,
  "/api/master/currency": erpSeed.masters.currencies,
  "/api/master/tax-types": erpSeed.masters.taxTypes,
  "/api/master/units": erpSeed.masters.units,
  "/api/master/financial-years": erpSeed.masters.financialYears,
  "/api/master/payment-terms": erpSeed.masters.paymentTerms,
  "/api/master/bank": erpSeed.masters.banks,
  "/api/master/cr-dr-reason": erpSeed.masters.creditDebitReasons,
  "/api/master/chart-of-accounts": erpSeed.masters.chartOfAccounts,
  "/api/master/departments": erpSeed.masters.departments,
  "/api/master/branch": erpSeed.masters.branches,
  "/api/master/designations": erpSeed.masters.designations,
  "/api/master/shifts": erpSeed.masters.shifts,
  "/api/master/holidays": erpSeed.masters.holidays,
  "/api/master/cost-centers": erpSeed.masters.costCenters,
  "/api/master/document-types": erpSeed.masters.documentTypes,
  "/api/master/document-series": erpSeed.masters.documentSeries,
  "/api/master/warehouse_mst": erpSeed.inventory.warehouses,
  "/api/master/item_attributes": [],
  "/api/master/item_images": [],
  "/api/auth/users": erpSeed.auth.users,
  "/api/auth/roles": erpSeed.auth.roles,
  "/api/auth/permissions": erpSeed.auth.rolePermissions,
  "/api/party/customers": erpSeed.parties.customers,
  "/api/party/vendors": erpSeed.parties.vendors,
  "/api/items/items": erpSeed.items.records,
  "/api/items/item-types": erpSeed.items.types,
  "/api/items/item-category": erpSeed.items.categories,
  "/api/quotation": erpSeed.documents.quotations,
  "/api/sales_order": erpSeed.documents.salesOrders,
  "/api/proforma": erpSeed.documents.proformas,
  "/api/delivery_challan": erpSeed.documents.deliveryChallans,
  "/api/invoice": erpSeed.documents.invoices,
  "/api/purchase_order": erpSeed.documents.purchaseOrders,
  "/api/purchase_invoice": erpSeed.documents.purchaseInvoices,
  "/api/credit_note": erpSeed.documents.creditNotes,
  "/api/debit_note": erpSeed.documents.debitNotes,
  "/api/inventory/warehouse": erpSeed.inventory.warehouses,
  "/api/inventory/batch": erpSeed.inventory.batches,
  "/api/inventory/stock/summary": erpSeed.inventory.stockSummary,
  "/api/inventory/stock/ledger": erpSeed.inventory.stockLedger,
  "/api/inventory/transfer": erpSeed.inventory.stockTransfers,
  "/api/inventory/adjustment": erpSeed.inventory.stockAdjustments,
  "/api/project": erpSeed.projects.list,
  "/api/procurement/requisition": erpSeed.procurement.requisitions,
  "/api/procurement/grn": erpSeed.procurement.goodsReceipts,
  "/api/procurement/site-issue": erpSeed.procurement.siteIssues,
};

const detailIdFields: Record<string, string[]> = {
  "/api/auth/users": ["user_id", "id"],
  "/api/auth/roles": ["role_id", "id"],
  "/api/party/customers": ["party_id", "id"],
  "/api/party/vendors": ["party_id", "id"],
  "/api/items/items": ["item_id", "id"],
  "/api/items/item-types": ["item_type_id", "id"],
  "/api/items/item-category": ["category_id", "id"],
  "/api/inventory/warehouse": ["warehouse_id", "id"],
  "/api/inventory/batch": ["batch_id", "id"],
  "/api/inventory/transfer": ["transfer_id", "stock_transfer_id", "id"],
  "/api/inventory/adjustment": ["adjustment_id", "stock_adjustment_id", "id"],
  "/api/procurement/requisition": ["requisition_id", "id"],
  "/api/procurement/grn": ["grn_id", "id"],
  "/api/procurement/site-issue": ["issue_id", "id"],
  "/api/quotation": ["quotation_id", "id"],
  "/api/sales_order": ["sales_order_id", "id"],
  "/api/proforma": ["proforma_id", "id"],
  "/api/delivery_challan": ["delivery_challan_id", "id"],
  "/api/invoice": ["invoice_id", "id"],
  "/api/purchase_order": ["purchase_order_id", "id"],
  "/api/purchase_invoice": ["purchase_invoice_id", "id"],
  "/api/credit_note": ["credit_note_id", "id"],
  "/api/debit_note": ["debit_note_id", "id"],
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function recordMatchesId(record: unknown, id: string, fields: string[]) {
  if (!record || typeof record !== "object") return false;
  const row = record as SeedRecord;
  return fields.some((field) => String(row[field] ?? "") === id);
}

function filterCollection(
  request: NextRequest,
  rows: readonly unknown[],
): readonly unknown[] {
  const status = request.nextUrl.searchParams.get("status");
  const partyId = request.nextUrl.searchParams.get("partyId");
  return rows.filter((record) => {
    if (!record || typeof record !== "object") return true;
    const row = record as SeedRecord;
    return (
      (!status || String(row.status ?? "") === status) &&
      (!partyId || String(row.party_id ?? "") === partyId)
    );
  });
}

function findProjectResponse(path: string[]): unknown | undefined {
  if (path[0] !== "project" || path.length < 2) return undefined;
  const projectId = Number(path[1]);
  const project = erpSeed.projects.list.find(
    (record) => record.project_id === projectId,
  );
  if (!project) return null;

  if (path.length === 2) {
    return projectId === erpSeed.ids.project
      ? erpSeed.projects.detail
      : project;
  }

  const section = path[2];
  if (section === "financials") {
    return erpSeed.projects.financials.find(
      (record) => record.project_id === projectId,
    );
  }

  if (projectId !== erpSeed.ids.project) return [];
  const detail = erpSeed.projects.detail as SeedRecord;
  const projectSections: Record<string, unknown> = {
    sites: detail.sites,
    boq: detail.boqItems,
    milestones: detail.milestones,
    tasks: detail.tasks,
  };
  if (section in projectSections) return projectSections[section];
  return undefined;
}

function findReadResponse(request: NextRequest, path: string[]) {
  const apiPath = `/api/${path.join("/")}`;

  if (apiPath === "/api/auth/profile") return erpSeed.companyProfile;
  if (apiPath === "/api/items/item-category/parents") {
    return erpSeed.items.categories.filter(
      (category) => category.parent_category_id === null,
    );
  }
  const subcategoryMatch = apiPath.match(
    /^\/api\/items\/item-category\/(\d+)\/subcategories$/,
  );
  if (subcategoryMatch) {
    const parentId = Number(subcategoryMatch[1]);
    return erpSeed.items.categories.filter(
      (category) => category.parent_category_id === parentId,
    );
  }

  const projectResponse = findProjectResponse(path);
  if (projectResponse !== undefined) return projectResponse;

  if (path[0] === "projects" && path.length === 3) {
    const projectId = Number(path[1]);
    const detail = erpSeed.projects.detail as SeedRecord;
    if (projectId !== erpSeed.ids.project) return [];
    if (path[2] === "dpr") return detail.reports;
    if (path[2] === "documents") return detail.documents;
  }

  if (
    apiPath === "/api/auth/roles/1/permissions" ||
    /^\/api\/auth\/roles\/\d+\/permissions$/.test(apiPath)
  ) {
    return erpSeed.auth.rolePermissions;
  }
  const userPermissionMatch = apiPath.match(
    /^\/api\/auth\/users\/(\d+)\/permissions$/,
  );
  if (userPermissionMatch) {
    return (
      erpSeed.auth.userPermissions.find(
        (entry) => entry.user_id === Number(userPermissionMatch[1]),
      )?.permissions ?? []
    );
  }

  if (apiPath === "/api/party/customers" || apiPath === "/api/party/vendors") {
    const rows = filterCollection(request, collections[apiPath] ?? []);
    return apiPath.endsWith("customers")
      ? { customers: rows }
      : { vendors: rows };
  }

  const detailCollection = Object.entries(detailIdFields).find(([basePath]) =>
    apiPath.startsWith(`${basePath}/`),
  );
  if (detailCollection) {
    const [basePath, idFields] = detailCollection;
    const recordId = path[path.length - 1];
    const found = collections[basePath]?.find((record) =>
      recordMatchesId(record, recordId, idFields),
    );
    if (basePath === "/api/party/customers")
      return found ? { customer: found } : null;
    if (basePath === "/api/party/vendors")
      return found ? { vendor: found } : null;
    return found ?? null;
  }

  const collection = collections[apiPath];
  if (collection) return filterCollection(request, collection);
  return undefined;
}

async function demoLogin(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    login?: string;
  };
  const requestedLogin = body.login?.trim().toLowerCase();
  const user =
    erpSeed.auth.users.find(
      (entry) =>
        entry.email.toLowerCase() === requestedLogin ||
        entry.phone === body.login?.trim(),
    ) ?? erpSeed.auth.users[0];
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.user_id,
      exp: Math.floor(Date.now() / 1000) + 43200,
    }),
  ).toString("base64url");
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");

  return json({
    token: `${header}.${payload}.seed-mode`,
    user: {
      userId: user.user_id,
      fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      email: user.email,
      phone: user.phone,
      companyId: 1,
      companyName: erpSeed.companyProfile.company_name,
      companyPhone: erpSeed.companyProfile.phone,
      companyEmail: erpSeed.companyProfile.email,
      address: erpSeed.companyProfile.address_line1,
      permissions: [
        { permission_name: "*", module_name: "all", is_allowed: true },
      ],
    },
  });
}

/** Reads return fixtures; login is local; every other write is rejected here. */
export async function handleSeedRequest(request: NextRequest, path: string[]) {
  if (request.method === "POST" && path.join("/") === "auth/login") {
    return demoLogin(request);
  }

  if (request.method !== "GET") {
    return json(
      {
        message:
          "ERP seed mode is read-only. No request was sent to the backend.",
      },
      405,
    );
  }

  const data = findReadResponse(request, path);
  if (data === undefined) {
    return json(
      { message: `No seed fixture is configured for /api/${path.join("/")}.` },
      404,
    );
  }
  if (data === null) {
    return json({ message: "Seed record not found." }, 404);
  }
  return json(data);
}
