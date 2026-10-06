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
- [ ] Initialize pnpm workspace (`apps/admin`, `apps/erp`, `packages/ui`, `packages/api-client`, `packages/config`)
- [ ] Scaffold both Next.js apps (App Router, TypeScript, Tailwind) inside `apps/*`
- [ ] Wire `packages/ui` as a shared shadcn/ui base consumed by both apps
- [ ] Install full toolset per `toolset.md`
- [ ] Set up Biome, base `tsconfig`, and shared `packages/config` presets
- [ ] Import design tokens from the Figma variable set into `packages/ui/tokens`

### Phase 1 — Foundation Shell
- [ ] BFF proxy route handler (`app/api/[...path]/route.ts`) in both apps
- [ ] `lib/api/client.ts`, `lib/api/endpoints.ts`, `lib/api/create-resource-hooks.ts`
- [ ] `lib/query-client.ts` + TanStack Query provider wired into root layout
- [ ] `stores/session-store.ts` + a `/me`-style session check hook
- [ ] App shell layout: sidebar + topbar (per `design.md` §2), for both apps separately (different nav content)
- [ ] Shared components: DataTable, StatusPill, FilterBar, StatCard (in `components/shared`, backed by `packages/ui`)

### Phase 2 — Auth Flow (per the confirmed flow, both apps)
- [ ] Admin App: Admin Register page (`/api/admin/register`) — first-run only
- [ ] Admin App: Admin Login page (`/api/admin/login`)
- [ ] Admin App: Company Registration form (`/api/admin/companies`) — accessible only immediately post-registration, never shown again afterward (see note below)
- [ ] ERP App: Company Login page (`/api/auth/login`, accepts email-or-phone)
- [ ] Session-store hydration + route protection (redirect unauthenticated access to `/login` in both apps)
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
- [x] Shared `PartyForm` (Customer/Vendor parametrized), Address/Contact-Person Repeater component
- [x] Customers list + form + detail
- [x] Vendors list + form + detail

### Phase 6 — Item Management
- [x] Item Types (master pattern)
- [x] Item Categories (tree/indented-list UI — not a flat table)
- [x] Items (dual sales/purchase pricing form)
- [x] Inventory Module:
  - [x] Warehouse Master (CRUD table with drawer form, search/status filter, CSV export)
  - [x] Item Batches (CRUD table with item dropdown, batch number, mfg/expiry dates, CSV export)
  - [x] Stock Summary (KPI metrics, warehouse filter, search, CSV export)
  - [x] Stock Ledger (Filterable movement log, color-coded IN/OUT badges, CSV export)
  - [x] Stock Transfers (Multi-item inter-warehouse transfer, workflow status actions, CSV export)
  - [x] Stock Adjustments (Multi-item adjustments, approval workflow, CSV export)

### Phase 7 — Masters Batch
- [x] All 18+ masters from `modules.md` §8, each as a one-file `api.ts` calling the resource-hook factory + a shared Master CRUD list/modal template
- [x] `LocationCascadeSelect` shared component (Country→State→City), reused in Party and Company Profile

### Phase 8 — Sales Documents
- [x] Master document-form template component (shared skeleton, per `design.md` §7)
- [x] Quotation
- [x] Sales Order (with optional quotation reference)
- [x] Sales Invoice
- [x] *(Proforma once its backend status flips to ✅ in `modules.md`)*

### Phase 9 — Purchase Documents
- [x] Purchase Order
- [x] Purchase Invoice

### Phase 10 — Polish
- [ ] Dashboard real data wiring (stat cards, charts) now that transactional data exists
- [ ] Activity Log viewer component
- [ ] Table density toggle, empty/loading/error states audit across all list pages
- [ ] Accessibility pass against `design.md` §9
- [ ] Motion pass against `design.md` §8

### Phase 11 — Project Management & Procurement
- [x] Project register with status/party filters, project create/edit/delete, sales-order conversion, and documented status transitions
- [x] Project details with financial summary, site, BOQ/budget, milestone, task, DPR, and document sections
- [x] Project requisitions with list/detail, create, and approve/cancel actions
- [x] Goods receipts (GRN) with list/detail, create, and approve/cancel actions
- [x] Project site issues with list/detail, create, and approve/cancel actions
- [x] Add API endpoint constants, sidebar navigation, and document the feature
- [x] Replace project and procurement JSON-array text entry with labeled repeatable item forms
- [x] Replace raw procurement JSON detail output with readable record summaries and item tables
- [ ] Validate all request/response shapes and child-route methods against a running backend; the API server is outside this repository
- [ ] Replace manually entered reference IDs with searchable selectors when backend lookup contracts are confirmed
- [ ] Add permission gating for project/procurement mutations once the backend permission keys are documented
- [ ] Confirm project document upload/storage contract; current UI accepts document metadata and a file URL, not binary uploads

### Phase 12 — CRM Leads
- [x] Lead list, create/edit, documented status transitions, loss reason, and customer conversion
- [x] Lead activity history and activity logging
- [x] Lead source and industry lists/create forms
- [x] Follow-up list with documented due, overdue, today, and upcoming scopes
- [x] Add CRM permission keys, hide unauthorized actions, and protect the Leads navigation entry
- [x] Include CRM permission catalog entries in role and user permission matrices when the backend catalog is stale
- [ ] Confirm lead source/industry update/delete routes and provide selectors for documented references
- [ ] Confirm the follow-up list response shape and whether it returns lead records or activity records
- [ ] Implement Enquiry after its request and response payload contract is documented

---

## 3. Explicitly Deferred / Future Modules

These exist in `modules.md` as 🚧/🔮 and are **not** part of the phases above. When the backend confirms one is ready:
1. Update its status in `modules.md` first, with the real payload shape.
2. Slot it into the appropriate phase above (Sales Documents for Proforma/Delivery Challan/Credit Notes; Purchase Documents for Debit Notes; Item Management for Item Attributes/Item Images).
3. Reuse the master document-form template or resource-hook factory — do not architect it fresh.

Known future modules: Proforma (backend documented, not confirmed), Delivery Challan, Credit Notes, Debit Notes, Item Attributes, Item Images, and Enquiry pending its payload contract. Additionally, the Departments/Branch/Designations/Shift/Holiday masters exist ahead of any consuming HR module — an HR module is plausible future scope given these masters already exist. Note: Warehouse Master and full Inventory Module are now completed as part of Phase 6.

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
- [x] **Credit Notes and Debit Notes** — RESOLVED. `BackendApi_doc.md` has full endpoint/payload documentation (lines 1661–1879). Both modules fully documented: `POST /api/credit_note` / `PUT /api/credit_note/:credit_noteId` and `POST /api/debit_note` / `PUT /api/debit_note/:debit_noteId`, each with `party_id`, `*_date`, `*_invoice_id`, `reason_id`, `itemsDetails[]`, and `taxDetails[]` using `*_item_index` (create) / `*_item_id` (update). Frontend already built with `creditNoteApi` + `debitNoteApi` hooks in `apps/erp/features/documents/api.ts`, pages at `/sales/credit-notes` + `/purchase/debit-notes`, and nav entries in `config/navigation.ts`. No new work needed — was already built against correct payloads. Checked off.
- [ ] **Purchase Invoice's PUT payload** — CONFIRMED divergence, not a documentation gap. `BackendApi_doc.md` lines 1646–1657 show the PUT payload drops both the per-line item linkage (`purchase_invoice_item_id`) and the per-row `is_deleted` flags — unique among all document modules. Create payload (lines 1598–1607) correctly uses `purchase_invoice_item_index + tax_id`, matching all other modules. **Backend payload confirmed divergence — PUT taxDetails lacks item linkage. Purchase Invoice edit flow blocked until backend confirms intent.** See `modules.md` §7.
- [ ] **No `/api/auth/logout` or `/api/admin/logout` endpoint has ever been documented by the backend** — PARTIALLY RESOLVED. Backend checklist marks "logout" complete (Admin DB + Company DB) but no endpoint path/method/payload documented in `BackendApi_doc.md`. Frontend's `endpoints.ts` had a guessed path (`/api/auth/logout`) with TODO — Task 8 removed it. **Backend checklist marks complete but no endpoint path/method documented in BackendApi_doc.md. Frontend endpoints.ts guess removed (Task 8) — logout is now client-side only (clearToken + redirect). Awaiting backend confirmation on whether server-side revocation is needed.**
- [ ] **Suspected root cause of "logs out unexpectedly / all APIs go unauthenticated after some time":** the backend likely uses `express-session`'s default in-memory `MemoryStore`, which is wiped on every `nodemon` restart during active backend development — this would explain sessions dying app-wide, not just on logout. **Superseded:** the backend has since moved to bearer-token (JWT) auth, which is stateless and removes this entire bug class — no longer applicable, kept here for history.
- [ ] **Token refresh strategy unconfirmed.** — BLOCKED. No refresh endpoint in `BackendApi_doc.md`. JWT issued on login expires in 15 minutes (`exp - iat` from observed token). **No refresh endpoint in BackendApi_doc.md — blocked. 15-min JWT expiry confirmed. Product-blocking: users forced to re-login every 15 minutes. Frontend has isTokenExpired() ready in token.ts but no renewal path.**
- [ ] **Token revocation on logout unconfirmed.** — UNRESOLVED. No revocation/blacklist mechanism in `BackendApi_doc.md`. **No revocation mechanism documented — awaiting backend confirmation. With stateless JWTs, logout may only need client-side clearToken(). If backend adds revocation list later, frontend logout call can be re-added.**
- [ ] **Activity Log endpoint missing** — NEW (Phase 10 Task 3 blocker). No `GET /api/audit_logs` or equivalent endpoint in `BackendApi_doc.md`. `modules.md §9.1` references `company.audit_logs` as a backend concept but no frontend-facing endpoint is documented. Frontend cannot build the Activity Log viewer against a non-existent endpoint. **Activity Log viewer (Phase 10 Task 3) blocked — no audit_logs endpoint in BackendApi_doc.md. Frontend cannot build reader against non-existent endpoint. Backend must document GET /api/audit_logs before this can proceed.**
- [x] **Project Management and Procurement frontend** — screens, API hooks, repeatable human-readable item forms, and readable procurement detail views implemented from `Projects_api_doc.md`; see Phase 11 and `modules.md` §7.1. The Express backend is external. Forms still use numeric reference IDs pending confirmed lookup contracts. The documented project-document create example repeats DPR fields and does not specify a binary upload contract; upload remains unimplemented.
- [ ] **Project/Procurement permissions** — the project API document does not provide permission keys. Phase 11 mutation controls are not yet permission-gated; obtain the backend permission names before adding gates.
- [ ] **Project child-route methods and response shapes** — confirm the API document's update/delete methods and nested project-detail response shape against the deployed backend. Some child operations are listed with ambiguous methods in the source document; do not silently assume every route matches REST conventions.
