# agent-loop.md — Operating Loop for Development Sessions

> Read this at the start of every session and re-check it whenever a task doesn't obviously match a pattern you've already used. This file tells you **which other file answers which question** — it does not contain implementation details itself.

---

## 0. Session Start Checklist

Before writing any code in a new session:
1. Read `architecture_doc.md` if you haven't in this session — folder placement rules.
2. Read `implementationplan.md` §2 — find the current phase, and §5 — check for unresolved open questions that might affect the task at hand.
3. Do NOT re-read `design.md` or `modules.md` in full every session — consult them on-demand per the decision tree below, they're reference docs, not primers.

---

## 1. Decision Tree — "What am I being asked to do?"

### → "Build/add a new master" (e.g. Cost Centers, Bank Master)
1. Check `modules.md` §8 for the exact field names and status.
2. Check `architecture_doc.md` §3.1 — use the resource-hook factory, do not hand-write CRUD hooks.
3. Check `design.md` §7 — Master CRUD pattern (list + modal, not drawer, not dedicated page).
4. Check off the corresponding line in `implementationplan.md` §2 Phase 7 when done.

### → "Build/add a transactional document module" (Quotation, SO, Invoice, PO, etc.)
1. Check `modules.md` §6 or §7 for the exact payload shape, including the create-vs-update ID/index distinction called out there.
2. Check `architecture_doc.md` §3 — this is a `features/sales-documents/<name>/` or `features/purchase-documents/<name>/` feature, using the shared master document-form template component, NOT a bespoke layout.
3. Check `design.md` §7 — the fixed vertical order of the document template (header → line items → tax summary → total → terms).
4. If this is the *first* of the six documents being built, build the shared template component itself first (per `implementationplan.md` Phase 8) — every subsequent document module should be visibly faster to build than the first.

### → "Build a page/route"
1. `app/**/page.tsx` should be a thin import + compose of a `features/*` export — if you're writing logic directly in a `page.tsx`, stop and move it into the feature folder (`architecture_doc.md` §7, anti-pattern #4).

### → "I'm not sure what size/spacing/color-role to use"
1. `design.md` is the only source of truth. Never invent a spacing or radius value outside its token tables. If genuinely nothing fits, flag it rather than guessing — see §3 below.

### → "I'm not sure what a field is called or what shape the API expects"
1. `modules.md` is the only source of truth for payload shapes. Do not infer field names from a similar-looking module — check the specific module's entry, since naming is not always consistent across modules in the backend (e.g. `pi_date` vs `invoice_date` both existing on Purchase Invoice).

### → "Something needs a Zustand store / global state"
1. Check `architecture_doc.md` §5 (State Ownership table) before adding anything to a store. Server data does not belong in Zustand. If what you're about to store is server data, use TanStack Query instead.

### → "A permission needs to gate this UI"
1. Check `modules.md` §3.3 for the exact `module:action` string convention, and `config/permissions.ts` for existing constants before adding a new one.

### → "A bug was reported"
1. Follow `debug_prompt.md`'s triage steps exactly — do not skip straight to a fix without reproducing the reasoning path described there.

### → "A new module appeared that isn't in modules.md yet"
1. Do not build against it from memory of a conversation or a Slack message. Get it documented in `modules.md` first (status, endpoint, payload shape), per `implementationplan.md` §3's update procedure, then proceed.

---

## 2. Cross-Cutting Checks (apply to every task regardless of type)

- [ ] Does this action need a permission check before rendering? (`modules.md` §9.2)
- [ ] Am I calling the backend through the BFF proxy (`/api/...`), not `localhost:4500` directly? (`architecture_doc.md` §4)
- [ ] Am I reusing the resource-hook factory instead of writing new fetch/state boilerplate? (`architecture_doc.md` §3.1)
- [ ] Are all numeric/financial values using the `Numeric/Table` text style and right-aligned? (`design.md` §5)
- [ ] Does the new feature folder follow the standard anatomy (`api.ts`, `schema.ts`, `types.ts`, `components/`, `index.ts`)? (`architecture_doc.md` §3)

---

## 3. When to Stop and Ask Instead of Proceeding

Stop and surface the question (don't silently pick an answer) when:
- Two governance docs appear to conflict with each other.
- A task requires a field/endpoint not documented in `modules.md`.
- A task would require a new top-level folder not described in `architecture_doc.md`.
- A design decision has no precedent in `design.md` and isn't a trivial extension of an existing pattern.

Log genuine open questions into `implementationplan.md` §5 rather than leaving them unresolved and undocumented.

---

## 4. After Completing a Task

1. Check off the corresponding item in `implementationplan.md` §2.
2. If you deviated from a documented pattern for a good reason, note the deviation and why, next to the task or in §5.
3. If you built something reusable that isn't yet reflected in `architecture_doc.md` (e.g., a new shared component), add it to the relevant section there so the next task doesn't rebuild it.