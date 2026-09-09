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
- [ ] **Credit Notes and Debit Notes** are marked complete on the backend's own checklist, but no endpoint or payload shape has been shared for either. Do not start either module until this is resolved — see `modules.md` §6/§7.
- [ ] **Purchase Invoice's PUT payload** appears inconsistent with every other document module — its `taxDetails[]` dropped the per-line item linkage and the per-row `is_deleted` flags that Quotation/SO/PO/Invoice/Delivery Challan all still use. Confirm with the backend developer whether this is intentional or a documentation gap before building the Purchase Invoice edit flow. See `modules.md` §7.
- [ ] **No `/api/auth/logout` or `/api/admin/logout` endpoint has ever been documented by the backend** — the frontend's `endpoints.ts` currently guesses this path by pattern-matching `/api/auth/login`. Confirm the real path/method with the backend developer.
- [ ] **Suspected root cause of "logs out unexpectedly / all APIs go unauthenticated after some time":** the backend likely uses `express-session`'s default in-memory `MemoryStore`, which is wiped on every `nodemon` restart during active backend development — this would explain sessions dying app-wide, not just on logout. **Superseded:** the backend has since moved to bearer-token (JWT) auth, which is stateless and removes this entire bug class — no longer applicable, kept here for history.
- [ ] **Token refresh strategy unconfirmed.** The JWT issued on login expires in 15 minutes (`exp - iat` from an observed token). Confirm with the backend developer whether a refresh-token endpoint exists. Without one, every user gets forced back to login every 15 minutes regardless of activity — needs resolving before this is usable day-to-day.
- [ ] **Token revocation on logout unconfirmed.** With stateless JWTs, calling a `/logout` endpoint may do nothing meaningful server-side unless the backend maintains a blacklist/revocation list. Confirm whether logout needs to do anything beyond clearing the client-side token, and whether a compromised/stolen token can be invalidated before its natural 15-minute expiry.