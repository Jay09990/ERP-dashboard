# modules.md — Altrex ERP Module Reference

> Source of truth for what exists, what each module needs, and its build status. Every field name, endpoint, and payload shape below is taken directly from the backend's documented API — do not invent or rename fields when implementing a feature; if a needed field isn't listed here, check with the backend developer before guessing.

**Status legend:** ✅ Built (backend confirmed working) · 🚧 Planned (endpoint documented but not yet confirmed live) · 🔮 Future (mentioned as later scope, no endpoint yet)

---

## 1. Platform / Admin Domain

### 1.1 Admin Auth
- **Status:** ✅
- **Endpoints:** `POST /api/admin/register` (`full_name`, `email`, `password`), `POST /api/admin/login` (`email`, `password`)
- **UI needs:** Two standalone auth pages (Admin App). No sidebar, no layout shell. One-time flow — after first admin exists, register should not be reachable from the login screen (see §5 login-flow note).
- **Data touched:** `admin.admins` table only.

### 1.2 Companies (tenant management)
- **Status:** ✅ (create, deactivate, hard-delete confirmed) 
- **Endpoints:**
  - `POST /api/admin/companies` — full payload: `companyName, companyCode, companyEmail, gstNo, phone, address, subscriptionPlanId, superAdminFirstName, superAdminLastName, superAdminEmail, superAdminPhone, superAdminPassword, db_name`
  - `DELETE /api/admin/companies/:id` — soft deactivate only (does NOT drop the tenant DB)
  - `DELETE /api/admin/companies/:id/harddelete` — permanently drops the tenant database and all admin-side records
  - `POST /api/change_status/:companyId/:status`
- **UI needs:** List (search/filter by status), Add Company form (single flow creating company + its super admin together), Company detail view, a clearly distinct **destructive confirmation** for hard-delete vs. deactivate — these must never look like the same action in the UI (deactivate is reversible, hard-delete is not).
- **Side effects to be aware of:** creating a company triggers backend creation of a brand-new tenant database, seeded roles, seeded super-admin user, and default company profile — this is a heavier operation than a typical form submit; UI should show a distinct loading state, not just a spinner on the button.

---

## 2. Company-Level Auth & Session

### 2.1 Login
- **Status:** ✅
- **Endpoint:** `POST /api/auth/login` — body: `{ "login": string, "password": string }` — `login` accepts **either email or phone number**, backend disambiguates.
- **UI needs:** Single login form, one input labeled generically ("Email or phone") rather than two separate fields.

### 2.2 Company Profile
- **Status:** ✅
- **Endpoint:** `PUT /api/auth/profile` — large payload covering company identity (`company_name, trade_name, logo, registration_number, gst_no, pan_no, phone, email, website, contact_name`), address (`address_line1, address_line2, city_id, state_id, country_id, pincode`), and bank details (`bank_id, account_holder_name, account_no, ifsc_code, swift_code, branch_name, upi_no, opening_balance`) in one call.
- **UI needs:** One page, logically split into three visual sections (Company Identity / Address / Banking) even though it's a single submit — don't build three separate forms/endpoints, but do separate them visually per §7 of `design.md`.

---

## 3. Users, Roles & Permissions

### 3.1 Users
- **Status:** ✅
- **Endpoints:** `POST /api/auth/users` (`firstName, lastName, phone, email, password, roleId`), `PUT /api/auth/users/:userId` (`firstName, lastName, phone, profile_image, status, roleId`), `DELETE /api/auth/users/:userId`, `PUT /api/auth/user/password` (`current_password, new_password`)
- **Business rule:** only a super admin can create/delete users — the UI must hide these actions entirely (not just disable them) for non-super-admin sessions, per the permission-aware UI rule in the design brief.
- **UI needs:** List, Add/Edit drawer, separate "Change Password" flow (self-service, different from admin-editing-another-user).

### 3.2 Roles
- **Status:** ✅
- **Endpoints:** `GET/POST /api/auth/roles` (`role_name, description`), `PUT/DELETE /api/auth/roles/:roleId`
- **Note:** DELETE is a soft delete (`is_deleted` flag), not a hard removal.
- **UI needs:** Simple list + modal CRUD (fits the "Master CRUD" pattern from `design.md` §7 even though it's not technically in the Masters section).

### 3.3 Permissions
- **Status:** ✅
- **Endpoints:** `GET/POST /api/auth/permissions` (`permissionName, moduleName`)
- **Structure:** permission names follow a `module:action` convention (e.g. `company:profile:update`, `users:password:update`) — this exact string format is what `config/permissions.ts` (architecture doc §2) must mirror.

### 3.4 Role Permissions
- **Status:** ✅
- **Endpoint:** `GET/PUT /api/auth/roles/:roleId/permissions` — body is an array of `{ permission_name, module_name, is_allowed }`
- **UI needs:** The Permission Matrix component (grouped by module, collapsible — see `design.md` §7). This screen can have 80+ rows; virtualize if it becomes a performance issue.

### 3.5 User Permissions (per-user override)
- **Status:** ✅
- **Endpoint:** `GET/PUT /api/auth/users/:userId/permissions` — same shape as Role Permissions, but overrides at the individual-user level.
- **UI needs:** Same Permission Matrix component, reused, with a visual indicator distinguishing "inherited from role" vs. "explicitly overridden for this user."

---

## 4. Party Management (Customers & Vendors)

- **Status:** ✅
- **Endpoints:** `POST/PUT /api/party/customers[/:id]`, `POST/PUT /api/party/vendors[/:id]`, `DELETE` (soft delete, sets `is_delete`/`status`)
- **Shape:** one `tbl_party` record + an array of `addresses` (`address_type: billing|shipping|both`, `address_label, attention_to, phone, address_line1, address_line2, city_id, state_id, country_id, pincode`) + an array of `contactPersons` (`name, email, phone`). On update, existing addresses/contacts carry an `address_id`/`person_id`; new ones in the same submit omit it.
- **UI needs:** This is the canonical use of the **Address/Contact-Person Repeater** component from `architecture_doc.md`/`design.md`. Customers and Vendors are the same underlying feature shape — build one `PartyForm` component parametrized by `partyType: 'customer' | 'vendor'`, don't duplicate it.
- **Detail view:** should surface a transaction history tab (quotations/orders/invoices tied to this party) once those modules exist — not required for MVP of this feature itself.

---

## 5. Item Management

| Sub-module | Status | Endpoint | Key fields |
|---|---|---|---|
| Item Types | ✅ | `item_type` table, master-style CRUD | `item_type_name, company_id, user_id` |
| Item Categories | ✅ | `item_categories` table | `category_name, parent_category_id` (self-referencing hierarchy — **needs a tree/indented-list UI**, not a flat table) |
| Items | ✅ | `POST/PUT /api/items/items[/:id]` | Dual pricing: separate `sales_*` and `purchase_*` blocks (`currency_id, qty, convert_qty, rate, conv_rate`), plus `item_type, item_perent_category, item_category, hsn_code, unit_id, conv_unit_id, tax_id, status` |
| Item Attributes | 🔮 | not yet built | — |
| Warehouse Master | 🔮 | not yet built | — |
| Item Images | 🔮 | not yet built | — |

**UI needs for Items:** the dual sales/purchase pricing block should be two visually distinct sub-sections within one form (not two tabs — both need to be visible/comparable at once per the design system's density rules), with unit conversion fields clearly paired with their base unit.

---

## 6. Sales Documents

All six modules below (5 sales + this section is split from purchase in §7) share **the master document-form template** defined in `design.md` §7 and `architecture_doc.md` §3. Each has: header record + `itemsDetails[]` (line items) + `taxDetails[]` (per-line, per-tax-type breakdown supporting simultaneous CGST+SGST+IGST).

| Module | Status | Create endpoint | Notes |
|---|---|---|---|
| Quotation | ✅ | `POST /api/quotation` | `valid_until`, no payment fields |
| Sales Order | ✅ | `POST /api/sales_order` | Can reference a `quotation_id`/`quotation_no`; adds `customer_po_no`, `customer_po_date`, `expected_delivery_date`, `shipping_charges`, `paid_amount`, `payment_term_id` |
| Proforma | 🚧 | `POST /api/proforma` | Payload documented, backend build not yet confirmed complete per checklist |
| Delivery Challan | 🔮 | not yet built | — |
| Sales Invoice | ✅ | `POST /api/invoice` | Adds `po_no`, `po_date`, `due_date`; on update, `invoice_item_id`/`tax_detail_id` required per line |
| Credit Notes | 🔮 | not yet built | — |

**Update-payload rule (applies to ALL six document modules, sales and purchase):** on PUT, every existing line item carries its `<module>_item_id` and every existing tax row carries its `tax_detail_id`. New lines added during an edit omit these IDs. The frontend must track this per-row (new vs. existing) — do not regenerate all line items as "new" on every save, that will orphan data server-side.

**Line-item index vs. ID:** on CREATE, tax rows reference their parent line by `<module>_item_index` (a 0-based array position). On UPDATE, they reference by the real `<module>_item_id`. This distinction matters for how the line-items table component computes what payload shape to send — check whether the form is in create or edit mode before building the `taxDetails` array.

---

## 7. Purchase Documents

| Module | Status | Create endpoint | Notes |
|---|---|---|---|
| Purchase Order | ✅ | `POST /api/purchase_order` | Same shape as Sales Order, mirrored for the vendor side |
| Purchase Invoice | ✅ | `POST /api/purchase_invoice` | Adds `pi_date` distinct from `invoice_date`; update payload includes explicit `is_deleted` flags per line/tax row rather than omission |
| Debit Notes | 🔮 | not yet built | — |

---

## 8. Masters (Settings Area)

All of the following follow the **Master CRUD pattern** from `design.md` §7 (list + modal add/edit, not a drawer, not a dedicated page unless the master has non-trivial relationships). Use the resource-hook factory from `architecture_doc.md` §3.1 for every single one of these — do not hand-write CRUD hooks per master.

| Master | Status | Notes |
|---|---|---|
| Country / State / City | ✅ | Cascading relationship — City select depends on State, State depends on Country. Build as a shared `LocationCascadeSelect` component, reused everywhere an address is entered (Party, Company Profile). |
| Currency | ✅ | Referenced by Items (sales/purchase currency) and every transactional document |
| Tax Types | ✅ | `tax_name, tax_percentage, tax_type, applicable_on` — referenced by Items and every line-item tax breakdown |
| Units of Measure (UOM) | ✅ | `unit_name, unit_code, unit_type` — referenced by Items (both base and conversion unit) |
| Financial Years | ✅ | Session-pinned (see `architecture_doc.md` session notes) — changing the "active" FY is a meaningful action, not a plain edit; consider a distinct "Set Active" action separate from editing FY dates |
| Payment Terms | ✅ | Referenced by Sales Order, Purchase Order, Invoice |
| Bank Master | ✅ | Referenced by Company Profile's banking section |
| Cr/Dr Reason Master | ✅ | Dropdown source for future Credit/Debit Note modules |
| Chart of Accounts | ✅ | Standalone master for now — no transactional module consumes it yet per the current checklist |
| Departments / Branch / Designations | ✅ | HR-adjacent — built ahead of an HR module existing; treat as available masters now, don't assume a consuming HR feature exists yet |
| Shift Master / Holiday Master | ✅ | Same HR-adjacent note as above |
| Cost Centers | ✅ | Standalone |
| Document Type / Document Series | ✅ | Powers the `getNextSeries()` backend numbering service — Document Series in particular should show its current running number as read-only context, even though the master itself is simple CRUD |

---

## 9. Cross-Cutting Notes for Every Module

1. **Audit logging is automatic server-side** — the frontend does not need to build any audit UI beyond a read-only Activity Log viewer (per `architecture_doc.md`/`design.md`), which can be a shared component consuming `company.audit_logs`.
2. **Permission gating applies to every module above** — every Add/Edit/Delete action must check the current user's permission for that `module:action` key before rendering, not just before allowing the API call to succeed.
3. **When a 🔮/🚧 module moves to ✅,** update this table's status column and add its payload shape here before writing any feature code against it — this file must stay the single source of truth, not the backend developer's Slack message.