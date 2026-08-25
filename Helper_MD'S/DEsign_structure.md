# Dev Prompt — Company Registration, Login & Dashboard Shell

> Paste this entire document as the instruction to the AI IDE / coding agent. Do not summarize, skip, or infer beyond what is written here. If something is ambiguous, stop and ask — do not assume.

---

## 0. Context & Non-Negotiable Constraints

You are building the auth flow and dashboard shell for a B2B ERP/CRM web application.

**Tech stack — use ONLY these, no substitutions:**
- Styling: Tailwind CSS (utility classes only, no custom CSS files unless truly unavoidable)
- UI primitives: shadcn/ui (Button, Input, Card, RadioGroup, Dialog, Sheet/Drawer, Popover, DropdownMenu, Separator, Label, Progress — check shadcn MCP/registry before hand-building any of these)
- Forms & validation: react-hook-form + zod (zodResolver). Every form field in this document must have a corresponding zod schema rule — do not validate ad hoc.
- Icons: lucide-react only. Do not mix icon sets.
- Animation: GSAP — only for the step-transition animation described in §2.4 and the sidebar drawer expand/collapse in §5. Do not add animation anywhere else unless specified.
- Routing: assume a client-side router is already set up (React Router or Next.js — follow whatever this codebase already uses; do not introduce a second routing library).

**Do not:**
- Do not add "Sign up with Google" or "Sign up with Facebook" anywhere. Manual email/password only.
- Do not invent additional form fields beyond what is listed in §2 and §3.
- Do not design or build any content inside the module pages themselves (Sales, Purchase, Parties, etc.) — those are out of scope for this task. Only the sidebar navigation shell is in scope (§5).
- Do not build subscription plan billing logic — it's a static, non-functional UI for now (§2.3).

---

## 1. Design System / Theme

This app is monochromatic, derived from a single base color.

**Base color:** `#FFFBF4` (warm off-white)

Derive the full palette from this base as follows — generate a neutral warm-gray ramp anchored to this hue (do not use pure gray/black; every shade should carry the same warm undertone as the base):

| Token | Usage | Approx. direction |
|---|---|---|
| `--bg-page` | Page background | `#FFFBF4` (base, lightest) |
| `--bg-surface` | Cards, inputs, panels | Slightly darker than base, e.g. `#FAF5EC` |
| `--bg-surface-hover` | Hover states on surfaces | One step darker again |
| `--border` | Default hairline borders | Mid-light warm gray, e.g. `#E4DDCE` |
| `--border-strong` | Focus/active borders | Darker warm gray, e.g. `#C9C0AC` |
| `--text-primary` | Headings, primary text | Near-black warm, e.g. `#2B2822` |
| `--text-secondary` | Body/secondary text | Warm gray, e.g. `#6B6656` |
| `--text-muted` | Placeholders, hints, step numbers (inactive) | Lighter warm gray, e.g. `#A69F8C` |
| `--accent` | Primary buttons, active states, selected step indicator | Darkest warm tone, near-black, e.g. `#2B2822` (this app has no separate brand color — the darkest shade of the monochrome ramp IS the accent, matching the "Next" button and active step dot in the reference screenshot) |
| `--accent-foreground` | Text/icons on accent background | `#FFFBF4` (base color, inverted) |
| `--danger` | Validation error text/borders only | A single desaturated warm red, e.g. `#B3413A` — this is the ONLY non-monochrome color permitted anywhere in this flow, reserved exclusively for error states |

Set these up as CSS variables (or Tailwind theme extension `colors` block, whichever this codebase already uses) and reference them everywhere — no hardcoded hex values in components.

Typography, radius, and spacing: follow whatever Tailwind defaults / shadcn theme config already exists in this project. Do not introduce a new font.

---

## 2. Registration Page — `/register`

### 2.1 Structure

Multi-step ("leveled") form, exactly like the attached reference screenshot's visual language: centered card, step indicator row (numbered circles connected by a horizontal line, active step filled dark, inactive steps outlined/muted, completed steps show a filled dot), step label under each number, form content below, single primary action button.

**Do not replicate the screenshot's copy or exact field ("email") — replicate its layout pattern, spacing, step-indicator style, and button style only.**

There are **4 steps total**, not 3 as in the reference image. Adjust the step indicator to render 4 numbered steps dynamically.

### 2.2 Step 1 — Company Information

Fields:

| Field | Label | Input type | Required | Validation regex | Rule notes |
|---|---|---|---|---|---|
| `companyName` | Company name | text | Yes | `^[A-Za-z0-9&.,'\-\s]{3,100}$` | 3–100 chars. Letters, numbers, spaces, and `& . , ' -` only. Trim leading/trailing whitespace before validating. |
| `companyCode` | Company code | text | Yes | `^[A-Z0-9]{2,10}$` | 2–10 chars, uppercase letters and digits only, no spaces. Auto-uppercase user input as they type (transform lowercase to uppercase live, don't just reject). This is used as a unique short identifier — show helper text: "Uppercase letters and numbers only, e.g. ABC01". |
| `address` | Company address | textarea | Yes | `^.{10,250}$` (any characters, length-bound only) | 10–250 chars. No character restriction beyond length since addresses contain many symbol types. |

Button: "Next" — disabled until all 3 fields pass validation.

### 2.3 Step 2 — Contact Information

Fields:

| Field | Label | Input type | Required | Validation regex | Rule notes |
|---|---|---|---|---|---|
| `companyEmail` | Company email | email | Yes | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | Standard email shape. Also run a `.email()` check via zod in addition to the regex for defense in depth. |
| `phone` | Company phone | tel | Yes | `^[6-9]\d{9}$` | Indian mobile number standard: exactly 10 digits, first digit 6–9. Show a fixed non-editable `+91` prefix label to the left of the input (visual only, not part of the stored value). |
| `gstNo` | GST number | text | Yes | `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` | Exactly 15 characters. Structure: 2-digit state code, 10-char PAN (5 letters + 4 digits + 1 letter), 1-char entity code, literal "Z", 1-char checksum. Auto-uppercase as user types. Show helper text: "15-character GSTIN, e.g. 22AAAAA0000A1Z5". |

Buttons: "Back" (secondary/ghost style) and "Next" (primary, disabled until valid).

### 2.4 Step 3 — Subscription Plan Selection

Layout: 4 cards in a responsive grid (4 columns on desktop ≥1024px, 2 columns on tablet, 1 column on mobile). Cards: **Base**, **Standard**, **Premium**, **Custom**.

**Base card (the only functional one):**
- Card header: plan name "Base", no price (leave price area empty or show "—" — do not invent a price).
- Body: a checklist of every module from the module list in §2.5 below, each row with a small check icon (lucide `Check`) and the module name. This represents "included modules" for the Base plan.
- Footer: a "Select Base Plan" button (primary style). Clicking it sets `subscriptionPlanId: 1` in form state and visually marks the card as selected (border changes to `--accent`, subtle background tint). Selecting is required to enable "Next".

**Standard, Premium, Custom cards:**
- Same card shell/dimensions as Base for visual consistency.
- Header: plan name only.
- Body: centered muted text "Coming soon" (use `--text-muted` color).
- Footer: a disabled button, label "Coming soon", not clickable (use shadcn `Button` with `disabled`).
- No pricing, no feature list, no icons — keep genuinely empty besides the "Coming soon" text.

Buttons below the grid: "Back" and "Next" (Next disabled until a plan — currently only Base is possible — is selected).

#### 2.5 Module list to display inside the Base plan card

Render exactly this list (module names as line items, one per row):

```
Parties
Item Master
Sales
Purchase
Masters
Administration
```

Do not expand these into submodules inside this card — top-level module names only, this is a plan summary, not the sidebar.

### 2.6 Step 4 — Company Admin Information

Fields:

| Field | Label | Input type | Required | Validation regex | Rule notes |
|---|---|---|---|---|---|
| `superAdminFirstName` | First name | text | Yes | `^[A-Za-z][A-Za-z'\-\s]{1,49}$` | 2–50 chars, letters plus space/apostrophe/hyphen only (covers names like "Anne-Marie", "O'Brien"). First character must be a letter. |
| `superAdminLastName` | Last name | text | Yes | `^[A-Za-z][A-Za-z'\-\s]{1,49}$` | Same rule as first name. |
| `superAdminEmail` | Admin email | email | Yes | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | Same pattern as company email. Must be allowed to equal or differ from `companyEmail` — do not force equality or inequality. |
| `superAdminPhone` | Admin phone | tel | Yes | `^[6-9]\d{9}$` | Same rule as company phone, same fixed `+91` prefix treatment. |
| `superAdminPassword` | Password | password | Yes | `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}]{8,64}$` | Minimum 8, maximum 64 characters. Must include at least one lowercase letter, one uppercase letter, one digit, and one special character. Add a `confirmPassword` field (not sent to the API, local-only) that must match `superAdminPassword` exactly — validate with zod `.refine()`. Add a live strength indicator (weak/medium/strong bar) below the field using shadcn `Progress` or a simple 3-segment bar — compute strength from how many of the 4 character-class requirements are met plus length ≥ 12 as a bonus tier. Add a show/hide password toggle (lucide `Eye`/`EyeOff` icon inside the input, shadcn pattern). |

Button: "Register company" (primary). On click: validate the full 4-step form state as one combined object, then submit. Do not submit partial data.

**Do not include a `db_name` field in the form.** This value is derived/assigned server-side from `companyCode` — it is not user input. Confirm this assumption with the backend developer before wiring the submit call; do not silently invent a way to generate it client-side.

### 2.7 Step transition behavior

- Use GSAP for the transition between steps: fade + slight horizontal slide (outgoing step exits toward `-24px` opacity 0, incoming step enters from `+24px` opacity 0 to `0/1`), duration ~300ms, ease `power2.out`.
- Update the step indicator (numbers/line) in sync with the transition, not before or after it.
- Preserve all previously entered field values when navigating Back — do not reset state.
- The step indicator numbers/labels are not clickable — user must move via Next/Back only (do not let them jump ahead by clicking a future step number; clicking a completed/past step number MAY be allowed to jump back — implement this, since it matches the reference pattern, but do not allow forward-skipping).

---

## 3. Login Page — `/login`

Reuse the same centered-card visual language as the registration page (same card width, same corner radius, same button style, same theme tokens). Model layout on the attached reference screenshot's proportions and spacing, but:

- Do not include "Sign up with Facebook" / "Sign up with Google" buttons or the "OR" divider — remove that entire block.
- Do not include a multi-step indicator — login is a single-step form.

Fields:

| Field | Label | Input type | Required | Validation | Notes |
|---|---|---|---|---|---|
| `login` | Email or phone | text | Yes | Accept either the email regex from §2.3 OR the phone regex `^[6-9]\d{9}$`. Validate against both patterns with `.or()` in zod — show a generic "Enter a valid email or phone number" error if neither matches. | Matches the API's combined `login` field (accepts email or phone per the API doc). |
| `password` | Password | password | Yes | Non-empty, no format re-validation on login (do not re-apply the strength regex here — only check presence). | Include the same show/hide toggle as the registration password field. |

Elements:
- Heading: "Log in" (or similar, follow the reference screenshot's heading weight/size for "Create an account").
- Below the heading: no "Already have an account?" line needed here (that line belongs on the register page, pointing here — see next bullet).
- Primary button: "Log in", full width, same button style as "Next"/"Register company".
- No social login buttons, no divider.

On the registration page, add this exact bold text pattern (as shown in the reference screenshot's "Already have an account? Log in" line) at the very top of the registration card, above the step indicator: plain text "Already have an account?" followed by a bold, underlined, clickable "Log in" that routes to `/login`.

---

## 4. Post-Registration & Post-Login Routing Rules

These are strict navigation rules — implement route guards, do not rely on the user simply "not clicking back":

1. After a successful `POST /api/admin/companies` call from the registration form, redirect immediately to `/login`. Do not show a success toast that keeps the user on the registration page — navigate first.
2. The `/register` route must become unreachable after a successful registration in that browser session: if the user presses Back or manually types `/register` in the URL after having just registered, redirect them to `/login` instead of showing the form again. (Implement via a simple session flag set on successful registration; do not attempt to permanently block the route for all future company registrations — only for the flow the user just completed.)
3. After a successful login (`POST /api/auth/login`), redirect to `/dashboard`. Do not route through `/register` or back to `/login`.
4. `/dashboard` (and all module routes under it) must be behind an auth guard — unauthenticated access redirects to `/login`.
5. Do not build a "logout" flow in this task unless it's trivial to wire alongside the profile dropdown in §6 — if you do, it should clear the session and redirect to `/login`.

---

## 5. Dashboard Shell — `/dashboard`

Build ONLY the shell: sidebar navigation + top navbar + an empty content area. Do not design or build the actual content of any module page — each module route should render a placeholder (e.g. a centered heading with the module name and "Coming soon" text) and nothing else.

### 5.1 Sidebar structure

Use shadcn `Sheet`/collapsible sidebar pattern or a persistent left sidebar (follow whatever this codebase's existing layout convention is — if none exists, build a persistent, non-collapsible-to-icons left sidebar, fixed width ~260px, full height, using `--bg-surface` background and a right-side `--border` divider).

Render these 7 top-level modules, in this exact order, each with its submodules exactly as listed (do not add, remove, or rename items):

```
1. Dashboard (no submodules — direct link only, no expand arrow)

2. Parties
   - Customers
   - Vendors

3. Item Master
   - Item Types
   - Item Categories
   - Items
   - Item Attributes
   - Item Images
   - Warehouse

4. Sales
   - Quotation
   - Sales Order
   - Proforma
   - Delivery Challan
   - Sales Invoice
   - Credit Note

5. Purchase
   - Purchase Order
   - Purchase Invoice
   - Debit Note

6. Masters
   - Country
   - State
   - City
   - Currency
   - Tax Types
   - Payment Terms
   - Bank Master
   - Chart of Accounts
   - Cr/Dr Reason Master
   - Financial Years
   - Cost Centers
   - Document Type
   - Document Series
   - Departments
   - Branch
   - Designations
   - Shift Master
   - Holiday Master

7. Administration
   - Users
   - Roles
   - Permissions
```

**Note to developer:** This grouping (which submodule sits under which parent) was structured by the product owner based on the current backend API documentation, which is explicitly still evolving — some items (Delivery Challan, Credit Note, Debit Note, Item Attributes, Item Images, Warehouse) do not have working API endpoints yet. Build them as normal sidebar entries pointing to placeholder routes regardless — do not omit or gray them out for that reason alone unless told otherwise separately.

### 5.2 Sidebar interaction behavior — read carefully, this is a specific dual-trigger pattern

Each of the 6 parent modules with submodules (everything except "Dashboard") behaves as follows:

- The row contains: an icon (pick a sensible lucide icon per module, e.g. `Users` for Parties, `Package` for Item Master, `ShoppingCart` for Sales, `Truck` for Purchase, `Settings2` for Masters, `ShieldCheck` for Administration), the module name as clickable text, and a chevron icon (`ChevronDown`) aligned to the far right of the row.
- **Clicking directly on the module name/icon area** (not the chevron) navigates to that module's own landing/placeholder route (e.g. `/dashboard/sales`) AND simultaneously expands its submodule list if it wasn't already expanded. It does not toggle closed if already open — clicking the text again while open just keeps it open and stays on the module route.
- **Clicking the chevron specifically** toggles the submodule list open/closed WITHOUT navigating anywhere — it's a pure expand/collapse control, independent of the current route.
- When expanded, submodules render as an indented list below the parent (indent ~24px), each a plain text link with no icon, navigating to its own placeholder route (e.g. `/dashboard/sales/quotation`).
- Only one parent module may be expanded at a time — expanding a new one collapses any previously expanded one (accordion behavior), UNLESS the user is currently on a route inside that other module, in which case leave it expanded too (don't hide the active section).
- Animate the expand/collapse with GSAP: height auto-animation from 0 to natural content height, ~250ms, ease `power2.inOut`. Rotate the chevron 180° in sync using the same duration.
- Highlight the active route: the current module (and submodule, if applicable) should have a visually distinct background (`--bg-surface-hover` or similar) and bolder/darker text (`--text-primary` vs `--text-secondary` for inactive items).

### 5.3 Top navbar

- Fixed top bar, full width minus sidebar, `--bg-page` or `--bg-surface` background with a bottom `--border` divider.
- Left side: can stay empty or show a breadcrumb/page title later — not in scope now, leave empty.
- Right side: a circular profile avatar button (placeholder gray circle icon, same visual weight as the avatar in the reference screenshot — lucide `CircleUserRound` icon inside a circular button is fine as a placeholder, no actual image upload logic needed).
- Clicking the profile avatar opens a shadcn `DropdownMenu` anchored below it, containing at minimum one item: **"Settings"** (with a lucide `Settings` icon). Clicking "Settings" navigates to a company settings route, e.g. `/dashboard/settings/company`.
- The `/dashboard/settings/company` route should render a placeholder page for now (heading "Company Settings", "Coming soon" text) — do not build the actual profile/bank-details form in this task, that's a separate task. Just wire the navigation correctly so the route exists and is reachable exclusively through this profile → Settings path (do not also add it to the sidebar).

---

## 6. Acceptance Checklist

Before considering this done, verify:

- [ ] Registration is exactly 4 steps, matching §2.2–§2.6 field-for-field, no extra/missing fields.
- [ ] Every field's regex matches this document exactly — do not substitute a "close enough" pattern.
- [ ] Base plan card lists the 6 module names from §2.5, exactly as written, nothing else.
- [ ] Standard/Premium/Custom cards contain only "Coming soon", no other content.
- [ ] No social login buttons anywhere.
- [ ] Password field has strength indicator + show/hide toggle + confirm-password match check.
- [ ] After registration, `/register` is unreachable again in that session; only `/login` shows.
- [ ] After login, only `/dashboard` shows.
- [ ] Sidebar has exactly the 7 modules and submodules listed in §5.1, in that order, no renaming.
- [ ] Chevron click ≠ text click behavior implemented exactly as described in §5.2 (this is the most commonly mis-implemented part — double check it).
- [ ] Company settings page is reachable only via navbar profile → Settings, not from the sidebar.
- [ ] All colors come from the theme tokens in §1 — no hardcoded hex in components, no non-monochrome colors except the single danger/error red.