# architecture_doc.md — Altrex ERP Frontend Architecture

> Read this before creating any file. It defines *where things go and why*. If a file doesn't have an obvious home in this document, stop and ask — don't invent a new top-level folder.

---

## 0. What this is based on

This structure is a deliberate modernization of the pattern found in the reference project `indetrinic-itask` (a large production React/Redux app), adapted for our stack (Next.js App Router + TypeScript + TanStack Query + Zustand + shadcn/ui + pnpm). We kept what worked at scale and replaced what's now obsolete:

| Reference repo pattern | What it did | Our equivalent | Why changed |
|---|---|---|---|
| `pages/presentation/<Feature>/` per module | Co-located page + modals + interfaces + mock JSON per feature | `features/<domain>/<feature>/` | Same idea, kept — this scaled well to 100+ modules in the reference repo |
| `common/commonComponent/CommonRequestMaker.ts` + `CommonReduxSliceMaker.ts` | Factory functions generating repetitive API-call + Redux-slice boilerplate per resource | `lib/api/create-resource-hooks.ts` — a factory generating TanStack Query hooks per resource | Redux is gone in our stack; TanStack Query's cache replaces slices entirely. The *factory* idea (don't hand-write CRUD boilerplate 30 times) is the part worth keeping |
| `serverconfig/apiURLs.ts` + `axiosInstance.ts` | Centralized endpoint constants + one configured HTTP client | `lib/api/endpoints.ts` + `lib/api/client.ts` | Same pattern, kept — this is exactly right and shouldn't be reinvented per feature |
| `redux/slices/*` | Domain state slices | Removed | No global mutable client state needed for server data — TanStack Query owns it. Zustand only holds *UI* state (see §5) |
| `src/menu.ts` (one 28KB file) | Centralized nav/sidebar route + label + icon config | `config/navigation.ts` | Same pattern, kept, but split by app (admin vs ERP each have their own) |
| `routes/asideRoutes.tsx`, `contentRoutes.tsx` etc. | Manually centralized route registration | Next.js file-based routing under `app/` | App Router replaces manual route registries entirely — don't recreate one |
| Dummy/mock `.json` files sitting next to components | Placeholder data during dev | `mocks/` folder per feature, never imported in production code paths | Keeps fixtures from silently leaking into a real build |
| Inconsistent `Interface.ts` naming, no shared types folder | Ad-hoc | `types.ts` per feature + `types/` global folder for cross-feature shapes | Reference repo's biggest weakness — we fix it here |

**What we deliberately did NOT copy:** Redux entirely, CRA/Vite tooling, class-heavy Bootstrap component wrapping, and mixing mock data files into the same folder as production code without a naming firewall.

---

## 1. Top-level structure (pnpm workspace monorepo)

Both applications (Altrex Admin Panel, Altrex ERP) share one design system and one API-client layer, so this is a **pnpm workspace**, not two disconnected repos:

```
altrex/
├── apps/
│   ├── admin/                  # Altrex Admin Panel (Next.js app)
│   └── erp/                    # Altrex ERP — Company App (Next.js app)
├── packages/
│   ├── ui/                     # Shared shadcn-based component library + design tokens
│   ├── api-client/             # Shared fetch client, resource-hook factory, zod schemas
│   └── config/                 # Shared eslint, tsconfig, tailwind config presets
├── docs/                       # This file + all other *.md governance docs
├── pnpm-workspace.yaml
├── package.json
└── turbo.json                  # (only if build orchestration across apps becomes a pain point — start without it)
```

Why a monorepo instead of two repos: the Admin Panel and ERP app share ~80% of their design system (Section 3 of the design brief already established this) and will share the resource-hook factory pattern below. Duplicating `packages/ui` into two separate repos guarantees drift within a month.

---

## 2. Inside each app (`apps/erp/src/` — same shape applies to `apps/admin/src/`)

```
src/
├── app/                        # Next.js App Router — ROUTES ONLY, no business logic
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + topbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── parties/
│   │   │   ├── customers/page.tsx
│   │   │   └── vendors/page.tsx
│   │   ├── items/...
│   │   ├── quotations/...
│   │   └── masters/<master-name>/page.tsx
│   └── api/
│       └── [...path]/route.ts  # BFF proxy — forwards to Express backend, see §4
│
├── features/                   # ALL business logic and feature UI lives here
│   ├── auth/
│   ├── parties/
│   │   ├── customers/
│   │   └── vendors/
│   ├── items/
│   │   ├── item-types/
│   │   ├── item-categories/
│   │   └── items/
│   ├── sales-documents/
│   │   ├── quotations/
│   │   ├── sales-orders/
│   │   ├── proforma/
│   │   └── invoices/
│   ├── purchase-documents/
│   │   ├── purchase-orders/
│   │   └── purchase-invoices/
│   ├── masters/                # one subfolder per master (18+), see §3.1
│   ├── users/
│   ├── roles-permissions/
│   └── dashboard/
│
├── components/
│   ├── ui/                     # Re-exported from packages/ui — DO NOT fork/edit here
│   └── shared/                 # App-specific composite components used across features:
│                                # DataTable, StatCard, StatusPill, FilterBar,
│                                # DocumentLineItemsTable, AddressRepeater, PermissionMatrix
│
├── lib/
│   ├── api/
│   │   ├── client.ts            # fetch wrapper — base URL, credentials:'include', error normalization
│   │   ├── endpoints.ts         # every backend URL path as a named constant, nothing hardcoded elsewhere
│   │   └── create-resource-hooks.ts   # the factory — see §3.1
│   ├── query-client.ts          # TanStack Query client instance + default options
│   └── utils.ts                 # cn(), formatters, date helpers
│
├── stores/                      # Zustand — UI STATE ONLY, never server data
│   ├── ui-store.ts               # sidebar collapsed, table density, active FY selector
│   └── session-store.ts          # cached /me response (permissions, user, company) for UI gating
│
├── config/
│   ├── navigation.ts             # sidebar structure — replaces reference repo's menu.ts
│   └── permissions.ts            # permission-key constants, matched against backend's `module:action` strings
│
├── hooks/                        # generic, feature-agnostic hooks only (usePermission, useDebounce)
│
└── types/                        # cross-feature shared types only (Address, ContactPerson, Money, PaginatedResponse<T>)
```

**Rule:** if a type, hook, or component is used by exactly one feature, it lives inside that feature's folder, not in the global `types/`, `hooks/`, or `components/shared/`. Promote to global only on the second real usage.

---

## 3. Anatomy of one feature folder

Every feature — whether a master, a party type, or a transactional document — follows the same internal shape. Example: `features/parties/customers/`

```
customers/
├── api.ts              # calls create-resource-hooks() factory, exports useCustomers, useCustomer, useCreateCustomer, etc.
├── schema.ts            # zod schema — the single source of truth for shape + validation
├── types.ts              # z.infer<> exports + any extra local types
├── columns.tsx            # TanStack Table column defs for the list view
├── components/
│   ├── CustomerList.tsx       # composes DataTable + FilterBar + columns.tsx
│   ├── CustomerFormDrawer.tsx # add/edit form using react-hook-form + schema.ts
│   └── CustomerDetail.tsx     # detail/view screen (transaction history tab, etc.)
├── mocks/                # dev-only fixtures, NEVER imported outside Storybook/tests
└── index.ts              # barrel export — this is the only import path other features use
```

**Cross-feature imports always go through `index.ts`.** Never `import { CustomerFormDrawer } from '@/features/parties/customers/components/CustomerFormDrawer'` from outside the feature — always `import { CustomerFormDrawer } from '@/features/parties/customers'`.

### 3.1 The resource-hook factory (kills 18-master boilerplate before it starts)

This is the direct translation of the reference repo's `CommonRequestMaker.ts` + `CommonReduxSliceMaker.ts` combo into our stack:

```ts
// lib/api/create-resource-hooks.ts
export function createResourceHooks<T, TCreate, TUpdate>(resourceKey: string, endpoint: string) {
  return {
    useList: (params?) => useQuery({ queryKey: [resourceKey, 'list', params], queryFn: () => apiClient.get(endpoint, params) }),
    useDetail: (id: string) => useQuery({ queryKey: [resourceKey, id], queryFn: () => apiClient.get(`${endpoint}/${id}`) }),
    useCreate: () => useMutation({ mutationFn: (body: TCreate) => apiClient.post(endpoint, body), onSuccess: () => queryClient.invalidateQueries([resourceKey]) }),
    useUpdate: () => useMutation({ mutationFn: ({ id, body }: { id: string; body: TUpdate }) => apiClient.put(`${endpoint}/${id}`, body), onSuccess: () => queryClient.invalidateQueries([resourceKey]) }),
    useDelete: () => useMutation({ mutationFn: (id: string) => apiClient.delete(`${endpoint}/${id}`), onSuccess: () => queryClient.invalidateQueries([resourceKey]) }),
  };
}
```

Every one of the 18+ masters (`country_mst`, `currency_mst`, `tax_types`, `units_of_measure`, `payment_terms`, `bank_mst`, `departments`, `branch_mst`, `designations`, `shift_master`, `holiday_master`, `cost_centers`, `document_type`, `document_series`, etc.) gets a `features/masters/<name>/api.ts` that is **one call to this factory**, not a hand-written set of five hooks. If you find yourself writing a `useEffect` + manual `fetch` for a master, stop — you're rebuilding something this factory already does.

Transactional documents (Quotation/SO/Proforma/Invoice/PO/PurchaseInvoice) use the same factory for their base CRUD, then layer document-specific logic (line-item totals, tax computation) on top in their own `useQuotationTotals.ts`-style local hook — the factory handles persistence, not business math.

---

## 4. The BFF proxy (`app/api/[...path]/route.ts`)

Because the backend is Express + `express-session` (cookie-based, not JWT), the browser must never call `localhost:4500` directly across environments. One catch-all Route Handler per app proxies every request to the Express backend, forwarding cookies both ways:

```ts
// app/api/[...path]/route.ts
export async function GET(req: NextRequest, { params }) { return proxy(req, params.path); }
export async function POST(req: NextRequest, { params }) { return proxy(req, params.path); }
// ...PUT, DELETE identically

async function proxy(req: NextRequest, path: string[]) {
  const res = await fetch(`${process.env.BACKEND_URL}/api/${path.join('/')}`, {
    method: req.method,
    headers: { cookie: req.headers.get('cookie') ?? '' },
    body: req.method !== 'GET' ? await req.text() : undefined,
  });
  const response = new NextResponse(await res.text(), { status: res.status });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);
  return response;
}
```

`lib/api/client.ts` always calls `/api/...` (same-origin), never `http://localhost:4500` directly. `BACKEND_URL` is an env var, different per environment — never hardcoded (this fixes the `API_BASE = "http://localhost:4500"` hardcoding seen in earlier draft code).

---

## 5. State ownership — no ambiguity

| Kind of state | Owner | Never do this |
|---|---|---|
| Anything from the backend (parties, items, documents, masters) | TanStack Query | Don't mirror it into Zustand "for convenience" |
| Auth/session/permission snapshot | `stores/session-store.ts`, hydrated from a `/me` proxy call | Don't gate UI on `sessionStorage` flags |
| Sidebar collapsed, table density, active Financial Year selector | `stores/ui-store.ts` (Zustand) | Don't lift this into URL state or context unless it needs to survive a refresh via URL sharing |
| Form-in-progress values | react-hook-form's internal state | Don't duplicate into Zustand |
| Current filters/pagination on a list page | URL search params (`useSearchParams`) | Don't keep in local `useState` — filters should be shareable/bookmarkable links |

---

## 6. Naming conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Everything else (utils, schema, api, types): `camelCase.ts` or `kebab-case.ts` — pick one per package and stay consistent (this repo uses `camelCase.ts`)
- Route segments (folders under `app/`): `kebab-case`
- Zod schemas: `<entity>Schema`, inferred type `<Entity>` (e.g. `customerSchema` → `Customer`)

## 7. Anti-patterns carried forward as warnings (seen in the reference repo, avoid repeating)

1. Don't scatter `.json` mock/dummy data files directly beside production components with no naming distinction — always under a feature's `mocks/` folder.
2. Don't let one feature folder balloon past ~15 files without splitting into subfolders (the reference repo's `ApplicationMaster` folder is a cautionary tale — it grew unchecked).
3. Don't hand-roll a new state-management pattern per feature. If the resource-hook factory doesn't fit a case, that's a signal to extend the factory, not bypass it.
4. Don't put business logic in `app/**/page.tsx` files — they should be near-single-line compositions of a feature's exported component.