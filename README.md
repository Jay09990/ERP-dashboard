# Altrex ERP

A **pnpm workspace monorepo** powering two Next.js 15 applications — the **Altrex ERP** (company-facing app) and the **Altrex Admin Panel** — sharing a single design system and API-client layer. The frontend expects an Express API that exposes the `/api/*` routes used by the applications.

---

## Workspace Structure

```
altrex/
├── apps/
│   ├── admin/          # Altrex Admin Panel  — company/tenant management
│   └── erp/            # Altrex ERP           — day-to-day company operations
├── packages/
│   ├── ui/             # Shared component library (shadcn/ui + Tailwind design tokens)
│   ├── api-client/     # Shared fetch client, resource-hook factory, Zod schemas
│   └── config/         # Shared TypeScript base configs
├── HELPER/             # Architecture, module, design, and toolset documentation
├── pnpm-workspace.yaml
└── package.json
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router + Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (`packages/ui`) |
| Server state | TanStack Query |
| Client/UI state | Zustand |
| Tables | TanStack Table + TanStack Virtual |
| Forms & validation | react-hook-form + Zod |
| Icons | Lucide React |
| Charts | shadcn/ui Charts (Recharts) |
| Linting / Formatting | Biome |
| Package manager | pnpm 9 (via Corepack) |

---

## Apps

### `apps/erp` — Altrex ERP
The primary company application. Covers:
- **Auth & Session** — JWT login with a local token, a lightweight auth marker cookie, protected routes, and a BFF Route Handler
- **Party Management** — Customers & Vendors (with address/contact repeaters)
- **Item Management** — Item Types, Categories, and Items (dual sales/purchase pricing)
- **Sales Documents** — Quotations, Sales Orders, Proforma Invoices, Delivery Challans, Sales Invoices, Credit Notes
- **Purchase Documents** — Purchase Orders, Purchase Invoices, Debit Notes
- **Document workflow** — draft/approved/sent/cancelled status, line-item discounts, tax selection, round-off calculation, and document editing
- **Document printing** — browser print/PDF layouts with company, customer/vendor, address, tax, bank, terms, signature, and amount-in-words sections
- **Masters** — 18+ reference-data masters (Countries/States/Cities, Currencies, Tax Types, UOM, Financial Years, Payment Terms, Banks, Departments, Branches, etc.)
- **Users, Roles & Permissions** — role-based access with per-user permission overrides

### `apps/admin` — Altrex Admin Panel
Super-admin application for managing tenants:
- **Admin Auth** — separate admin login
- **Company Management** — create companies, open company details, deactivate, or hard-delete

---

## Packages

### `packages/ui`
Shared design system consumed by both apps. Exports:
- `@altrex/ui` — React components (re-exported shadcn primitives + composite components)
- `@altrex/ui/tokens` — Design tokens
- `@altrex/ui/styles.css` — Base stylesheet

### `packages/api-client`
Shared data-fetching layer:
- `apiClient` — typed same-origin request abstraction with credentials and error normalization
- `createResourceHooks()` — factory generating TanStack Query hooks (list, detail, create, update, delete) for any resource endpoint — used by every master and CRUD module so no boilerplate is hand-written per feature

The ERP and Admin apps also expose app-level API clients that attach the JWT `Authorization` header before requests are sent through the same-origin BFF.

### `packages/config`
Shared TypeScript `tsconfig.base.json` presets extended by each app/package.

---

## Getting Started

**Prerequisites:** Node.js >= 20.9, Corepack enabled, and a reachable backend API.

```bash
# Enable Corepack (once per machine) — ensures the pinned pnpm version is used
corepack enable

# Install all workspace dependencies
pnpm install

# Start the ERP app in dev mode
pnpm dev

# Start the Admin Panel
pnpm --filter @altrex/admin dev

# Run the production builds
pnpm build
```

The ERP app runs on http://localhost:3000 by default. When running both apps at the same time, assign the admin app a different port, for example:

```bash
pnpm --filter @altrex/admin dev -- --port 3001
```

---

## Environment Variables

Each app reads its own `.env.local`. Create the file manually in both apps:

```text
# apps/erp/.env.local
BACKEND_URL=http://localhost:4500

# apps/admin/.env.local
BACKEND_URL=http://localhost:4500
```

| Variable | Used in | Purpose |
|---|---|---|
| `BACKEND_URL` | both apps | Express API base URL, without the `/api` suffix (for example `http://localhost:4500`) |

The frontend calls same-origin `/api/*` URLs through the BFF proxy at `app/api/[...path]/route.ts`. The route handler forwards the request to `${BACKEND_URL}/api/*`, keeps the backend URL server-side, and passes request headers through. The JWT is stored in browser local storage by the auth flow; a non-sensitive marker cookie is used only for route gating.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start `apps/erp` in dev mode |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Run `tsc --noEmit` across all packages |
| `pnpm lint` | Biome check (no auto-fix) |
| `pnpm format` | Biome check with auto-fix |
| `pnpm --filter @altrex/erp dev` | Start only the ERP app |
| `pnpm --filter @altrex/admin dev` | Start only the Admin Panel |
| `pnpm --filter @altrex/erp typecheck` | Type-check the ERP app |
| `pnpm --filter @altrex/admin typecheck` | Type-check the Admin Panel |

---

## Architecture & Documentation

In-depth documentation lives in [`HELPER/`](./HELPER/):

| File | Purpose |
|---|---|
| [`ArchitectureDoc.md`](./HELPER/ArchitectureDoc.md) | Monorepo structure, feature-folder conventions, state-ownership rules, BFF proxy pattern |
| [`Modules.md`](./HELPER/Modules.md) | Module reference — every feature, its backend endpoints, payload shapes, and build status |
| [`Toolset.md`](./HELPER/Toolset.md) | Locked dependency decisions with rationale |
| [`Design.md`](./HELPER/Design.md) | UI/UX design system and component patterns |
| [`ColorSystem.md`](./HELPER/ColorSystem.md) | Color tokens and theming |
| [`ImplimentationPlan.md`](./HELPER/ImplimentationPlan.md) | Phased build roadmap |

> Read `ArchitectureDoc.md` before creating any new file — it defines where things go and why.

---

## Key Conventions

- **Feature-first structure** — all business logic lives in `features/<domain>/<feature>/`, never in `app/**/page.tsx`
- **No Server Actions** — mutations go through TanStack Query + BFF Route Handlers
- **No Redux** — TanStack Query owns server state; Zustand owns UI-only state
- **Cross-feature imports** always go through a feature's `index.ts` barrel — never import internal paths directly
- **Masters boilerplate** — use `createResourceHooks()` from `packages/api-client`; never hand-write CRUD hooks per master
- **Env vars** — `BACKEND_URL` only; never hardcode backend URLs in source
- **Authentication** — keep the access token in the existing auth helpers; do not read or write `localStorage` directly from feature components
- **Documents** — use the shared `DocumentForm` and `DocumentList` components for all document types so payloads, statuses, taxes, and print behavior stay consistent
- **Printing** — the current PDF action opens the browser print dialog; users should choose “Save as PDF” from the browser

## Current Document Flow

1. Create or edit a quotation, order, invoice, challan, proforma, or note.
2. Select the party, products, quantities, rates, discounts, and configured taxes.
3. Save the document. New documents start as `draft`; the status selector can change supported documents to `approved`, `sent`, or `cancelled`.
4. Use the document row’s print/PDF action to load the complete document and open the print layout.
5. In the browser print dialog, select **Save as PDF**.

Document printing depends on the detail endpoint returning the document’s items and tax details, the profile endpoint returning company data, and the configured master endpoints being available. Purchase documents resolve vendor data; sales documents resolve customer data.
