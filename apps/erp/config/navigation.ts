import {
  Boxes,
  Building,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Coins,
  CreditCard,
  Database,
  FileCheck,
  FileCode,
  FileMinus,
  FilePlus,
  FileSpreadsheet,
  FolderTree,
  GitFork,
  Globe,
  Hash,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  LucideIcon,
  Map,
  MapPin,
  Network,
  Package,
  Percent,
  Receipt,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Target,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Users2,
  Clock,
  Briefcase,
  BookOpen,
} from "lucide-react";

export interface NavChildItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  permission?: string;
  exact?: boolean;
}

export interface NavSubGroup {
  id: string;
  title: string;
  items: NavChildItem[];
}

export interface NavParentItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  permission?: string;
  children?: NavChildItem[];
  subGroups?: NavSubGroup[];
}

export const navigationConfig: NavParentItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    id: "sales",
    label: "Sales",
    icon: TrendingUp,
    children: [
      {
        id: "quotations",
        label: "Quotations",
        href: "/sales/quotations",
        icon: FileSpreadsheet,
      },
      {
        id: "sales-orders",
        label: "Sales Orders",
        href: "/sales/sales-orders",
        icon: ShoppingCart,
      },
      {
        id: "delivery-challans",
        label: "Delivery Challans",
        href: "/sales/delivery-challans",
        icon: Truck,
      },
      {
        id: "invoices",
        label: "Invoices",
        href: "/sales/invoices",
        icon: Receipt,
        badge: "Tax & Proforma",
      },
      {
        id: "credit-notes",
        label: "Credit Notes",
        href: "/sales/credit-notes",
        icon: FileMinus,
      },
    ],
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: ShoppingBag,
    children: [
      {
        id: "purchase-orders",
        label: "Purchase Orders",
        href: "/purchase/purchase-orders",
        icon: ClipboardList,
      },
      {
        id: "purchase-invoices",
        label: "Purchase Invoices",
        href: "/purchase/purchase-invoices",
        icon: FileCheck,
      },
      {
        id: "debit-notes",
        label: "Debit Notes",
        href: "/purchase/debit-notes",
        icon: FilePlus,
      },
    ],
  },
  {
    id: "parties",
    label: "Parties",
    icon: Users2,
    children: [
      {
        id: "customers",
        label: "Customers",
        href: "/parties/customers",
        icon: UserCheck,
      },
      {
        id: "vendors",
        label: "Vendors",
        href: "/parties/vendors",
        icon: Building,
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    children: [
      {
        id: "items",
        label: "Items",
        href: "/inventory/items",
        icon: Boxes,
      },
      {
        id: "item-categories",
        label: "Item Categories",
        href: "/inventory/categories",
        icon: FolderTree,
      },
      {
        id: "item-types",
        label: "Item Types",
        href: "/inventory/types",
        icon: Tag,
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    icon: ShieldCheck,
    children: [
      {
        id: "users",
        label: "Users",
        href: "/users",
        icon: Users,
        permission: "users:view",
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        href: "/roles",
        icon: ShieldCheck,
        permission: "roles:view",
      },
      {
        id: "profile",
        label: "Company Profile",
        href: "/profile",
        icon: Building2,
        permission: "company:profile:update",
      },
    ],
  },
  {
    id: "masters",
    label: "Masters",
    icon: Database,
    subGroups: [
      {
        id: "org-hr",
        title: "Organization & HR",
        items: [
          {
            id: "branches",
            label: "Branches",
            href: "/masters/branches",
            icon: GitFork,
          },
          {
            id: "departments",
            label: "Departments",
            href: "/masters/departments",
            icon: Network,
          },
          {
            id: "designations",
            label: "Designations",
            href: "/masters/designations",
            icon: Briefcase,
          },
          {
            id: "shifts",
            label: "Shifts",
            href: "/masters/shifts",
            icon: Clock,
          },
          {
            id: "holidays",
            label: "Holidays",
            href: "/masters/holidays",
            icon: CalendarDays,
          },
        ],
      },
      {
        id: "finance-banking",
        title: "Financial & Banking",
        items: [
          {
            id: "financial-years",
            label: "Financial Years",
            href: "/masters/financial-years",
            icon: CalendarRange,
          },
          {
            id: "currencies",
            label: "Currencies",
            href: "/masters/currencies",
            icon: Coins,
          },
          {
            id: "banks",
            label: "Bank Master",
            href: "/masters/banks",
            icon: Landmark,
          },
          {
            id: "payment-terms",
            label: "Payment Terms",
            href: "/masters/payment-terms",
            icon: CreditCard,
          },
          {
            id: "cost-centers",
            label: "Cost Centers",
            href: "/masters/cost-centers",
            icon: Target,
          },
          {
            id: "chart-of-accounts",
            label: "Chart of Accounts",
            href: "/masters/chart-of-accounts",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "tax-measurement",
        title: "Tax & Measurement",
        items: [
          {
            id: "tax-types",
            label: "Tax Types",
            href: "/masters/tax-types",
            icon: Percent,
          },
          {
            id: "uom",
            label: "Units of Measure (UOM)",
            href: "/masters/uom",
            icon: Ruler,
          },
          {
            id: "cr-dr-reasons",
            label: "Cr / Dr Reasons",
            href: "/masters/cr-dr-reasons",
            icon: HelpCircle,
          },
        ],
      },
      {
        id: "locations",
        title: "Locations",
        items: [
          {
            id: "countries",
            label: "Countries",
            href: "/masters/countries",
            icon: Globe,
          },
          {
            id: "states",
            label: "States",
            href: "/masters/states",
            icon: Map,
          },
          {
            id: "cities",
            label: "Cities",
            href: "/masters/cities",
            icon: MapPin,
          },
        ],
      },
      {
        id: "series-numbering",
        title: "Document Numbering",
        items: [
          {
            id: "document-types",
            label: "Document Types",
            href: "/masters/document-types",
            icon: FileCode,
          },
          {
            id: "document-series",
            label: "Document Series",
            href: "/masters/document-series",
            icon: Hash,
          },
        ],
      },
    ],
  },
];
