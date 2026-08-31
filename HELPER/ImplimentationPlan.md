# implementationplan.md — Altrex ERP Implementation Plan

> This is the working task list. Check items off as they're completed. Do not reorder phases without a documented reason added to §5 (Open Questions / Deviations).

---

## 1. Principles to Hold Throughout Development

1. **Feature-based, not page-based.** Every unit of work lives in `features/<domain>/<name>/` per `architecture_doc.md`. If a task description says "build the X page," the actual work product is a feature folder that the route in `app/` merely imports.
2. **No hand-written CRUD boilerplate.** Any of the 18+ masters or any simple resource uses the factory in `architecture_doc.md` §3.1. If you're about to write a fourth nearly-identical `useEffect`+`fetch` block, stop.
3. **The master document-form template is one template, six consumers.** Quotation/SO/Proforma/Invoice/PO/PurchaseInvoice must not visually or structurally diverge from each other without a documented reason — check `design.md` §7 and `modules.md` §6–7 before adding a one-off variation.
4. **Design tokens only — no inline magic numbers.** Every spacing, radius, and color value comes from `packages/ui/tokens`. If a value isn't there, add it to the token set first (and flag it — token sets shouldn't grow silently).
5. **Permission-aware by default.** Every mutating UI action checks `config/permissions.ts` before rendering, not after clicking.
6. **The BFF proxy is mandatory, not optional.** No feature calls the Express backend directly from client code — always through `/api/...` on the same origin, per `architecture_doc.md` §4.
7. **Status fields (🔮/🚧/✅ in `modules.md`) gate what gets built.** Don't build UI against a 🔮 module's guessed shape — wait for it to become ✅ and get documented first.

---

## 2. Build Order

### Phase 0 — Workspace Setup
- [x] Initialize pnpm workspace (`apps/admin`, `apps/erp`, `packages/ui`, `packages/api-client`, `packages/config`)
- [x] Scaffold both Next.js apps (App Router, TypeScript, Tailwind) inside `apps/*`
- [x] Wire `packages/ui` as a shared shadcn/ui base consumed by both apps — **shadcn CLI run; Button, Input, Label, Card, Table, Badge, Progress, Separator generated into `packages/ui/src/components/ui/`; hand-rolled Button replaced; DataTable/StatusPill remain as wrappers over raw CSS (no shadcn Table primitive consumer yet)**
- [x] Install full toolset per `toolset.md` (foundation subset; feature-specific packages remain deferred until their phases)
- [x] Set up Biome, base `tsconfig`, and shared `packages/config` presets
- [x] Import initial documented design tokens into `packages/ui/tokens` (provisional values pending Figma export)

### Phase 1 — Foundation Shell
- [x] BFF proxy route handler (`app/api/[...path]/route.ts`) in both apps
- [x] `lib/api/client.ts`, `lib/api/endpoints.ts`, `lib/api/create-resource-hooks.ts`
- [x] `lib/query-client.ts` + TanStack Query provider wired into root layout
- [x] `stores/session-store.ts` + a `/me`-style session check hook
- [x] App shell layout: sidebar + topbar (per `design.md` §2), for both apps separately (different nav content)
- [x] Shared components: DataTable, StatusPill, FilterBar, StatCard (in `components/shared`, backed by `packages/ui`)
- [x] Theme foundation: system/light/dark modes with persisted preference and token-driven CSS variables in both apps
- [x] Theme toggle in each topbar, with dark-mode contrast verification against `ColorSystem.md`

### Phase 2 — Auth Flow (per the confirmed flow, both apps)
- [x] Admin App: Admin Register page (`/api/admin/register`) — first-run only
- [x] Admin App: Admin Login page (`/api/admin/login`)
- [x] Admin App: Company Registration form (`/api/admin/companies`) — **fully sectioned (4-step wizard: Company Details / Contact Details / Subscription Plan / Super Admin & Database), precise field-level validation per spec (regexes + exact error messages), GSAP step transitions, password strength meter, plan card selector, confirmPassword local-only field**
- [x] ERP App: Company Login page (`/api/auth/login`, accepts email-or-phone)
- [x] Session-store hydration + route protection — **frontend infrastructure implemented (useSessionCheck hook, SessionProvider, middleware). Backend session-check endpoints (`/api/admin/me` and `/api/auth/me`) added to endpoints.ts but need to be implemented on the backend.**
- [ ] **Flow note:** once an admin has registered *and* registered a company, subsequent visits show only the Login page — no register/company-register screens. Gate this via the `/me`-equivalent check server-side (via the BFF), not a client-only flag.

### Phase 3 — Admin Panel Core
- [ ] Companies list (search/filter/status)
- [ ] Company detail view
- [ ] Deactivate vs. Hard-delete — two visually and behaviorally distinct destructive flows

### Phase 4 — ERP Company Core
- [ ] Dashboard shell (stat cards + chart placeholders — real data wiring depends on later modules existing)
- [ ] Company Profile (three-section single form per `modules.md` §2.2)
- [ ] Users (list, add/edit, password change)
- [ ] Roles (CRUD)
- [ ] Permissions + Role Permissions matrix
- [ ] User Permissions matrix (override view)

### Phase 5 — Party Management
- [ ] Shared `PartyForm` (Customer/Vendor parametrized), Address/Contact-Person Repeater component
- [ ] Customers list + form + detail
- [ ] Vendors list + form + detail

### Phase 6 — Item Management
- [ ] Item Types (master pattern)
- [ ] Item Categories (tree/indented-list UI — not a flat table)
- [ ] Items (dual sales/purchase pricing form)

### Phase 7 — Masters Batch
- [ ] All 18+ masters from `modules.md` §8, each as a one-file `api.ts` calling the resource-hook factory + a shared Master CRUD list/modal template
- [ ] `LocationCascadeSelect` shared component (Country→State→City), reused in Party and Company Profile

### Phase 8 — Sales Documents
- [ ] Master document-form template component (shared skeleton, per `design.md` §7)
- [ ] Quotation
- [ ] Sales Order (with optional quotation reference)
- [ ] Sales Invoice
- [ ] *(Proforma once its backend status flips to ✅ in `modules.md`)*

### Phase 9 — Purchase Documents
- [ ] Purchase Order
- [ ] Purchase Invoice

### Phase 10 — Polish
- [ ] Dashboard real data wiring (stat cards, charts) now that transactional data exists
- [ ] Activity Log viewer component
- [ ] Table density toggle, empty/loading/error states audit across all list pages
- [ ] Accessibility pass against `design.md` §9
- [ ] Motion pass against `design.md` §8

---

## 3. Explicitly Deferred / Future Modules

These exist in `modules.md` as 🚧/🔮 and are **not** part of the phases above. When the backend confirms one is ready:
1. Update its status in `modules.md` first, with the real payload shape.
2. Slot it into the appropriate phase above (Sales Documents for Proforma/Delivery Challan/Credit Notes; Purchase Documents for Debit Notes; Item Management for Item Attributes/Warehouse/Item Images).
3. Reuse the master document-form template or resource-hook factory — do not architect it fresh.

Known future modules: Proforma (backend documented, not confirmed), Delivery Challan, Credit Notes, Debit Notes, Item Attributes, Warehouse Master, Item Images. Additionally, the Departments/Branch/Designations/Shift/Holiday masters exist ahead of any consuming HR module — an HR module is plausible future scope given these masters already exist.

---

## 4. Notes for Whoever Picks Up a Task Mid-Plan

- Always check `modules.md` for the exact field names before writing a `schema.ts` — do not infer field names from similar-looking modules.
- Always check `design.md` before choosing a component size, spacing value, or layout pattern.
- Always check `architecture_doc.md` before deciding where a new file goes.
- If a task genuinely doesn't fit any existing pattern in those three docs, stop and log it in §5 below rather than improvising silently.

---

## 5. Open Questions / Deviations Log

*(Append here as they arise — do not resolve silently and move on.)*

- [ ] What happens to a user's active session if the Financial Year rolls over mid-session? (Flagged during initial planning, not yet answered.)
- [ ] Confirm whether `jsonwebtoken` in the backend's dependency list is used for anything the frontend needs to know about, or is dead weight.
- [x] Initial ink and status token values are provisional because the original/Figma primitive export was not present; replace `packages/ui/tokens/colors.ts` values when the source export arrives.
- [x] Frontend session infrastructure implemented (useSessionCheck hook in `hooks/use-session-check.ts`, SessionProvider in `components/session-provider.tsx`, middleware in `middleware.ts` for both apps). Backend session-check endpoints (`/api/admin/me` and `/api/auth/me`) added to `lib/api/endpoints.ts` but need to be implemented on the backend to complete the session validation flow.
- [x] `companyCode` regex corrected: previous regex `/^[A-Za-z0-9][A-Za-z0-9_-]{1,19}$/` (allowed lowercase, 2–20 chars, hyphens/underscores) replaced with `/^[A-Z0-9]{2,10}$/` (uppercase-only, 2–10 chars) per spec §1.3. Auto-uppercase applied on `onChange` in the form so users aren't penalized for typing lowercase.
- [x] Dark mode bug fixed: `--altrex-hover` was `#243552` (blue/800 = `nav/active-bg` dark) in both `globals.css` files — made hovered-but-inactive sidebar items visually identical to the active item in dark mode. Changed to `#2a2a27` (neutral ink hover). Also added `--altrex-link` and `--altrex-danger-text` tokens in both apps; fixed hardcoded hex values in `.altrex-nav-link`, `.altrex-brand`, `.altrex-icon-button`, `.altrex-button-neutral`, `.altrex-form-error`, `.altrex-auth-link`.
- [x] Theme toggle UI enhancement: Changed theme toggle from simple cycle button to dropdown menu allowing users to directly select Light/Dark/System themes. Created `ThemeDropdown` component in both apps with proper state management and design token integration.