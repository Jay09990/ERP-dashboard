# design.md — Altrex Visual System Rules

> This document does not list color values (those live as tokens in `packages/ui/tokens` and the Figma file). It defines **how things are sized, spaced, arranged, and animated**, so that any IDE/agent generating UI produces output visually indistinguishable from hand-built screens. Treat every numeric value here as a rule, not a suggestion — if a screen needs a value not listed, that's a signal to add it here first, not invent it inline.

---

## 1. Core Principle

Altrex's visual identity is **monochromatic** — color intentionally carries almost no meaning in this system. This means hierarchy MUST come from four other levers, in this priority order:

1. **Type weight & size** (is it a heading, a label, a value?)
2. **Spacing** (proximity implies relationship — see §3)
3. **Elevation** (shadow/border implies "this floats above the page")
4. **Position** (top-left to bottom-right reading order for primary actions)

**Rule for any agent generating a screen:** if you feel the urge to add a new color to create emphasis, that urge is wrong for this system. Reach for weight, size, space, or elevation instead. The only exception is the named status-color set (success/warning/danger/info), which exists solely for state indication — never for decoration, never for emphasis, never for branding accents.

---

## 2. Layout Grid & Structure

- **Base unit: 8px.** All spacing values are multiples of the 8px scale defined in `packages/ui/tokens/spacing.ts` (`2xs`=2, `xs`=4, `sm`=8, `md`=12, `lg`=16, `xl`=24, `2xl`=32, `3xl`=48, `4xl`=64). Never use an arbitrary pixel value for margin/padding/gap — always reference a token.
- **App shell:**
  - Sidebar width: `264px` expanded, `72px` collapsed (icon-only).
  - Topbar height: `64px`, fixed, always visible.
  - Content area padding: `24px` (`xl`) on desktop, `16px` (`lg`) on tablet/mobile.
- **Page structure, top to bottom, always in this order:**
  1. Page header (title + primary action button, right-aligned)
  2. Filter bar (only if the page has a list/table)
  3. Main content (table, form, or detail panels)
  4. Pagination footer (if table)
- **Content max-width:** transactional forms and detail views cap at `1200px` and center; list/table pages use full available width (tables benefit from more horizontal room, forms don't).
- **Responsive breakpoints:** `640px` (mobile), `1024px` (tablet), `1280px` (desktop), `1536px` (wide desktop). This is a desktop-first tool — below `1024px`, secondary panels stack vertically rather than side-by-side; don't attempt to preserve multi-column layouts below that width.

---

## 3. Spacing Semantics — what gap means what

| Relationship | Token | Example |
|---|---|---|
| Elements inside the same control (icon + label in a button) | `xs` (4px) | Icon-to-text gap |
| Related fields in the same form group | `sm`–`md` (8–12px) | Label to input, input to helper text |
| Distinct form groups on the same page | `lg` (16px) | Between one field-group and the next |
| Distinct sections/cards | `xl`–`2xl` (24–32px) | Between a stat-card row and the table below it |
| Page-level margins (content edge to viewport/sidebar) | `xl` (24px) | Outer page padding |
| Major structural separation (header to body) | `3xl` (48px), only when the two zones are conceptually unrelated | Rare — most pages don't need this much air |

**Rule:** if two elements are visually ambiguous about whether they're related, the gap is wrong. Tighten it if related, widen it if not — don't fix ambiguity with a divider line as a first resort (dividers are a valid tool, but spacing should do most of the work in this system).

---

## 4. Component Proportions

| Component | Height | Radius token | Notes |
|---|---|---|---|
| Button — Large | 44px | `md` (8px) | Primary page-level actions (e.g. "Create Invoice") |
| Button — Default | 40px | `md` (8px) | Standard form/dialog actions |
| Button — Small | 32px | `sm` (4px) | Inline table-row actions |
| Input / Select | 40px | `md` (8px) | Matches Button Default so forms align visually |
| Table row — Comfortable | 52px | — | Default density |
| Table row — Compact | 40px | — | Toggle for power users on dense lists (Items, Ledger) |
| Card | auto | `lg` (12px) | Padding: `xl` (24px) all sides |
| Modal / Dialog | auto, max-width 560px (sm), 720px (md), 960px (lg) | `lg` (12px) | Match size to form complexity, don't default to largest |
| Drawer (side panel forms) | full height, width 480px (sm) / 640px (md) | `none` on the hinge edge, `lg` on the outer edge | Used for quick add/edit without leaving list context |
| Status pill | 24px | `full` | Padding: `sm` horizontal, text uses `Label` style |
| Avatar / icon-badge | 32px (default), 24px (compact in tables) | `full` | |

**Icon sizing:** 16px (inline with `Body/Small` or `Label` text), 20px (inline with `Body/Base` text, default for buttons and nav), 24px (standalone/decorative, empty states). Never mix icon sizes within the same row of controls. Stroke width stays at the Lucide default (2px) throughout — do not vary stroke weight, that's a form of decorative inconsistency this system avoids.

---

## 5. Typography Usage Rules (referencing the text styles already defined in Figma/tokens)

| Style | Use for | Never use for |
|---|---|---|
| `Display` | Cover/marketing-adjacent moments only (login screen headline) | Any in-app page title |
| `Heading/H1` | Page title in the page header | Section titles within a page |
| `Heading/H2` | Section titles within a page (e.g. "Line Items", "Tax Summary") | Card titles |
| `Heading/H3` / `H4` | Card titles, modal titles | Body copy |
| `Body/Base` | Default UI copy, form labels' associated helper text | Table cell values with numbers |
| `Body/Small` / `Caption` | Metadata, timestamps, secondary hints | Primary content |
| `Label` | Form field labels, table column headers | Body copy |
| `Numeric/Table` | **Every number in a financial or quantity column, no exceptions** — amounts, quantities, tax %, rates | Non-numeric text, even if it's a code like an SKU |

**Numeric alignment rule:** all `Numeric/Table` columns are right-aligned, and decimal points must align vertically down the column. If a table mixes text and numeric columns, text stays left-aligned, numbers stay right-aligned — never center-align a data table column.

**Line length:** body copy inside a card or form should not exceed ~75 characters per line before wrapping (roughly a 480–560px content width) — this is about readability, not layout width in general.

---

## 6. Elevation — the "floating" language

Since color can't signal elevation, use the three shadow tokens deliberately and consistently:

- **`Elevation/Shadow-SM`** — dropdowns, popovers, tooltips (things that appear/disappear quickly, low commitment)
- **`Elevation/Shadow-MD`** — cards, panels that sit "on" the page but aren't modal (stat cards, table containers)
- **`Elevation/Shadow-LG`** — modals, drawers, anything that blocks interaction with the page behind it

**Rule:** never stack two elevated surfaces without a visible gap or the LG/MD distinction being obvious — a modal opened over a card must clearly read as "above" it, not "beside" it.

---

## 7. ERP-Specific Layout Patterns

These are patterns specific to this product, not generic UI advice:

- **Primary action placement:** the single most important action on any page (Create, Save, Submit) is always top-right of the page header or bottom-right of a form/drawer footer. Never top-left, never centered.
- **Filters sit directly above their table**, never in a sidebar, never collapsed by default on desktop (collapse only below `1024px`).
- **Status is always a pill**, and it is always either the first column (list views) or directly beside the document number (detail views) — never buried mid-table.
- **The master document-form template** (used by Quotation/SO/Proforma/Invoice/PO/PurchaseInvoice) has a fixed vertical order that must not vary between the six modules:
  1. Header fields (party, dates, addresses) — 2-column grid on desktop, 1-column below `1024px`
  2. Line-items table (full width, horizontal scroll on overflow rather than wrapping)
  3. Tax summary block, right-aligned beneath the table
  4. Grand total, visually the heaviest element in that block (`Heading/H3` weight, not just larger — heavier)
  5. Terms/notes (full width, collapsed/expandable if long)
- **Master CRUD screens** (the 18+ simple masters) share one layout: list + "Add" button top-right + modal (not drawer) for add/edit, since these forms are short (2–5 fields) — reserve drawers for longer forms (Party, Items).
- **Permission matrix screens** group by module with collapsible sections — never render 80+ checkboxes flat in one list.

---

## 8. Motion Rules

- **Micro-interactions** (hover states, checkbox toggle, button press): 100–150ms, ease-out.
- **Panel transitions** (drawer slide-in, dropdown open): 200–250ms, ease-in-out.
- **Page-level transitions:** none by default — this is a data tool, not a marketing site; instant navigation feels faster and more trustworthy for repeated daily use. Do not add page-transition animation unless explicitly requested.
- **Data changes** (row added/removed from a table after a mutation): a brief 150ms fade/height transition is acceptable so the eye tracks the change; avoid anything longer, it reads as sluggish in a tool used all day.
- **Never animate on initial page load** (no staggered reveal of stat cards, no fade-in of the table). Reserve motion for state *changes*, not for arrival.

---

## 9. Accessibility Floor (non-negotiable regardless of visual style)

- Minimum interactive target size: 40×40px (buttons, icon-buttons, checkboxes' clickable area — the visible icon can be smaller, the hit area cannot).
- Every focusable element gets a visible focus ring — never `outline: none` without a replacement.
- Every icon-only button has an `aria-label`.
- Status must never be conveyed by color alone — the status pill always carries text, not just a colored dot.

---

## 10. What This Document Deliberately Excludes

- Hex/RGB color values — those live in `packages/ui/tokens/colors.ts`, sourced from the Figma variable set.
- Component-by-component visual specs (exact shadcn variant usage) — that belongs in each feature's implementation, referencing `packages/ui`.
- Copy/microcopy tone — not a visual concern, out of scope for this file.