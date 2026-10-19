/**
 * App-wide development dataset for exercising ERP screens and relationships.
 * This is fixture data; it does not write to the external ERP API or database.
 */
import type { Role } from "../features/auth/roles/schema";
import type { User } from "../features/auth/users/schema";
import type { SalesDocumentValues } from "../features/documents/schema";
import type {
  Batch,
  StockAdjustment,
  StockLedgerEntry,
  StockSummary,
  StockTransfer,
  Warehouse,
} from "../features/inventory/schema";
import type { Item, ItemCategory, ItemType } from "../features/items/schema";
import type {
  BankValues,
  CityValues,
  CountryValues,
  CurrencyValues,
  PaymentTermValues,
  StateValues,
  TaxTypeValues,
  UomValues,
} from "../features/masters/schema";
import type { PartyRecord } from "../features/parties/shared/types";
import type { ProfileValues } from "../features/profile/schema";
import {
  procurementSeed,
  projectDetailSeed,
  projectFinancialsSeed,
  projectSeed,
} from "../features/projects/mocks/seed";

const ids = {
  country: 1,
  state: 7,
  city: 10,
  project: 1001,
  site: 1101,
  currency: 1,
  tax: { gst: 1, cess: 2 },
  unit: { each: 1, kilogram: 2, hour: 3 },
  customer: { aarav: 101, western: 102 },
  vendor: { steelWorks: 201, cementSupply: 202 },
  itemType: { inventory: 1, service: 2 },
  category: { materials: 11, steel: 12, cement: 13, services: 14 },
  item: { steel: 301, cement: 302, labour: 303 },
  warehouse: { ahmedabad: 201, surat: 202 },
  batch: { steel: 2101, cement: 2102 },
} as const;

type SeedDocument = SalesDocumentValues & {
  id: number;
  document_no: string;
  quotation_id?: number;
  quotation_date?: string;
  sales_order_id?: number;
  sales_order_date?: string;
  proforma_id?: number;
  proforma_date?: string;
  delivery_challan_id?: number;
  delivery_date?: string;
  invoice_id?: number;
  invoice_date?: string;
  purchase_order_id?: number;
  purchase_order_date?: string;
  purchase_invoice_id?: number;
  pi_date?: string;
  credit_note_id?: number;
  credit_note_date?: string;
  debit_note_id?: number;
  debit_note_date?: string;
  grand_total?: number;
  total_amount?: number;
  payable_amount?: number;
  credit_note_total?: number;
  debit_note_total?: number;
  paid_amount?: number;
  balance_due?: number;
  document_type:
    | "quotation"
    | "sales_order"
    | "proforma"
    | "delivery_challan"
    | "sales_invoice"
    | "purchase_order"
    | "purchase_invoice"
    | "credit_note"
    | "debit_note";
};

const commonDocument = {
  document_date: "2026-10-01",
  currency_id: ids.currency,
  shipping_charges: 0,
  round_off: 0,
  terms_conditions: "Payment due within 30 days of invoice date.",
  itemsDetails: [
    {
      item_id: ids.item.steel,
      description: "MS structural steel",
      quantity: 100,
      hsn_code: "7216",
      unit_id: ids.unit.kilogram,
      unit_rate: 85,
      discount_percent: 0,
      discount_flat: 0,
      tax_ids: [ids.tax.gst],
    },
  ],
} satisfies Omit<SalesDocumentValues, "party_id" | "status">;

const customers: PartyRecord[] = [
  {
    id: ids.customer.aarav,
    party_id: ids.customer.aarav,
    party_type: "customer",
    party_name: "Aarav Industrial Systems",
    phone: "9876500101",
    email: "accounts@aarav-industrial.example",
    gst_no: "24AABCA1234F1Z5",
    pan_no: "AABCA1234F",
    website: "https://aarav-industrial.example",
    contact_name: "Neha Shah",
    opening_balance: 0,
    currency_id: ids.currency,
    currency_name: "Indian Rupee",
    status: "active",
    addresses: [
      {
        id: 1011,
        address_type: "both",
        address_label: "Head office",
        attention_to: "Neha Shah",
        phone: "9876500101",
        address_line1: "12 GIDC Industrial Estate",
        address_line2: "Vatva",
        city_id: ids.city,
        state_id: ids.state,
        country_id: ids.country,
        pincode: "382445",
      },
    ],
    contactPersons: [
      {
        id: 1021,
        name: "Neha Shah",
        email: "neha.shah@aarav-industrial.example",
        phone: "9876500101",
        designation: "Purchase Manager",
      },
    ],
  },
  {
    id: ids.customer.western,
    party_id: ids.customer.western,
    party_type: "customer",
    party_name: "Western Distribution Group",
    phone: "9876500102",
    email: "finance@western-distribution.example",
    gst_no: "24AABCW5678G1Z2",
    pan_no: "AABCW5678G",
    contact_name: "Karan Mehta",
    opening_balance: 12500,
    currency_id: ids.currency,
    currency_name: "Indian Rupee",
    status: "active",
    addresses: [
      {
        id: 1031,
        address_type: "billing",
        address_label: "Billing office",
        attention_to: "Karan Mehta",
        phone: "9876500102",
        address_line1: "Plot 24, Sachin GIDC",
        address_line2: "",
        city_id: ids.city,
        state_id: ids.state,
        country_id: ids.country,
        pincode: "394230",
      },
    ],
    contactPersons: [
      {
        id: 1041,
        name: "Karan Mehta",
        email: "karan.mehta@western-distribution.example",
        phone: "9876500102",
        designation: "Finance Controller",
      },
    ],
  },
];

const vendors: PartyRecord[] = [
  {
    id: ids.vendor.steelWorks,
    party_id: ids.vendor.steelWorks,
    party_type: "vendor",
    party_name: "Gujarat Steel Works",
    phone: "9876500201",
    email: "sales@gujarat-steel.example",
    gst_no: "24AABCG2222H1Z9",
    pan_no: "AABCG2222H",
    contact_name: "Mihir Desai",
    opening_balance: 0,
    currency_id: ids.currency,
    currency_name: "Indian Rupee",
    status: "active",
    addresses: [
      {
        id: 2011,
        address_type: "both",
        address_label: "Works",
        attention_to: "Mihir Desai",
        phone: "9876500201",
        address_line1: "Plot 8, Kalol Industrial Estate",
        address_line2: "",
        city_id: ids.city,
        state_id: ids.state,
        country_id: ids.country,
        pincode: "382721",
      },
    ],
    contactPersons: [
      {
        id: 2021,
        name: "Mihir Desai",
        email: "mihir@gujarat-steel.example",
        phone: "9876500201",
        designation: "Sales Executive",
      },
    ],
  },
  {
    id: ids.vendor.cementSupply,
    party_id: ids.vendor.cementSupply,
    party_type: "vendor",
    party_name: "Saurashtra Cement Supply",
    phone: "9876500202",
    email: "orders@saurashtra-cement.example",
    gst_no: "24AABCS3333J1Z8",
    pan_no: "AABCS3333J",
    contact_name: "Hetal Joshi",
    opening_balance: 0,
    currency_id: ids.currency,
    currency_name: "Indian Rupee",
    status: "active",
    addresses: [
      {
        id: 2031,
        address_type: "both",
        address_label: "Dispatch depot",
        attention_to: "Hetal Joshi",
        phone: "9876500202",
        address_line1: "45 Ring Road",
        address_line2: "",
        city_id: ids.city,
        state_id: ids.state,
        country_id: ids.country,
        pincode: "360005",
      },
    ],
    contactPersons: [
      {
        id: 2041,
        name: "Hetal Joshi",
        email: "hetal@saurashtra-cement.example",
        phone: "9876500202",
        designation: "Order Desk",
      },
    ],
  },
];

const items: Item[] = [
  {
    item_id: ids.item.steel,
    item_code: "MAT-STEEL-001",
    item_name: "MS Structural Steel",
    item_description: "Structural steel sections for industrial installation.",
    item_specification: "IS 2062, E250 grade",
    hsn_code: "7216",
    item_type: ids.itemType.inventory,
    item_parent_category: ids.category.materials,
    item_category: ids.category.steel,
    unit_id: ids.unit.kilogram,
    sales_qty: 1,
    sales_currency_id: ids.currency,
    sales_rate: 85,
    purchase_qty: 1,
    purchase_currency_id: ids.currency,
    purchase_rate: 78,
    tax_id: ids.tax.gst,
    status: "active",
  },
  {
    item_id: ids.item.cement,
    item_code: "MAT-CEMENT-053",
    item_name: "OPC 53 Grade Cement",
    item_description: "Cement for foundation and equipment bases.",
    item_specification: "OPC 53 grade, 50 kg bag",
    hsn_code: "2523",
    item_type: ids.itemType.inventory,
    item_parent_category: ids.category.materials,
    item_category: ids.category.cement,
    unit_id: ids.unit.each,
    sales_qty: 1,
    sales_currency_id: ids.currency,
    sales_rate: 430,
    purchase_qty: 1,
    purchase_currency_id: ids.currency,
    purchase_rate: 405,
    tax_id: ids.tax.gst,
    status: "active",
  },
  {
    item_id: ids.item.labour,
    item_code: "SVC-MECH-001",
    item_name: "Mechanical Installation Labour",
    item_description: "Skilled mechanical installation service.",
    hsn_code: "998732",
    item_type: ids.itemType.service,
    item_parent_category: ids.category.services,
    item_category: ids.category.services,
    unit_id: ids.unit.hour,
    sales_qty: 1,
    sales_currency_id: ids.currency,
    sales_rate: 1200,
    purchase_qty: 1,
    purchase_currency_id: ids.currency,
    purchase_rate: 950,
    tax_id: ids.tax.gst,
    status: "active",
  },
];

const documents: SeedDocument[] = [
  {
    id: 401,
    quotation_id: 401,
    quotation_date: "2026-10-01",
    document_no: "QT-2026-041",
    document_type: "quotation",
    party_id: ids.customer.aarav,
    ...commonDocument,
    valid_until: "2026-10-31",
    status: "sent",
  },
  {
    id: 501,
    sales_order_id: 501,
    sales_order_date: "2026-09-01",
    document_no: "SO-2026-018",
    document_type: "sales_order",
    party_id: ids.customer.aarav,
    ...commonDocument,
    grand_total: 10030,
    customer_po_no: "PO-CUST-2026-001",
    customer_po_date: "2026-09-01",
    expected_delivery_date: "2026-11-15",
    status: "approved",
  },
  {
    id: 503,
    proforma_id: 503,
    proforma_date: "2026-09-28",
    document_no: "PF-2026-009",
    document_type: "proforma",
    party_id: ids.customer.aarav,
    ...commonDocument,
    grand_total: 10030,
    valid_until: "2026-10-31",
    status: "approved",
  },
  {
    id: 504,
    delivery_challan_id: 504,
    document_no: "DC-2026-012",
    document_type: "delivery_challan",
    delivery_date: "2026-10-01",
    party_id: ids.customer.aarav,
    ...commonDocument,
    expected_delivery_date: "2026-10-15",
    status: "sent",
  },
  {
    id: 502,
    invoice_id: 502,
    invoice_date: "2026-10-01",
    document_no: "INV-2026-011",
    document_type: "sales_invoice",
    party_id: ids.customer.western,
    ...commonDocument,
    expected_delivery_date: "2026-10-15",
    grand_total: 10030,
    paid_amount: 5000,
    balance_due: 5030,
    status: "sent",
  },
  {
    id: 505,
    credit_note_id: 505,
    credit_note_date: "2026-10-02",
    document_no: "CN-2026-002",
    document_type: "credit_note",
    party_id: ids.customer.western,
    ...commonDocument,
    itemsDetails: [
      {
        item_id: ids.item.steel,
        description: "MS structural steel return",
        quantity: 10,
        hsn_code: "7216",
        unit_id: ids.unit.kilogram,
        unit_rate: 85,
        discount_percent: 0,
        discount_flat: 0,
        tax_ids: [ids.tax.gst],
      },
    ],
    notes: "Sample return adjustment against invoice INV-2026-011.",
    credit_note_total: 1003,
    status: "approved",
  },
  {
    id: 601,
    purchase_order_id: 601,
    purchase_order_date: "2026-09-28",
    document_no: "PO-2026-027",
    document_type: "purchase_order",
    party_id: ids.vendor.steelWorks,
    ...commonDocument,
    grand_total: 11044.8,
    itemsDetails: [
      {
        item_id: ids.item.steel,
        description: "MS structural steel",
        quantity: 120,
        hsn_code: "7216",
        unit_id: ids.unit.kilogram,
        unit_rate: 78,
        discount_percent: 0,
        discount_flat: 0,
        tax_ids: [ids.tax.gst],
      },
    ],
    status: "approved",
  },
  {
    id: 602,
    purchase_invoice_id: 602,
    pi_date: "2026-10-01",
    document_no: "PINV-2026-006",
    document_type: "purchase_invoice",
    party_id: ids.vendor.cementSupply,
    ...commonDocument,
    itemsDetails: [
      {
        item_id: ids.item.cement,
        description: "OPC 53 grade cement",
        quantity: 80,
        hsn_code: "2523",
        unit_id: ids.unit.each,
        unit_rate: 405,
        discount_percent: 0,
        discount_flat: 0,
        tax_ids: [ids.tax.gst],
      },
    ],
    payable_amount: 38232,
    grand_total: 38232,
    paid_amount: 0,
    balance_due: 38232,
    status: "approved",
  },
  {
    id: 603,
    debit_note_id: 603,
    debit_note_date: "2026-10-02",
    document_no: "DN-2026-001",
    document_type: "debit_note",
    party_id: ids.vendor.cementSupply,
    ...commonDocument,
    itemsDetails: [
      {
        item_id: ids.item.cement,
        description: "OPC 53 grade cement shortage",
        quantity: 2,
        hsn_code: "2523",
        unit_id: ids.unit.each,
        unit_rate: 405,
        discount_percent: 0,
        discount_flat: 0,
        tax_ids: [ids.tax.gst],
      },
    ],
    notes: "Sample shortage adjustment against purchase invoice PINV-2026-006.",
    debit_note_total: 955.8,
    status: "draft",
  },
];

const warehouses: Warehouse[] = [
  {
    id: ids.warehouse.ahmedabad,
    warehouse_id: ids.warehouse.ahmedabad,
    warehouse_name: "Ahmedabad Central Warehouse",
    address: "12 GIDC Industrial Estate, Vatva, Ahmedabad",
    status: "active",
  },
  {
    id: ids.warehouse.surat,
    warehouse_id: ids.warehouse.surat,
    warehouse_name: "Surat Project Store",
    address: "Plot 24, Sachin GIDC, Surat",
    status: "active",
  },
];

const batches: Batch[] = [
  {
    id: ids.batch.steel,
    batch_id: ids.batch.steel,
    item_id: ids.item.steel,
    item_name: "MS Structural Steel",
    item_code: "MAT-STEEL-001",
    batch_no: "STEEL-26-0901",
    mfg_date: "2026-08-15",
    expiry_date: "",
    status: "active",
  },
  {
    id: ids.batch.cement,
    batch_id: ids.batch.cement,
    item_id: ids.item.cement,
    item_name: "OPC 53 Grade Cement",
    item_code: "MAT-CEMENT-053",
    batch_no: "CEM-26-0925",
    mfg_date: "2026-09-20",
    expiry_date: "2027-03-20",
    status: "active",
  },
];

const stockSummary: StockSummary[] = [
  {
    id: 2201,
    item_id: ids.item.steel,
    item_name: "MS Structural Steel",
    item_code: "MAT-STEEL-001",
    warehouse_id: ids.warehouse.ahmedabad,
    warehouse_name: "Ahmedabad Central Warehouse",
    quantity: 240,
    current_stock: 240,
    unit_name: "Kilogram",
    reorder_level: 50,
  },
  {
    id: 2202,
    item_id: ids.item.cement,
    item_name: "OPC 53 Grade Cement",
    item_code: "MAT-CEMENT-053",
    warehouse_id: ids.warehouse.ahmedabad,
    warehouse_name: "Ahmedabad Central Warehouse",
    quantity: 160,
    current_stock: 160,
    unit_name: "Bag",
    reorder_level: 40,
  },
];

const stockLedger: StockLedgerEntry[] = [
  {
    id: 2301,
    transaction_date: "2026-09-30",
    item_id: ids.item.steel,
    item_name: "MS Structural Steel",
    warehouse_id: ids.warehouse.ahmedabad,
    warehouse_name: "Ahmedabad Central Warehouse",
    voucher_type: "GRN",
    voucher_no: "GRN-2026-008",
    transaction_type: "IN",
    quantity: 80,
    rate: 78,
    balance: 240,
    remarks: "Receipt against PO-2026-027",
  },
  {
    id: 2302,
    transaction_date: "2026-10-01",
    item_id: ids.item.steel,
    item_name: "MS Structural Steel",
    warehouse_id: ids.warehouse.ahmedabad,
    warehouse_name: "Ahmedabad Central Warehouse",
    voucher_type: "Site Issue",
    voucher_no: "ISS-2026-006",
    transaction_type: "OUT",
    quantity: 30,
    rate: 78,
    balance: 240,
    remarks: "Issued to Ahmedabad plant project",
  },
];

const stockTransfers: StockTransfer[] = [
  {
    transfer_id: 2401,
    transfer_no: "TRF-2026-004",
    transfer_date: "2026-10-02",
    from_warehouse_id: ids.warehouse.ahmedabad,
    from_warehouse_name: "Ahmedabad Central Warehouse",
    to_warehouse_id: ids.warehouse.surat,
    to_warehouse_name: "Surat Project Store",
    status: "in_transit",
    notes: "Replenishment for Surat fire protection project.",
    itemsDetails: [
      {
        transfer_detail_id: 24011,
        item_id: ids.item.cement,
        item_name: "OPC 53 Grade Cement",
        item_code: "MAT-CEMENT-053",
        batch_id: ids.batch.cement,
        batch_no: "CEM-26-0925",
        quantity: 30,
        unit_id: ids.unit.each,
        unit_name: "Bag",
      },
    ],
  },
];

const stockAdjustments: StockAdjustment[] = [
  {
    adjustment_id: 2501,
    adjustment_no: "ADJ-2026-003",
    adjustment_date: "2026-10-01",
    warehouse_id: ids.warehouse.ahmedabad,
    warehouse_name: "Ahmedabad Central Warehouse",
    reason: "Cycle count correction",
    status: "draft",
    notes: "Pending supervisor approval.",
    itemsDetails: [
      {
        adjustment_detail_id: 25011,
        item_id: ids.item.steel,
        item_name: "MS Structural Steel",
        item_code: "MAT-STEEL-001",
        batch_id: ids.batch.steel,
        batch_no: "STEEL-26-0901",
        adjustment_type: "decrease",
        quantity: 2,
        unit_id: ids.unit.kilogram,
        unit_name: "Kilogram",
      },
    ],
  },
];

export const erpSeed = {
  ids,
  companyProfile: {
    company_name: "Altrex Industrial Projects Pvt. Ltd.",
    trade_name: "Altrex Industrial Projects",
    registration_number: "U29100GJ2020PTC000001",
    gst_no: "24AABCA6789M1Z2",
    pan_no: "AABCA6789M",
    phone: "07940001000",
    email: "accounts@altrex.example",
    website: "https://altrex.example",
    contact_name: "Riya Mehta",
    address_line1: "4th Floor, Westgate Business Bay",
    address_line2: "SG Highway",
    city_id: ids.city,
    state_id: ids.state,
    country_id: ids.country,
    pincode: "380054",
    bank_id: 1,
    account_holder_name: "Altrex Industrial Projects Pvt. Ltd.",
    account_no: "DEMO0000123456",
    ifsc_code: "DEMO0000123",
    branch_name: "Ahmedabad Corporate Branch",
    opening_balance: 0,
  } satisfies ProfileValues,
  masters: {
    countries: [
      {
        country_id: ids.country,
        country_name: "India",
      } satisfies CountryValues & {
        country_id: number;
      },
    ],
    states: [
      {
        state_id: ids.state,
        state_name: "Gujarat",
        country_id: ids.country,
      } satisfies StateValues & { state_id: number },
    ],
    cities: [
      {
        city_id: ids.city,
        city_name: "Ahmedabad",
        state_id: ids.state,
      } satisfies CityValues & { city_id: number },
    ],
    currencies: [
      {
        currency_id: ids.currency,
        currency_name: "Indian Rupee",
        currency_code: "INR",
        symbol: "₹",
      } satisfies CurrencyValues & { currency_id: number },
    ],
    taxTypes: [
      {
        tax_id: ids.tax.gst,
        tax_name: "GST 18%",
        tax_percentage: 18,
        tax_type: "percentage",
        applicable_on: "both",
      },
      {
        tax_id: ids.tax.cess,
        tax_name: "Environmental Cess",
        tax_percentage: 2,
        tax_type: "percentage",
        applicable_on: "purchase",
      },
    ] satisfies (TaxTypeValues & { tax_id: number })[],
    units: [
      {
        unit_id: ids.unit.each,
        unit_name: "Each",
        unit_code: "EA",
        unit_type: "count",
      },
      {
        unit_id: ids.unit.kilogram,
        unit_name: "Kilogram",
        unit_code: "KG",
        unit_type: "weight",
      },
      {
        unit_id: ids.unit.hour,
        unit_name: "Hour",
        unit_code: "HR",
        unit_type: "time",
      },
    ] satisfies (UomValues & { unit_id: number })[],
    paymentTerms: [
      {
        payment_term_id: 1,
        term_name: "Net 30",
        due_days: 30,
        description: "Payment due 30 days from invoice date.",
      },
      {
        payment_term_id: 2,
        term_name: "50% advance",
        due_days: 0,
        description: "50% advance with balance due at delivery.",
      },
    ] satisfies (PaymentTermValues & { payment_term_id: number })[],
    banks: [
      {
        bank_id: 1,
        bank_name: "Demo National Bank",
        ifsc_code: "DEMO0000123",
        branch_name: "Ahmedabad Corporate Branch",
      } satisfies BankValues & { bank_id: number },
    ],
    branches: [
      {
        branch_id: 1,
        branch_name: "Ahmedabad Head Office",
        branch_code: "AMD-HO",
        address: "SG Highway, Ahmedabad, Gujarat",
      },
      {
        branch_id: 2,
        branch_name: "Surat Project Office",
        branch_code: "SRT-PO",
        address: "Sachin GIDC, Surat, Gujarat",
      },
    ],
    departments: [
      {
        department_id: 1,
        department_name: "Projects",
        description: "Project delivery and site operations.",
      },
      {
        department_id: 2,
        department_name: "Accounts",
        description: "Receivables, payables, and financial reporting.",
      },
      {
        department_id: 3,
        department_name: "Stores",
        description: "Inventory, warehouse, and procurement operations.",
      },
    ],
    designations: [
      {
        designation_id: 1,
        designation_name: "Project Manager",
        description: "Owns project schedule, cost, and customer coordination.",
      },
      {
        designation_id: 2,
        designation_name: "Project Engineer",
        description: "Coordinates technical delivery at project sites.",
      },
      {
        designation_id: 3,
        designation_name: "Accounts Executive",
        description: "Processes invoices and payment records.",
      },
    ],
    holidays: [
      {
        holiday_id: 1,
        holiday_name: "Gandhi Jayanti",
        holiday_date: "2026-10-02",
      },
      { holiday_id: 2, holiday_name: "Diwali", holiday_date: "2026-11-08" },
      {
        holiday_id: 3,
        holiday_name: "Republic Day",
        holiday_date: "2027-01-26",
      },
    ],
    shifts: [
      {
        shift_id: 1,
        shift_name: "General",
        start_time: "09:00",
        end_time: "18:00",
      },
      {
        shift_id: 2,
        shift_name: "Site Day Shift",
        start_time: "08:00",
        end_time: "17:00",
      },
    ],
    financialYears: [
      {
        financial_year_id: 1,
        year_name: "FY 2026-27",
        start_date: "2026-04-01",
        end_date: "2027-03-31",
        is_active: true,
      },
      {
        financial_year_id: 2,
        year_name: "FY 2025-26",
        start_date: "2025-04-01",
        end_date: "2026-03-31",
        is_active: false,
      },
    ],
    costCenters: [
      {
        cost_center_id: 1,
        cost_center_name: "Ahmedabad Projects",
        cost_center_code: "CC-AMD-PRJ",
        description: "Project operations based in Ahmedabad.",
      },
      {
        cost_center_id: 2,
        cost_center_name: "Surat Projects",
        cost_center_code: "CC-SRT-PRJ",
        description: "Project operations based in Surat.",
      },
      {
        cost_center_id: 3,
        cost_center_name: "Corporate Accounts",
        cost_center_code: "CC-CORP-ACC",
        description: "Central finance and administration.",
      },
    ],
    chartOfAccounts: [
      {
        account_id: 1,
        account_name: "Cash at Bank",
        account_code: "1001",
        account_type: "asset",
      },
      {
        account_id: 2,
        account_name: "Trade Receivables",
        account_code: "1101",
        account_type: "asset",
      },
      {
        account_id: 3,
        account_name: "Trade Payables",
        account_code: "2001",
        account_type: "liability",
      },
      {
        account_id: 4,
        account_name: "Project Revenue",
        account_code: "4001",
        account_type: "income",
      },
      {
        account_id: 5,
        account_name: "Direct Material Expense",
        account_code: "5001",
        account_type: "expense",
      },
    ],
    documentTypes: [
      { doc_type_id: 1, document_type_name: "Quotation" },
      { doc_type_id: 2, document_type_name: "Sales Order" },
      { doc_type_id: 3, document_type_name: "Proforma Invoice" },
      { doc_type_id: 4, document_type_name: "Delivery Challan" },
      { doc_type_id: 5, document_type_name: "Sales Invoice" },
      { doc_type_id: 6, document_type_name: "Purchase Order" },
      { doc_type_id: 7, document_type_name: "Purchase Invoice" },
      { doc_type_id: 8, document_type_name: "Credit Note" },
      { doc_type_id: 9, document_type_name: "Debit Note" },
    ],
    documentSeries: [
      {
        sequence_id: 1,
        series_name: "Quotation 2026",
        prefix: "QT-2026-",
        starting_number: 1,
        current_number: 42,
        document_type_id: 1,
        type_name: "Quotation",
      },
      {
        sequence_id: 2,
        series_name: "Sales Order 2026",
        prefix: "SO-2026-",
        starting_number: 1,
        current_number: 19,
        document_type_id: 2,
        type_name: "Sales Order",
      },
      {
        sequence_id: 3,
        series_name: "Sales Invoice 2026",
        prefix: "INV-2026-",
        starting_number: 1,
        current_number: 12,
        document_type_id: 5,
        type_name: "Sales Invoice",
      },
      {
        sequence_id: 4,
        series_name: "Purchase Order 2026",
        prefix: "PO-2026-",
        starting_number: 1,
        current_number: 28,
        document_type_id: 6,
        type_name: "Purchase Order",
      },
      {
        sequence_id: 5,
        series_name: "Purchase Invoice 2026",
        prefix: "PINV-2026-",
        starting_number: 1,
        current_number: 7,
        document_type_id: 7,
        type_name: "Purchase Invoice",
      },
    ],
    creditDebitReasons: [
      {
        reason_id: 1,
        reason_name: "Goods returned",
        form_type: "credit",
        status: "active",
        description: "Customer returned goods in saleable condition.",
      },
      {
        reason_id: 2,
        reason_name: "Rate difference",
        form_type: "both",
        status: "active",
        description: "Adjustment for an agreed price variance.",
      },
      {
        reason_id: 3,
        reason_name: "Purchase shortage",
        form_type: "debit",
        status: "active",
        description: "Supplier quantity shortage recorded at receipt.",
      },
    ],
  },
  auth: {
    roles: [
      {
        role_id: 1,
        role_name: "Administrator",
        description: "Full access to company ERP modules.",
        is_deleted: false,
      },
      {
        role_id: 2,
        role_name: "Project Manager",
        description: "Project delivery, procurement, and reporting access.",
        is_deleted: false,
      },
      {
        role_id: 3,
        role_name: "Accounts Executive",
        description: "Sales, purchase, and financial document access.",
        is_deleted: false,
      },
    ] satisfies Role[],
    users: [
      {
        user_id: 1,
        id: 1,
        firstName: "Riya",
        lastName: "Mehta",
        email: "riya.mehta@altrex.example",
        phone: "9876500001",
        roleId: 1,
        role_name: "Administrator",
        status: "active",
      },
      {
        user_id: 11,
        id: 11,
        firstName: "Arjun",
        lastName: "Desai",
        email: "arjun.desai@altrex.example",
        phone: "9876500011",
        roleId: 2,
        role_name: "Project Manager",
        status: "active",
      },
      {
        user_id: 12,
        id: 12,
        firstName: "Kavya",
        lastName: "Patel",
        email: "kavya.patel@altrex.example",
        phone: "9876500012",
        roleId: 2,
        role_name: "Project Manager",
        status: "active",
      },
      {
        user_id: 13,
        id: 13,
        firstName: "Dev",
        lastName: "Shah",
        email: "dev.shah@altrex.example",
        phone: "9876500013",
        roleId: 3,
        role_name: "Accounts Executive",
        status: "active",
      },
      {
        user_id: 14,
        id: 14,
        firstName: "Nisha",
        lastName: "Trivedi",
        email: "nisha.trivedi@altrex.example",
        phone: "9876500014",
        roleId: 2,
        role_name: "Project Manager",
        status: "active",
      },
    ] satisfies User[],
    rolePermissions: [
      {
        permission_name: "dashboard:read",
        module_name: "dashboard",
        is_allowed: true,
      },
      {
        permission_name: "customers:read",
        module_name: "customers",
        is_allowed: true,
      },
      ...[
        ["lead:view", "CRM"],
        ["lead:create", "CRM"],
        ["lead:update", "CRM"],
        ["lead:delete", "CRM"],
        ["lead:status:update", "CRM"],
        ["lead:convert", "CRM"],
        ["lead_activity:view", "CRM"],
        ["lead_activity:create", "CRM"],
        ["lead_source:view", "CRM"],
        ["lead_source:create", "CRM"],
        ["industry:view", "CRM"],
        ["industry:create", "CRM"],
        ["follow_up:view", "CRM"],
      ].map(([permission_name, module_name]) => ({
        permission_name,
        module_name,
        is_allowed: true,
      })),
    ],
    userPermissions: [
      {
        user_id: 11,
        permissions: [
          {
            permission_name: "dashboard:read",
            module_name: "dashboard",
            is_allowed: true,
          },
          {
            permission_name: "customers:read",
            module_name: "customers",
            is_allowed: true,
          },
        ],
      },
    ],
  },
  parties: { customers, vendors },
  items: {
    types: [
      { item_type_id: ids.itemType.inventory, item_type_name: "Inventory" },
      { item_type_id: ids.itemType.service, item_type_name: "Service" },
    ] satisfies ItemType[],
    categories: [
      {
        category_id: ids.category.materials,
        category_name: "Materials",
        parent_category_id: null,
      },
      {
        category_id: ids.category.steel,
        category_name: "Structural Steel",
        parent_category_id: ids.category.materials,
      },
      {
        category_id: ids.category.cement,
        category_name: "Cement",
        parent_category_id: ids.category.materials,
      },
      {
        category_id: ids.category.services,
        category_name: "Installation Services",
        parent_category_id: null,
      },
    ] satisfies ItemCategory[],
    records: items,
  },
  documents: {
    all: documents,
    quotations: documents.filter(
      (document) => document.document_type === "quotation",
    ),
    salesOrders: documents.filter(
      (document) => document.document_type === "sales_order",
    ),
    proformas: documents.filter(
      (document) => document.document_type === "proforma",
    ),
    deliveryChallans: documents.filter(
      (document) => document.document_type === "delivery_challan",
    ),
    invoices: documents.filter(
      (document) => document.document_type === "sales_invoice",
    ),
    purchaseOrders: documents.filter(
      (document) => document.document_type === "purchase_order",
    ),
    purchaseInvoices: documents.filter(
      (document) => document.document_type === "purchase_invoice",
    ),
    creditNotes: documents.filter(
      (document) => document.document_type === "credit_note",
    ),
    debitNotes: documents.filter(
      (document) => document.document_type === "debit_note",
    ),
  },
  inventory: {
    warehouses,
    batches,
    stockSummary,
    stockLedger,
    stockTransfers,
    stockAdjustments,
  },
  projects: {
    list: projectSeed,
    detail: projectDetailSeed,
    financials: projectFinancialsSeed,
  },
  procurement: procurementSeed,
} as const;

export type ErpSeed = typeof erpSeed;
