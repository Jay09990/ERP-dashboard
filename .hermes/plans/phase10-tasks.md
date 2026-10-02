# Phase 10 Task Breakdown

## Summary

Phase 10 is the final polish phase. Five work streams remain: (1) dashboard real-data wiring for stat cards and charts, (2) an Activity Log viewer component, (3) table density toggle + empty/loading/error states audit across all list pages, (4) accessibility pass against `design.md §9`, and (5) motion pass against `design.md §8`. Five §5 open questions also need resolution — four are now answered by `BackendApi_doc.md`, one remains blocked on the backend.

**Status:** Phases 0–9 are fully checked off. Credit Notes and Debit Notes pages + API hooks already exist (built against the documented backend payloads found in `BackendApi_doc.md`). The Credit/Debit Note routes are already present in `config/navigation.ts`.

---

## Open Questions Resolution

### 1. Credit Notes and Debit Notes — endpoints/payloads
**FOUND in `BackendApi_doc.md`.** Both modules are fully documented:

| Module | Create | Update | Key payload shape |
|--------|--------|--------|-------------------|
| Credit Note | `POST /api/credit_note` | `PUT /api/credit_note/:credit_notId` | `party_id`, `credit_date`, `invoice_id`, `reason_id`, `itemsDetails[]`, `taxDetails[]` with `credit_note_item_index` (create) / `credit_note_item_id` (update) |
| Debit Note | `POST /api/debit_note` | `PUT /api/debit_note/:debit_notId` | `party_id`, `debit_date`, `purchase_invoice_id`, `reason_id`, `itemsDetails[]`, `taxDetails[]` with `debit_note_item_index` (create) / `debit_note_item_id` (update) |

Both already have API hooks in `apps/erp/features/documents/api.ts` (`creditNoteApi`, `debitNoteApi`) and pages in `apps/erp/app/(app)/sales/credit-notes/page.tsx` and `apps/erp/app/(app)/purchase/debit-notes/page.tsx`. The navigation entries already exist in `config/navigation.ts`. **No new work needed** — these were already built against the correct payloads. The §5 question is resolved and can be checked off.

### 2. Purchase Invoice PUT payload inconsistency (taxDetails[])
**CONFIRMED as a real divergence, not a documentation gap.** `BackendApi_doc.md` lines 1646–1657 show the PUT payload:

```js
taxDetails: [
  { tax_detail_id: 1, tax_id: 1, tax_percentage: 9 },
  { tax_detail_id: 2, tax_id: 2, tax_percentage: 9 }
]
```

This drops both the per-line item linkage (`purchase_invoice_item_id`) and the per-row `is_deleted` flags that every other document module's PUT still uses. The create payload (lines 1598–1607) correctly uses `purchase_invoice_item_index + tax_id`, matching all other modules. **This is the only document module where the PUT taxDetails shape differs from create.** Flag this to the backend developer before building the Purchase Invoice edit flow — the form's edit-mode taxDetails builder must handle this unusual shape. See `modules.md §7` and `ImplimentationPlan.md §5`.

### 3. `/api/auth/logout` and `/api/admin/logout` endpoints
**PARTIALLY RESOLVED.** `BackendApi_doc.md` lines 2607–2621 list both `logout` entries as checked-off items in the backend's own work list (Admin DB: "logout"; Company DB: "logout"). However, no actual endpoint path, HTTP method, request shape, or response shape is documented anywhere in the 70KB doc — the "List of work" section is just a checklist, not API documentation.

The frontend's `endpoints.ts` currently guesses `logout: "/api/auth/logout"` with an explicit TODO comment (lines 6–9) flagging this as unconfirmed. **Action:** confirm the real path/method with the backend developer. If the backend has no explicit logout endpoint (stateless JWTs may not need one — see #5), update `endpoints.ts` to remove the guess and handle logout client-side only.

### 4. Token refresh strategy
**BLOCKED — no refresh endpoint exists in `BackendApi_doc.md`.** The JWT issued on login expires in 15 minutes. No `/api/auth/refresh`, `/api/auth/token`, or equivalent is documented anywhere. The frontend's `lib/auth/token.ts` already has `isTokenExpired()` (reads `exp` from decoded JWT) and `clearToken()`, but there is no renewal path. **Action:** confirm with backend developer whether a refresh endpoint will be added. If not, the UX impact is forced re-login every 15 minutes regardless of activity — this needs resolving before the app is usable day-to-day. The `isTokenExpired` helper in `token.ts` can be used to implement a proactive 401-check if a refresh endpoint later appears.

### 5. Token revocation on logout
**UNRESOLVED — depends on backend confirmation.** With stateless JWTs, a `/logout` call may do nothing server-side unless the backend maintains a token blacklist/revocation list. `BackendApi_doc.md` documents no such mechanism. **Action:** confirm with backend developer (a) whether logout needs to do anything beyond `clearToken()` on the client, and (b) whether a stolen token can be invalidated before its 15-minute natural expiry. If the answer to both is "no," then logout = client-side `clearToken()` + redirect to `/login`, and the `endpoints.ts` logout path can be removed entirely.

---

## Task List

### Task 1: Dashboard — wire Credit Note / Debit Note stats + activity
- **Type:** feature
- **Files to touch:**
  - `apps/erp/features/dashboard/hooks/use-dashboard-overview.ts`
  - `apps/erp/features/dashboard/components/DashboardShell.tsx`
  - `apps/erp/features/dashboard/utils.ts` (add `credit_note_id` / `debit_note_id` to `getDocumentId`)
- **Doc references:** `architecture_doc.md §3` (feature folder anatomy), `design.md §2` (page structure: stat cards before main content), `design.md §4` (stat card proportions — Card, `lg` radius, `xl` padding), `modules.md §6–7` (Credit/Debit Note field names)
- **Acceptance criteria:**
  - Dashboard overview hook imports `creditNoteApi.useList()` and `debitNoteApi.useList()` alongside existing document queries
  - Two new stat cards render: "Credit Notes This Month" (count + total value) and "Debit Notes This Month" (count + total value), using `design.md §4` Card proportions
  - Recent Activity feed includes Credit Note and Debit Note entries (use `getDocumentId` additions for `credit_note_id` / `debit_note_id`; use `credit_note_date` / `debit_note_date` from `utils.ts getDocumentDate` — already present)
  - All numeric values use `Numeric/Table` style and right-alignment per `design.md §5`
  - No inline color values — status colors come from the StatusPill/StatusChip component already in DashboardShell
- **Depends on:** None (Credit/Debit Note API hooks already exist in `documents/api.ts`)

### Task 2: Dashboard — add Credit Note / Debit Note chart data
- **Type:** feature
- **Files to touch:**
  - `apps/erp/features/dashboard/hooks/use-dashboard-analytics.ts`
  - `apps/erp/features/dashboard/components/DashboardShell.tsx` (add chart panel if space allows, or note as future)
  - `apps/erp/features/dashboard/utils.ts` (ensure `getDocumentAmount` covers credit/debit note total fields if backend uses different field names — check `modules.md §6–7`)
- **Doc references:** `design.md §2` (bento grid layout — `auto-fit, minmax(320px, 1fr)`), `design.md §4` (chart container = Card), `architecture_doc.md §3` (hook placement)
- **Acceptance criteria:**
  - `useDashboardAnalytics` includes Credit Note and Debit Note data in the `activeDocs` aggregation when `metricType === "combined"`
  - Charts don't regress for existing document types
  - If Credit/Debit Note backend responses use different amount-field names than invoices, add fallbacks to `getDocumentAmount` in `utils.ts`
- **Depends on:** Task 1 (shares `utils.ts` additions)

### Task 3: Activity Log viewer component
- **Type:** feature
- **Files to touch:**
  - `apps/erp/features/audit/activity-log/api.ts` (new — use resource-hook factory per `architecture_doc.md §3.1`)
  - `apps/erp/features/audit/activity-log/components/ActivityLogViewer.tsx` (new)
  - `apps/erp/features/audit/activity-log/index.ts` (new barrel)
  - `apps/erp/config/navigation.ts` (add "Activity Log" entry under Administration group)
  - `apps/erp/app/(app)/audit/activity-log/page.tsx` (new route page — thin compose per `architecture_doc.md §7` anti-pattern #4)
- **Doc references:** `modules.md §9.1` (audit logging is automatic server-side; frontend needs read-only viewer consuming `company.audit_logs`), `architecture_doc.md §3.1` (resource-hook factory), `architecture_doc.md §3` (feature folder anatomy), `design.md §7` (Master CRUD pattern — list + modal, though this is read-only so no modal needed), `architecture_doc.md §7` (anti-pattern #4 — page.tsx must be thin compose)
- **Acceptance criteria:**
  - Activity Log page renders a read-only DataTable showing timestamp, user, action, module, entity ID, and description
  - Uses TanStack Table + shared DataTable component
  - Filterable by date range and module type
  - No mutating actions (view-only) — matches `modules.md §9.1` "read-only Activity Log viewer"
  - Route `/audit/activity-log` matches centralized nav in `config/navigation.ts`
  - If the backend has no `/api/audit_logs` endpoint, stop and flag: document the missing endpoint in `modules.md` first, then slot into plan
- **Depends on:** Backend must have a documented `GET /api/audit_logs` or equivalent endpoint. Check `BackendApi_doc.md` for `audit_logs` — if not found, this task is blocked until the backend documents it. The `endpoints.ts` already has no audit entry, which suggests the endpoint may not exist yet.

### Task 4: Table density toggle — Zustand store + UI
- **Type:** feature
- **Files to touch:**
  - `apps/erp/stores/ui-store.ts` (add `tableDensity: 'comfortable' | 'compact'` state + setter — per `architecture_doc.md §5`, table density belongs in Zustand UI store)
  - `apps/erp/components/shared/TableDensityToggle.tsx` (new — small dropdown/button to switch, per `design.md §4` which defines Comfortable=52px and Compact=40px row heights)
  - `apps/erp/components/shared/DataTable.tsx` (consume density from store, apply `style={{ rowHeight }}` or conditional class — must not break existing TanStack Table usage)
  - `apps/erp/features/dashboard/components/DashboardShell.tsx` (place toggle in topbar area, per `design.md §2` — topbar is 64px fixed, always visible)
- **Doc references:** `architecture_doc.md §5` (state ownership — table density is UI state → Zustand), `design.md §4` (Table row Comfortable 52px / Compact 40px), `design.md §2` (topbar placement)
- **Acceptance criteria:**
  - `ui-store.ts` exposes `tableDensity` state (`'comfortable'` | `'compact'`) and `setTableDensity` action
  - Shared DataTable reads density from store and applies the correct row height
  - Toggle component is accessible (40×40px hit target per `design.md §9`, visible focus ring)
  - Default is `'comfortable'` — respects `design.md §4` which lists 52px as the default
  - Toggle persists across refresh? Per `architecture_doc.md §5`, UI state like density goes in Zustand — does NOT need URL state unless it should be shareable. Density is a preference; Zustand alone is correct (no URL param needed).
- **Depends on:** None

### Task 5: Empty / loading / error states audit across all list pages
- **Type:** bug/quality
- **Files to touch:**
  - `apps/erp/app/(app)/sales/quotations/page.tsx`
  - `apps/erp/app/(app)/sales/orders/page.tsx`
  - `apps/erp/app/(app)/sales/invoices/page.tsx`
  - `apps/erp/app/(app)/sales/credit-notes/page.tsx`
  - `apps/erp/app/(app)/sales/challans/page.tsx`
  - `apps/erp/app/(app)/sales/proformas/page.tsx`
  - `apps/erp/app/(app)/purchase/orders/page.tsx`
  - `apps/erp/app/(app)/purchase/invoices/page.tsx`
  - `apps/erp/app/(app)/purchase/debit-notes/page.tsx`
  - `apps/erp/app/(app)/parties/customers/page.tsx`
  - `apps/erp/app/(app)/parties/vendors/page.tsx`
  - `apps/erp/app/(app)/items/page.tsx`
  - `apps/erp/app/(app)/inventory/ledger/page.tsx`
  - `apps/erp/app/(app)/inventory/warehouses/page.tsx`
  - `apps/erp/app/(app)/inventory/batches/page.tsx`
  - `apps/erp/app/(app)/inventory/transfers/page.tsx`
  - `apps/erp/app/(app)/inventory/adjustments/page.tsx`
  - `apps/erp/app/(app)/inventory/stock/page.tsx`
  - `apps/erp/app/(app)/users/page.tsx`
  - `apps/erp/app/(app)/roles/page.tsx`
  - `apps/erp/app/(app)/profile/page.tsx`
  - `apps/erp/features/documents/components/DocumentList.tsx` (shared list component — fix once here to cover all document pages)
  - `apps/erp/components/shared/DataTable.tsx` (shared table — fix once to cover masters/parties/inventory/pages)
- **Doc references:** `design.md §2` (page structure: filter bar above table, pagination footer if table), `design.md §9` (empty states must not rely on color alone), `architecture_doc.md §7` anti-pattern #4 (page.tsx should be thin compose — if a page has its own loading logic, move it to the shared component)
- **Acceptance criteria:**
  - Every list page shows a distinct empty-state message when the query returns `[]` (not just a blank table)
  - Every list page shows a loading state while queries are in-flight (not a flash of empty table)
  - Every list page shows an error state when the query fails (not silent failure — per `design.md §9`, error must be communicable, not just a color change)
  - Document pages all use `DocumentList.tsx` — fix the shared component once to cover all 8 document pages
  - Master/party/inventory pages all use `DataTable.tsx` — fix the shared component once to cover the remaining pages
  - Empty state includes a call-to-action button where applicable (e.g., "Create your first Quotation")
  - Error state includes a retry action
- **Depends on:** Task 4 (density toggle may affect table layout — do density first so the audit accounts for both density modes)

### Task 6: Accessibility pass against `design.md §9`
- **Type:** accessibility
- **Files to touch:**
  - `apps/erp/components/shared/DataTable.tsx` (focusable row actions — ensure 40×40px hit target, aria-label on icon buttons)
  - `apps/erp/components/shared/FilterBar.tsx` (filter inputs — ensure focus rings)
  - `apps/erp/features/documents/components/DocumentForm.tsx` (form inputs — focus rings, error announcements)
  - `apps/erp/features/dashboard/components/DashboardShell.tsx` (icon-only nav cards — add aria-labels)
  - `apps/erp/features/dashboard/components/PaymentStatusDonut.tsx` (chart — ensure status is not conveyed by color alone; add pattern/text labels per `design.md §9` — "Status must never be conveyed by color alone")
  - `apps/erp/features/dashboard/components/SalesVsPurchaseBarChart.tsx` (same — text labels on bars)
  - `apps/erp/features/dashboard/components/InvoicedVsPaidChart.tsx` (same)
  - `apps/erp/app/(app)/layout.tsx` (app shell — focus trap on modal/drawer if applicable)
  - Any feature page with icon-only action buttons (search across `apps/erp/app/(app)/` for `<button>` without `aria-label`)
- **Doc references:** `design.md §9` (Accessibility Floor — non-negotiable): minimum 40×40px interactive target, visible focus ring on every focusable element, aria-label on every icon-only button, status never conveyed by color alone
- **Acceptance criteria:**
  - Audit with a focus-ring-on check: tab through every page; every focusable element shows a visible ring (no `outline: none` without replacement)
  - Every icon-only button has an `aria-label` (use `axe-core` or manual audit)
  - Chart components include text labels or patterns so status/values are not color-only
  - StatusPill component already carries text — verify it's used everywhere status appears (no colored dots without text)
  - Interactive targets on table row actions (edit/delete icons) meet 40×40px minimum — the visible icon can be smaller, the hit area cannot
- **Depends on:** Task 5 (states audit — error states must be announced, not just colored)

### Task 7: Motion pass against `design.md §8`
- **Type:** motion
- **Files to touch:**
  - `apps/erp/components/shared/DataTable.tsx` (row add/remove: 150ms fade/height transition — per `design.md §8` "Data changes")
  - `apps/erp/components/shared/FilterBar.tsx` (dropdown/popover open: 200–250ms ease-in-out — per `design.md §8` "Panel transitions")
  - `apps/erp/features/dashboard/components/DashboardShell.tsx` (stat cards: NO initial load animation — per `design.md §8` "Never animate on initial page load"; hover micro-interactions: 100–150ms ease-out)
  - `apps/erp/features/dashboard/components/*Chart.tsx` (chart transitions: 200–250ms ease-in-out for data updates; no enter animation on mount)
  - `apps/erp/features/documents/components/DocumentList.tsx` (row hover: 100–150ms ease-out; snackbar/toast on mutation: 150ms fade)
  - `apps/erp/features/documents/components/DocumentForm.tsx` (drawer slide-in: 200–250ms ease-in-out; save button press: 100–150ms ease-out; error shake: 150ms)
  - Any drawer/modal components across features (search for `Drawer`, `Dialog`, `Modal` in `apps/erp/features/`)
- **Doc references:** `design.md §8` (Motion Rules): micro-interactions 100–150ms ease-out; panel transitions 200–250ms ease-in-out; data changes 150ms fade/height; NEVER animate on initial page load; no page-transition animation
- **Acceptance criteria:**
  - No staggered reveal or fade-in of stat cards on page load
  - No page-transition animation between routes
  - Table row additions/removals after mutations: brief 150ms transition so the eye tracks the change
  - Dropdowns, dialogs, drawers: 200–250ms ease-in-out
  - Button hover/press, checkbox toggle: 100–150ms ease-out
  - Motion only on state changes, not on arrival — verify by reloading a page and confirming nothing animates in
- **Depends on:** None (independent of other Phase 10 tasks, but verify no motion conflicts with Task 6 focus-ring visibility)

### Task 8: Update `endpoints.ts` — remove guessed logout, add audit_logs placeholder
- **Type:** docs/cleanup
- **Files to touch:**
  - `apps/erp/lib/api/endpoints.ts`
- **Doc references:** `architecture_doc.md §4` (endpoint constants belong in `endpoints.ts`), `ImplimentationPlan.md §5` (open questions log)
- **Acceptance criteria:**
  - If backend confirms logout endpoint: update `endpoints.auth.logout` to the confirmed path/method, remove the TODO comment
  - If backend confirms no logout endpoint needed (stateless JWT): remove `endpoints.auth.logout` entirely and update the `http.interceptors.response` 401 handler in `apps/erp/lib/api/client.ts` to not call a logout endpoint (it already only clears client-side state — confirm no backend call is made)
  - Add a placeholder comment for `audit_logs` endpoint if the backend hasn't documented it yet (so the Activity Log task has a clear blocking dependency)
- **Depends on:** Open questions #3 and #5 resolution (backend confirmation)

### Task 9: Update `ImplimentationPlan.md §5` — close resolved questions, log new findings
- **Type:** docs
- **Files to touch:**
  - `HELPER/ImplimentationPlan.md`
- **Doc references:** `ImplimentationPlan.md §5` (open questions log — append resolutions, don't resolve silently)
- **Acceptance criteria:**
  - Check off the Credit Notes / Debit Notes question (resolved — endpoints found in `BackendApi_doc.md`, already built)
  - Update the Purchase Invoice PUT inconsistency question with the confirmed finding: "BackendPayload confirmed divergence — PUT taxDetails lacks item linkage. Flagged to backend developer."
  - Update the logout question with current status: "Backend checklist marks complete but no endpoint path/method documented in BackendApi_doc.md — awaiting confirmation."
  - Update the token refresh question: "No refresh endpoint in BackendApi_doc.md — blocked. 15-min JWT expiry confirmed."
  - Update the token revocation question: "No revocation mechanism documented — awaiting backend confirmation."
  - Add a new entry for the Purchase Invoice edit flow blocker if the backend doesn't resolve the taxDetails divergence

---

## Verification Commands

```bash
# From workspace root /e/erp
pnpm run lint          # Biome lint across all packages
pnpm run typecheck     # TypeScript check across all packages
pnpm run build         # Full build (both apps + shared packages)
pnpm --filter erp run test   # ERP app Vitest suite (if tests exist)
pnpm --filter admin run test # Admin app Vitest suite (if tests exist)
```

Per-task verification:
- **Task 1–2:** Load `/`, verify Credit Note + Debit Note stat cards appear, activity feed includes them, no console errors
- **Task 3:** Load `/audit/activity-log` (after backend endpoint exists), verify table renders, filters work, no console errors
- **Task 4:** Toggle density on any list page — row heights change between 52px and 40px, state persists during session
- **Task 5:** Visit each list page with no data (or mock empty response) — empty state renders; trigger error — error state renders with retry
- **Task 6:** Tab through every page — focus ring visible everywhere; run `axe-core` devtools scan on Dashboard, DocumentList, DocumentForm
- **Task 7:** Reload Dashboard — no entrance animation; trigger a mutation (create/delete a document) — row transition is brief (<200ms); open a drawer — slides in over 200–250ms
- **Task 8:** `grep -r "logout" apps/erp/lib/api/endpoints.ts` shows either confirmed path or no entry; `grep -r "audit" apps/erp/lib/api/endpoints.ts` shows placeholder comment

---

## Notes for Implementation Agents

- **Credit/Debit Notes are already built.** The API hooks (`creditNoteApi`, `debitNoteApi`), pages (`/sales/credit-notes`, `/purchase/debit-notes`), and nav entries already exist. Task 1 and Task 2 are about *wiring them into the dashboard*, not building the modules from scratch.
- **Purchase Invoice edit flow is blocked** until the backend resolves the `taxDetails[]` PUT shape divergence. Do not build the Purchase Invoice edit form until this is resolved — the form's taxDetails builder will need to handle the unusual `{ tax_detail_id, tax_id, tax_percentage }` shape with no item linkage.
- **Activity Log depends on a backend endpoint.** If `GET /api/audit_logs` (or equivalent) is not in `BackendApi_doc.md`, the task is blocked. The frontend can't build a viewer against a non-existent endpoint — per `agent-loop.md §3`, stop and log it rather than guessing.
- **Token refresh is a backend dependency.** The frontend can prepare by having `isTokenExpired()` ready in `token.ts`, but without a refresh endpoint, every user gets logged out every 15 minutes. This is a product-blocking issue, not a polish issue — escalate to the backend developer before Phase 10 work is considered complete.
