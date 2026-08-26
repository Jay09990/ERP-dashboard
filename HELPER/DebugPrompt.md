# debug_prompt.md — Bug Report Template & Agent Triage Steps

## What to paste when something breaks

Fill in what you can — you don't need every field, but the more specific you are, the less back-and-forth the fix takes:

```
## Bug Report

**Module/page affected:** (e.g. "Sales Order edit form", "Role Permissions matrix")

**What I did:** (steps to reproduce, as exact as possible)

**What I expected:** 

**What actually happened:** 

**Error message / console output / stack trace (if any):**
```
(paste raw output here)
```

**Screenshot (if visual):** (attach if it's a layout/design issue rather than a functional bug)

**When did this start:** (always broken / broke after a specific recent change, if known)
```

---

## Agent Triage Steps (follow in this order before proposing a fix)

1. **Identify which doc governs the affected area.**
   - Data/payload shape wrong or missing field → check `modules.md` first, confirm the actual field names against what the code assumes.
   - Layout/visual issue → check `design.md` for the correct spacing/proportion/pattern, confirm the component isn't diverging from a documented rule.
   - Wrong file location, state ending up in the wrong place, or an import from the wrong layer → check `architecture_doc.md`.
   - Task/sequencing confusion (something built before its dependency) → check `implementationplan.md` for the intended build order.

2. **Check `implementationplan.md` §5 (Open Questions / Deviations Log)** — this bug might already be a known, logged gap rather than a new issue.

3. **Reproduce the reasoning path, not just the symptom.** Before changing code, explain in one or two sentences *why* the bug is happening (e.g. "the update payload is sending all line items without their `quotation_item_id`, so the backend treats every row as new on every edit" — this exact class of bug is explicitly called out in `modules.md` §6, so check there first for document-module bugs).

4. **Propose the minimal fix that stays inside existing patterns.** Do not use a bug report as an opportunity to refactor unrelated code, introduce a new library, or change an architectural pattern — if the bug reveals that a pattern itself is wrong (not just misapplied), stop and flag it rather than silently changing the pattern for one module.

5. **After fixing:**
   - If the root cause was a misunderstanding of a documented pattern, no doc update needed — just fix the code.
   - If the root cause was a **gap** in the docs (a case `modules.md`, `design.md`, or `architecture_doc.md` didn't cover), update the relevant doc as part of the fix, so the same bug class can't recur elsewhere.
   - If the bug is fixed but reveals a related risk elsewhere (e.g. the same missing-ID pattern likely exists in another document module), note that in `implementationplan.md` §5 rather than silently fixing only the reported instance.

## What NOT to do
- Don't guess at a field name or endpoint shape to "just make the error go away" — verify against `modules.md`.
- Don't add a new dependency to fix a bug without checking `toolset.md` first — the fix likely exists within what's already installed.
- Don't touch files outside the reported module's feature folder unless the root cause genuinely lives in shared code (`components/shared`, `lib/`, `packages/*`) — and if it does, say so explicitly, since a shared-code fix has a wider blast radius than a feature-local one.