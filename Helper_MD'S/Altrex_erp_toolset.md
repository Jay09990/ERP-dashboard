# Altrex ERP — Frontend Toolset

Base already decided: **Next.js (App Router) + Bun + TypeScript + Tailwind CSS + shadcn/ui**. Everything below fills the gaps, following the same "least custom code that does the job" rule as the backend decisions.

---

## ⚠️ Two architecture notes before the toolset — these affect real decisions below

**1. Bun + Next.js — use Bun as package manager/runtime, keep an eye on edge cases.**
Bun is fast and mostly Next.js-compatible now, but some native Node modules (PDF generation, certain image libs, some auth adapters) still have rough edges under Bun's runtime. Safe pattern: `bun install` + `bun run dev/build` for speed, but don't be surprised if you fall back to Node for `next build` in CI if something native misbehaves. Not a blocker, just don't be surprised.

**2. Your backend is Express + `express-session` (cookie-based), not JWT.**
This matters a lot for the frontend architecture: Next.js **cannot** just `fetch()` the Express API directly from the browser across origins and expect the session cookie to survive reliably (SameSite/CORS pain, especially once you deploy to separate domains/subdomains for multi-tenant). Recommended pattern:
- Use **Next.js as a BFF (Backend-for-Frontend)**: Next API routes / `rewrites()` proxy all calls to the Express backend server-side, forwarding cookies. Browser only ever talks to Next.js's own origin.
- This also means you don't need NextAuth/Auth.js at all — auth state is just "does the proxied session cookie validate," checked via a `/me` style call. Don't reach for a heavier auth library than you need; your backend already owns sessions.

---

## Toolset Decision Matrix

| Need | Recommendation | Why | Alternative considered |
|---|---|---|---|
| **Server state / API data** | **TanStack Query** | This is the single highest-leverage addition for an API-heavy ERP. Caching, background refetch, mutation states, optimistic updates — you'd otherwise hand-roll all of this per page. Non-negotiable for a system with this many list+detail screens. | SWR (lighter, but weaker mutation/cache tooling for a CRUD-heavy app like this) |
| **Client/UI state** | **Zustand** | Lightweight, no boilerplate, scales fine for things like "current FY selector," sidebar collapse state, multi-step form drafts. Don't reach for Redux — nothing here needs it. | Jotai (fine too, Zustand is just more common/simpler to onboard a team into) |
| **Tables (sort/filter/paginate)** | **TanStack Table** + shadcn table primitives *(already decided)* | Confirmed — right call, pair with **TanStack Virtual** for any list that can grow large (Items, Parties, Invoices) so rendering doesn't degrade | — |
| **Forms & validation** | **react-hook-form + zod** *(already decided)* | Confirmed — also reuse the same zod schemas for validating data shape coming back from the API in TanStack Query, so you get type safety end-to-end | — |
| **Charts/graphs** | **shadcn/ui Charts (built on Recharts)** | Since you're already in the shadcn ecosystem, use shadcn's chart components — themed to match your components automatically, less custom wiring than raw Recharts | Tremor (excellent for dashboards too, but it's its own design system layered on top — more friction alongside shadcn, not less) |
| **Animation** | **Motion (Framer Motion)** for UI-level animation (page transitions, modal/drawer enter-exit, list reorder) | React-idiomatic, declarative, integrates cleanly with component state — most of your animation needs (drawers, toasts, row expand/collapse) fit this exactly | **GSAP** only if you specifically need complex sequenced/timeline animation (e.g., a marketing-style landing page or dashboard "reveal" sequence) — don't default to it for standard UI motion, it's more power than a CRUD app needs day-to-day |
| **Toasts/notifications** | **Sonner** | shadcn's own recommended toast library, minimal API, looks right out of the box | — |
| **Icons** | **Lucide** *(already decided)* | Confirmed | — |
| **Date handling** | **date-fns** | Tree-shakeable, no timezone footguns for a mostly single-timezone B2B tool, pairs with shadcn's date picker (react-day-picker) | Day.js (fine too, marginal difference — pick one and standardize) |
| **PDF generation (Invoice/Quotation/PO print & export)** | **@react-pdf/renderer** for simple documents, OR server-side **Puppeteer** (rendering your own HTML template) if you want pixel-perfect fidelity matching the on-screen invoice layout | This is a real requirement given your document modules (Invoice, Quotation, PO, etc. all need printable/downloadable output). react-pdf is faster to implement; Puppeteer gives you "print exactly what's on screen" fidelity since you style once in HTML/Tailwind and reuse it | wkhtmltopdf (older, less maintained — avoid for a new build) |
| **Excel export (reports, item/party bulk data)** | **SheetJS (xlsx)** | Already in your planning doc's frontend example imports — standard choice, works client-side or server-side | ExcelJS (more features for complex formatting, heavier — only reach for it if you need styled/multi-sheet exports) |
| **Command palette / global search** | **cmdk** (ships inside shadcn's `Command` component) | Useful for an ERP with dozens of modules — quick "jump to Customer X" or "create new Invoice" from anywhere | — |
| **File uploads** (item images, attachments, logo) | Plain multipart `fetch` through your Next.js BFF route to the Express backend | You already have a backend handling this — don't add a third-party upload service unless you specifically want offloaded storage (e.g., S3-direct) later | UploadThing (only if you decide to move file storage off your own server) |
| **Maps** | Skip unless a real requirement surfaces (e.g., delivery/branch mapping) | Nothing in your current module list needs it — don't add map tooling speculatively, exactly per your own process doc's "determine at time of need" rule | Context7 MCP check at the time it's actually needed, as your doc already states |
| **Drag & drop** (e.g., reordering document series priority, kanban-style pipeline view later) | **dnd-kit** | Lightweight, accessible, only pull in if/when a screen actually needs reordering | — |
| **Linting/formatting** | **Biome** | Single fast tool (lint + format) instead of ESLint+Prettier as two separate configs — pairs naturally with a Bun-first, speed-conscious stack | ESLint + Prettier (still totally fine, more plugin ecosystem if you hit something Biome doesn't cover yet) |
| **Testing** | **Vitest + Testing Library** | Fast, Bun-friendly, standard for component/unit tests when you get to that phase | — |

---

## Net new dependencies to install (on top of your locked base)

```bash
bun add @tanstack/react-query @tanstack/react-table @tanstack/react-virtual
bun add zustand
bun add motion
bun add sonner
bun add date-fns react-day-picker
bun add @react-pdf/renderer   # or set up Puppeteer server-side, pick one path
bun add xlsx
bun add cmdk
bun add -d @biomejs/biome vitest @testing-library/react
```

(shadcn/ui components — table, chart, command, sonner wrapper — get added individually via the shadcn CLI as you build each page, not bulk-installed up front.)

---

## What I'd explicitly *not* add yet

- No Redux, no Recoil, no heavier state library — Zustand + TanStack Query covers 100% of what a CRUD ERP needs.
- No NextAuth/Auth.js — your backend already owns auth via sessions; adding a frontend auth library would fight your existing model, not help it.
- No maps, no i18n library, no CMS — not in current scope, add only if a real requirement shows up, same discipline your original process doc already sets.