# colorSystem.md — Altrex Color System

> This document owns every color decision for Altrex. `design.md` deliberately excludes color and defers to this file. If a screen needs a color not defined here, that's a signal to extend this system deliberately — not to eyeball a new hex value inline.

---

## 1. Philosophy — Why Monochrome + One Blue

Altrex is B2B finance/ERP software: people using it are making decisions with real money and real compliance stakes, for hours at a stretch, often every working day for years. The color system's job is to **stay out of the way** — support fast comprehension without competing for attention, and never fatigue the eyes or spike the nervous system the way consumer apps are designed to.

That leads to two deliberate choices:

1. **A neutral, near-achromatic "ink" scale carries almost everything** — text, surfaces, borders, structure. Neutral tones don't provoke an emotional response; they let the *data* be the thing a person's attention lands on, not the interface.
2. **One accent color, blue, carries meaning** — specifically, "this is interactive" or "this is important right now." Because it's the only color doing active work, it stays legible and purposeful instead of getting lost among five competing brand colors, which is the more common (and more fatiguing) SaaS pattern.

This is a well-established psychological pattern in enterprise/B2B software for a reason, not an aesthetic trend: **restraint reduces cognitive load.** Every additional hue a person's visual system has to parse and assign meaning to is a small tax on attention. Across an 8-hour session, that tax compounds into real fatigue.

---

## 2. Color Psychology — Why Blue Specifically

Blue is the most consistently research-associated color with **trust, competence, stability, and calm focus** — which is precisely the emotional register a finance/ERP tool wants (compare: red raises arousal and urgency, orange/yellow demand attention, green implies "go/success" which would collide with our status system). Blue is also the color least associated with appetite/impulse triggers and the most associated with "institutional reliability" — banks, financial platforms, and enterprise software converge on blue for this exact reason, across unrelated companies and eras, which is itself evidence it's doing real psychological work rather than being a trend.

**Critically, saturated/vivid blue does NOT deliver these benefits — it undermines them.** A highly saturated blue (think pure `#0000FF`-adjacent, or "electric" blue) reads as energetic and urgent, not calm — it behaves more like a warning color under sustained viewing, and it's genuinely more fatiguing on the eyes at length because high-saturation colors force more work from the eye's cone cells. The calm/trust psychology of blue **specifically requires desaturation**. This is why Altrex's blue is deliberately muted — see §3.

---

## 3. The Blue Scale — Construction & Rationale

Built at a fixed hue of **218°** (a "slate blue" — cooler and more restrained than a typical "SaaS blue," closer to denim than to sky or royal blue) with saturation capped between **30–40%** throughout the entire scale. For comparison, a typical vivid UI blue sits at 55–70%+ saturation — Altrex's blue stays well under that ceiling at every step, by design, not by accident.

| Token | Hex | HSL | Role |
|---|---|---|---|
| `blue/25` | `#F5F7FA` | H218 S30 L97 | Faint tinted backgrounds (selected row, subtle highlight) |
| `blue/50` | `#EBEEF5` | H218 S32 L94 | Hover background for interactive rows |
| `blue/100` | `#D6DEEB` | H218 S34 L88 | Selected/active nav item background |
| `blue/200` | `#B3C2DB` | H218 S36 L78 | Borders on focused/active inputs |
| `blue/300` | `#8CA3CA` | H218 S37 L67 | Disabled-but-visible accent states |
| `blue/400` | `#6483B9` | H218 S38 L56 | Decorative use only — **fails text contrast, see §4** |
| `blue/500` | `#4869A3` | H218 S39 L46 | Link text, secondary interactive accents |
| `blue/600` | `#3A5788` | H218 S40 L38 | **Primary action color** — buttons, active states, focus rings |
| `blue/700` | `#2E446B` | H218 S40 L30 | Primary button hover/pressed state |
| `blue/800` | `#243552` | H218 S39 L23 | Reserved for dark-mode primary surface |
| `blue/900` | `#1A2538` | H218 S37 L16 | Reserved for dark-mode deep accents |
| `blue/950` | `#111722` | H218 S35 L10 | Rarely used — near-black-blue, dark-mode only |

Notice the saturation is nearly flat across the whole scale (30→40%, a ~10-point range) rather than swinging widely — this is deliberate. A scale that gets *more* saturated at the dark end (a common but harsh pattern) produces a "glowing" quality at high-contrast steps that reads as loud. Keeping saturation flat and letting only lightness vary is what keeps even `blue/700` (used for hover/pressed states) feeling calm rather than alarming.

## 3.1 Warm White Surface Scale

All large light surfaces use the warm-white scale below. `warmWhite/canvas` is the page background, while the lighter steps separate contained surfaces without returning to pure white. `warmWhite/raised` is reserved for small inputs and high-contrast light controls.

| Token | Hex | Role |
|---|---|---|
| `warmWhite/canvas` | `#FFFBF4` | Page and application canvas |
| `warmWhite/subtle` | `#FFF9F0` | Subtle warm highlights |
| `warmWhite/surface` | `#FFFDF9` | Sidebar, topbar, cards, tables, and neutral controls |
| `warmWhite/raised` | `#FFFEFC` | Inputs and small raised surfaces |

---

## 4. Ergonomics Rules (verified, not assumed)

These are measured against WCAG 2.1 contrast math, not eyeballed:

| Pairing | Contrast ratio | Verdict |
|---|---|---|
| `blue/600` background + white text | 7.24:1 | ✅ Passes AAA — safe for primary buttons |
| `blue/700` background + white text | 9.74:1 | ✅ Passes AAA — safe for hover/pressed |
| `blue/500` as link text on white | 5.49:1 | ✅ Passes AA |
| `blue/600` as link text on white | 7.24:1 | ✅ Passes AAA |
| `blue/500` as link text on `bg/canvas` (ink/25) | 5.21:1 | ✅ Passes AA |
| `blue/400` as text on white | 3.83:1 | ❌ **Fails AA for text** — `blue/400` and lighter are decorative/background-only, never text |
| `ink/900` body text on `bg/canvas` | 16.70:1 | ✅ Far exceeds AAA — this is why ink/900 (not pure black) is the body text baseline |
| `ink/600` secondary text on white surface | 8.03:1 | ✅ Passes AAA even at "secondary" emphasis |

**Rules that follow from this:**

1. **`blue/600` is the floor for any blue text or blue-on-white button background.** Never use `blue/500` or lighter as a button fill with white text — it under-delivers on legibility even where it technically passes, and doesn't read as "confidently interactive."
2. **`blue/400` and lighter exist only for fills, borders, and backgrounds — never for text or icons that carry meaning on their own.**
3. **No pure white, no pure black anywhere in the system.** Canvas backgrounds use `ink/25` (a very slightly warm-neutral off-white), not `#FFFFFF` directly for large fields of view (full-page backgrounds) — pure white at full brightness is a measurable contributor to eye strain over long sessions, especially in low ambient light. Reserve true white for small surfaces (cards, inputs) where the area is naturally limited. Body text uses `ink/900`, never `#000000` — pure black against a bright background creates more halation (visual "ringing") around text than a very dark, softened neutral does.
4. **Never place a saturated status color directly adjacent to `blue/600`** (e.g., a danger-red pill right next to a blue primary button with no neutral gap between them) — two moderately saturated hues touching directly can produce a mild vibrating/afterimage effect at their border. Keep at least one spacing unit or a neutral divider between distinct hue families.
5. **Dark mode blue stays equally desaturated, not brighter.** The temptation in dark UIs is to boost saturation/brightness of the accent color so it "pops" against a dark background — resist this. `blue/800`/`900` reserved for dark-mode primary surfaces keep the same 37–39% saturation as the rest of the scale; only lightness changes, exactly like the ink scale's light/dark split in `design.md`.

---

## 5. Color Allocation — Where Each Family Actually Appears

Think of this as a rough 70/25/5 split across any given screen, not a strict rule but a sanity check if a screen "feels off":

- **~70% ink neutrals** — backgrounds, surfaces, borders, body text, secondary text, table structure. This should be the overwhelming majority of any screen's pixels.
- **~25% white/near-white space** — the breathing room between elements (already counted partly within ink/25–100, called out separately here because *empty space itself* is doing ergonomic work, not just the colors).
- **~5% blue** — primary buttons, active nav state, links, focus rings, selected-row highlight, checked checkbox/radio fill, progress indicators. If blue is showing up on more than roughly 5% of a screen's surface area, that's a signal the screen is over-using the accent — pull some of those elements back to neutral treatment (e.g., a secondary button should be neutral-outlined, not a lighter blue).
- **Status colors (success/warning/danger/info) remain entirely separate**, as established in the original design system — they are not part of this 70/25/5 allocation because they're conditional (only appear when that state exists), not structural.

---

## 6. Updated Semantic Token Mapping

This supersedes the earlier `action/*` tokens (which were originally aliased to the ink scale in the first Figma pass — that was a placeholder pending this document, now corrected):

| Semantic token | Light mode | Dark mode | Notes |
|---|---|---|---|
| `action/primary` | `blue/600` | `blue/300` | Primary buttons, main CTAs |
| `action/primary-hover` | `blue/700` | `blue/200` | |
| `action/primary-active` | `blue/800` | `blue/100` | |
| `action/link` | `blue/500` | `blue/300` | Inline text links |
| `action/link-hover` | `blue/600` | `blue/200` | |
| `focus-ring` | `blue/600` | `blue/300` | Every focusable element, per `design.md` §9 |
| `selected/bg` | `blue/25` | `blue/900` | Selected table row, selected list item |
| `selected/border` | `blue/200` | `blue/700` | |
| `nav/active-bg` | `blue/100` | `blue/800` | Active sidebar item background |
| `nav/active-text` | `blue/700` | `blue/100` | Active sidebar item text |
| `checkbox/checked` | `blue/600` | `blue/300` | Checked checkbox/radio fill |

All previously-defined `bg/*`, `text/*`, and `border/*` tokens (structural neutrals) and the `status/*` exception set (success/warning/danger/info) are **unchanged** from the original color foundations — this document only introduces the blue family and reassigns the `action/*` and interactive-state tokens to it.

**Implementation note:** the Figma variable set built earlier needs its `action/*` variables re-pointed from the ink scale to this new blue scale, and a new `Blue` primitive collection added alongside `Primitives` (ink). This is a straightforward token update, not a rebuild — flag it for the next Figma session.

---

## 7. What Not To Do

1. Don't reach for a second accent hue "for variety" — the entire point of this system is that blue is the *only* color doing interactive/emphasis work. Adding a second accent (e.g., a teal or purple for a different feature area) reintroduces the cognitive load this system exists to remove.
2. Don't increase blue's saturation anywhere to "make it pop more" — if a blue element isn't standing out enough, the fix is layout/spacing/size, not more saturated color (this is the same principle as `design.md` §1).
3. Don't use `blue/400` or lighter for any text, icon, or element that needs to be read/recognized on its own — those steps exist for fills and backgrounds only.
4. Don't use pure white or pure black anywhere, even where it seems like a minor detail — the ink scale's off-white/off-black anchors exist specifically to reduce glare and halation over long sessions.
5. Don't let blue creep past its ~5% allocation on any single screen — if a screen has more than a handful of blue elements, most of them should be demoted to neutral (outline/ghost button styling) rather than all competing as equally "primary."