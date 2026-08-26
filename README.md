# Altrex ERP

A **pnpm workspace monorepo** powering two Next.js 15 applications — the **Altrex ERP** (company-facing app) and the **Altrex Admin Panel** — sharing a single design system and API-client layer.

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
- **Auth & Session** — cookie-based auth proxied through a BFF Route Handler
- **Party Management** — Customers & Vendors (with address/contact repeaters)
- **Item Management** — Item Types, Categories, and Items (dual sales/purchase pricing)
- **Sales Documents** — Quotations, Sales Orders, Proforma Invoices, Sales Invoices
- **Purchase Documents** — Purchase Orders, Purchase Invoices
- **Masters** — 18+ reference-data masters (Countries/States/Cities, Currencies, Tax Types, UOM, Financial Years, Payment Terms, Banks, Departments, Branches, etc.)
- **Users, Roles & Permissions** — role-based access with per-user permission overrides

### `apps/admin` — Altrex Admin Panel
Super-admin application for managing tenants:
- **Admin Auth** — separate admin login
- **Company Management** — create companies (triggers full tenant DB provisioning), deactivate, or hard-delete

---

## Packages

### `packages/ui`
Shared design system consumed by both apps. Exports:
- `@altrex/ui` — React components (re-exported shadcn primitives + composite components)
- `@altrex/ui/tokens` — Design tokens
- `@altrex/ui/styles.css` — Base stylesheet

### `packages/api-client`
Shared data-fetching layer:
- `apiClient` — `fetch` wrapper (same-origin BFF, credentials included, error normalization)
- `createResourceHooks()` — factory generating TanStack Query hooks (list, detail, create, update, delete) for any resource endpoint — used by every master and CRUD module so no boilerplate is hand-written per feature

### `packages/config`
Shared TypeScript `tsconfig.base.json` presets extended by each app/package.

---

## Getting Started

**Prerequisites:** Node.js >= 20.9, Corepack enabled.

```bash
# Enable Corepack (once per machine) — ensures the pinned pnpm version is used
corepack enable

# Install all workspace dependencies
pnpm install

# Start the ERP app in dev mode (Turbopack)
pnpm dev

# Start the Admin Panel
pnpm --filter @altrex/admin dev
```

The ERP app runs on http://localhost:3000 by default.

---

## Environment Variables

Each app has its own `.env.local`. Copy the example and fill in your values:

```bash
# apps/erp
cp apps/erp/.env.example apps/erp/.env.local

# apps/admin
cp apps/admin/.env.example apps/admin/.env.local
```

| Variable | Used in | Purpose |
|---|---|---|
| `BACKEND_URL` | both apps | Express API base URL (e.g. `http://localhost:4500`) |

The frontend **never** calls the backend directly — all requests go through the BFF proxy at `app/api/[...path]/route.ts`, which forwards cookies both ways. `BACKEND_URL` is only read server-side.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start `apps/erp` in dev mode |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Run `tsc --noEmit` across all packages |
| `pnpm lint` | Biome check (no auto-fix) |
| `pnpm format` | Biome check with auto-fix |

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
