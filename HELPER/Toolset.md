# toolset.md — Altrex ERP Frontend Toolset (pnpm edition)

> This is the locked toolset. Don't substitute an alternative for anything below without updating this file first — an agent picking up a later task should never have to guess which library "won."

---

## 0. What changed from the earlier Bun-based draft

Bun is out, **pnpm is the package manager and workspace tool** for this project. Everything else from the earlier toolset decision (TanStack Query, Zustand, shadcn charts, Motion, Sonner, date-fns, react-pdf/Puppeteer, xlsx, cmdk, dnd-kit, Biome, Vitest) carries over unchanged — pnpm doesn't affect those choices, only the install/run layer and the monorepo mechanics.

**Why pnpm fits this project specifically:** we're running a **pnpm workspace monorepo** (`architecture_doc.md` §1) with two Next.js apps sharing `packages/ui` and `packages/api-client`. pnpm's content-addressable storage (packages hard-linked from one global store instead of duplicated per project) is exactly the right tool for a monorepo with shared internal packages — it keeps `apps/admin` and `apps/erp` from drifting to different versions of shared dependencies, and installs stay fast even as both apps grow.

---

## 1. Package Manager Setup

- **Pin via Corepack** (ships with Node.js ≥16.9, enabled by default in Node 22+) — this guarantees every machine and CI runner uses the exact same pnpm version:
  ```json
  // root package.json
  { "packageManager": "pnpm@9.15.4" }
  ```
  ```bash
  corepack enable
  # pnpm install now uses the pinned version automatically
  ```
- **Minimum Node.js version: 20.9** (Next.js 15 requirement).
- **Workspace file** (`pnpm-workspace.yaml`):
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```
- **pnpm Catalogs** (stable pattern for 2026 monorepos) — pin shared dependency versions (React, Next.js, TypeScript, Tailwind) once at the workspace root so `apps/admin` and `apps/erp` can never silently diverge:
  ```yaml
  # pnpm-workspace.yaml
  catalog:
    next: ^15.0.0
    react: ^19.0.0
    react-dom: ^19.0.0
    typescript: ^5.6.0
  ```
  Then in each app's `package.json`: `"next": "catalog:"` instead of a hardcoded version.

---

## 2. Base Stack (confirmed, unchanged)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack dev server — default since Next 15) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (via `packages/ui`) |
| React version | 19 (required minimum for Next.js 15) |

**Note on Server Actions:** Next.js 15 makes Server Actions the default mutation pattern for apps that own their own database. **We deliberately do not use them here** — our data layer is the external Express API via the BFF proxy (`architecture_doc.md` §4), and TanStack Query's client-side cache/invalidation model is the pattern this project standardizes on. Route Handlers (`app/api/[...path]/route.ts`) + TanStack Query mutations are the mutation pattern throughout — don't introduce Server Actions for CRUD against the backend, it creates two competing cache/invalidation models in the same app.

---

## 3. Full Dependency Toolset

| Need | Choice | Notes |
|---|---|---|
| Server state / caching | **TanStack Query** | Non-negotiable for this API-heavy an app — see `architecture_doc.md` §3.1 for how it's wrapped |
| Client/UI state | **Zustand** | UI state only — see `architecture_doc.md` §5 |
| Tables | **TanStack Table** + shadcn primitives, **TanStack Virtual** for large lists | |
| Forms & validation | **react-hook-form + zod** | Schemas live in each feature's `schema.ts`, per `architecture_doc.md` §3 |
| Charts | **shadcn/ui Charts** (Recharts-based) | Matches the design system automatically |
| Animation | **Motion (Framer Motion)** for UI; GSAP only for genuinely complex sequenced motion (rare in this product per `design.md` §8) | |
| Toasts | **Sonner** | |
| Icons | **Lucide** | Fixed 2px stroke throughout, per `design.md` §4 |
| Dates | **date-fns** + `react-day-picker` | |
| PDF generation | **@react-pdf/renderer** or server-side **Puppeteer** (pick one path per document type when the need arises — see `implementationplan.md` Phase 8/9) | |
| Excel export | **SheetJS (xlsx)** | |
| Command palette | **cmdk** (via shadcn `Command`) | |
| Drag & drop | **dnd-kit** | Only pull in when a screen genuinely needs reordering |
| Linting/formatting | **Biome** | Single config, fast, pairs well with pnpm workspaces |
| Testing | **Vitest + Testing Library** | |
| File uploads | Multipart `fetch` through the BFF proxy | No third-party upload service unless storage moves off our own server later |

**Explicitly not used:** Redux/Recoil (Zustand + TanStack Query cover it), NextAuth/Auth.js (backend already owns sessions — see `architecture_doc.md` §4), maps (no current requirement), Server Actions for backend CRUD (see §2 note above).

---

## 4. Setup Commands

```bash
# from the workspace root, after corepack enable
pnpm install

# inside each app
pnpm --filter erp add @tanstack/react-query @tanstack/react-table @tanstack/react-virtual
pnpm --filter erp add zustand motion sonner date-fns react-day-picker cmdk
pnpm --filter erp add @react-pdf/renderer xlsx
pnpm --filter erp add -D @biomejs/biome vitest @testing-library/react

# repeat --filter admin for the Admin Panel app (subset — it doesn't need document/PDF/xlsx tooling)

# shared packages
pnpm --filter @altrex/ui add tailwindcss class-variance-authority tailwind-merge lucide-react
```

shadcn/ui components are added individually per feature via the shadcn CLI as pages are built (`pnpm dlx shadcn@latest add table`, etc.) into `packages/ui`, not bulk-installed upfront.

---

## 5. CI/Deployment Notes (for later, not needed at project start)

- Corepack-pinned pnpm version ensures CI matches local dev exactly — don't let CI install a different package manager "for speed."
- If build times become a real pain point across two apps + shared packages, evaluate Turborepo for task orchestration/caching at that point — not needed for a two-app workspace at current scale, don't add it preemptively.