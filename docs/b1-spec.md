# tailwind-oklch — the B1 model

**Status:** draft spec · target for the next major model revision · **breaking** (pre-1.0, expected).

This is the design we converged on for making the system as small and as explainable
as possible: **one surface, one mood, everything else a leaf.** It removes ~66 of the
~72 cascading axis variables, dissolves several known bugs by construction, and reduces
the developer's mental model to a handful of one-sentence rules.

---

## 1. One-page overview

A color is `oklch(L C H)`. The three axes are sourced differently, and that difference
*is* the model:

- **Luminance (`L`)** — belongs to **surfaces**. Only a background carries a luminance
  that cascades. Everything else either states an absolute luminance or (the usual case)
  computes one by **contrast** against the surface it sits on. Luminance is *referenced*
  by descendants, never *adopted*.
- **Hue (`H`) and Chroma (`C`)** — are a **mood**. Set them property-less (`hue-danger`,
  `chroma-high`) and they cascade to everything below. Set them with a property
  (`text-hue-danger`) and they're a **leaf** — they paint one element and enter no cascade.

Two rules cover luminance, one covers hue/chroma:

1. **Absolute luminance, anywhere:** `bg-lum-3`, `text-lum-9`, `border-lum-4`, …
2. **Relative luminance, anywhere — but the operator forks by target:**
   - **backgrounds → bumps** (`bg-lum-up/down-N`): a *new surface*, relative to the **parent** surface.
   - **everything else → contrast** (`text-con-*`, `border-con-*`): a *leaf color*, relative to the **immediate** surface.
3. **Hue/chroma:** property-less → cascades (mood); property-full → variable-leaf (paints, no cascade).

The fork in rule 2 is principled: a background **is** a surface, so its relative move is
another surface off its parent; everything else **sits on** a surface, so its relative move
is measured against that surface. Bumps make surfaces; contrast reads them. Neither can do
the other's job.

> **`con` is local, not portable — this is deliberate.** Contrast reads the *immediate*
> surface and nothing more; there is no cascading "contrast level" that follows text across
> surfaces. The model has exactly the locality of plain CSS: change a surface and you restate
> the text on it. `con`'s only convenience is "compute my luminance off whatever surface I'm
> sitting on" — it spares you a hardcoded light/dark value, not a restatement of intent when
> the surface changes. (Hue and chroma cascade as moods because they answer *what color*;
> luminance does not, because it answers *how light* — which is structural and local.)

---

## 2. The two cascades

The one genuinely subtle thing in the model, named precisely. Two independent inheritance
channels are in play:

- **Variable cascade** — the axis custom properties (`--bg-l`, `--hue`, `--cscale`,
  `--chroma`). This is "the mood + the surface." A **variable-leaf writes nothing here.**
- **Color cascade** — CSS's own native inheritance of a *computed* color value. This
  inherits only for properties CSS inherits, which among colors is essentially just
  **`color`** (text). `border-color`, `--tw-ring-color`, `text-decoration-color` do **not**
  inherit natively.

From which the leaf rule falls out:

> A **variable-leaf** (`text-chroma-max`, `text-hue-danger`, …) writes no variable; its
> **resolved color still rides the color cascade.** So a *text* leaf shows on itself and on
> descendants that inherit `color` untouched; a *non-text* leaf shows on itself only; and in
> both cases, the instant a descendant **repaints** that property it **re-resolves all three
> axes from the variable cascade** — the leaf's value evaporates.

Worked example: `chroma-mhigh > text-chroma-mlow > …`

- A plain `<span>` under the `text-chroma-mlow` element shows **mlow** (inherited `color`).
- A `<p class="text-con-mid">` under the same element shows **mhigh** — repainting pulls C
  (and H) from the ambient mood, not from the parent's leaf.

One paint = one `oklch()` = all three axes resolved fresh from the variable cascade, plus
this element's own overrides. **The cascade is mood + surface; leaves are paint-deep, not
axis-deep.**

---

## 3. The cascading variables

The entire variable cascade (registered via `@property`, `<number>`, `inherits: true`):

| Var           | Meaning                              | `:root` default        | `.dark`         |
|---------------|--------------------------------------|------------------------|-----------------|
| `--bg-l`      | the **surface** luminance            | `lum-1` (page-hugging) | flips           |
| `--hue`       | ambient hue angle                    | `--hue-primary` (233)  | —               |
| `--cscale`    | ambient per-hue chroma multiplier    | `--cscale-primary`     | —               |
| `--chroma`    | ambient chroma                       | `--chroma-low`         | —               |
| `--lum-dir`   | contrast/bump direction (−1 / +1)    | `-1`                   | `1`             |
| `--lum-flip`  | arbitrary-value auto-flip (0 / 1)    | `0`                    | `1`             |
| `--con-flip`  | surface L where contrast flips pole  | mid(lum-5,lum-6) light | dark midpoint   |

That's it — **7 cascading vars**, down from ~72. `--hue` and `--cscale` travel together
(a hue implies its chroma multiplier; an arbitrary `hue-[280]` sets `--cscale: 1`).

> **Change from today:** `--bg-l` defaults to **`lum-1`, not `lum-5`.** With everything
> leaning on the surface, the safe default is "the page is the surface" (field-report #3).

Gradient stop luminances (`--gf-l`, `--gt-l`) are **not** in the cascade — they're leaf
paint values for the element drawing the gradient (see §5).

---

## 4. How any color resolves

Every painting utility emits one `oklch()`:

```
oklch( <L>  calc(<C> * <cscale> * <taper(L)>)  <H> )
```

- **`<L>`** comes from exactly one source, in this precedence on the element itself:
  a bump (bg only) → an absolute `lum-N` → a contrast `con-*` (non-bg) → else the default.
- **`<C>`** = the element's own `chroma-*` override, else the ambient `--chroma`.
- **`<cscale>`** = the multiplier for the element's own `hue-*` override, else ambient `--cscale`.
- **`<H>`** = the element's own `hue-*` override, else the ambient `--hue`.
- **`taper(L)`** = `clamp(0, calc((1 - L) * --chroma-taper), 1)` — chroma falls toward white
  so a stop reads equally saturated across the ramp and the lightest surfaces stay clean.

Luminance scale (unchanged): front-loaded ramp, numbered `1..10`, auto-flipping for dark;
`none`/`max` are the pure poles outside the numbered range. Contrast is auto-directional:
`--con-dir = clamp(-1, (--con-flip − --bg-l) × 1000, 1)`, and
`L_con = clamp(0, --bg-l + --con-dir × offset, 1)`.

---

## 5. Utility families (what each emits)

| Family              | Examples                          | Targets            | Writes to variable cascade? | Paints                    |
|---------------------|-----------------------------------|--------------------|-----------------------------|---------------------------|
| **Surface**         | `bg-lum-3`, `bg-lum-[60]`         | `bg` only          | **yes** — `--bg-l`          | `background-color`        |
| **Bump**            | `bg-lum-up-1`, `bg-lum-down-2`    | `bg` only          | **yes** — `--bg-l`          | `background-color`        |
| **Mood**            | `hue-danger`, `chroma-high`       | (property-less)    | **yes** — `--hue`/`--cscale`, `--chroma` | nothing      |
| **Contrast leaf**   | `text-con-mid`, `border-con-low`  | text/border/ring/outline | no                    | that property, inline     |
| **Absolute leaf**   | `text-lum-9`, `border-lum-4`      | any non-bg prop    | no                          | that property, inline     |
| **Variable-leaf**   | `text-chroma-max`, `text-hue-danger` | any non-bg prop | no                          | that property, inline     |

Notes:

- **Surface** publishes `--bg-l` and (for bump support) the anchor it measures from. It is
  the *only* thing whose luminance descendants can read.
- **Bump** reads the **parent** surface and writes a new `--bg-l`. Cycle-free when alone.
  Combining an absolute stop **and** a bump on the **same element** forms a variable cycle;
  because the axis vars are registered and inherit, it **degrades to the parent surface**
  (verified in-browser), not to transparent. This combination is disallowed by convention;
  hover states use absolute stops or CSS filters.
- **Contrast leaf** reads `--bg-l` (own or inherited), never writes it. `bg` has no contrast
  utility (a surface can't contrast itself); non-bg props have no bump (they don't make surfaces).
- **Gradients** (`from-lum-*`/`to-lum-*`) are pure leaves — they paint the stops and do
  **not** touch `--bg-l`. To get contrast on a gradient tile, state `bg-lum-N` alongside
  (it paints a real background under the gradient *and* declares the contrast surface):
  `from-lum-1 to-lum-5 bg-lum-3 text-con-high`. With no `bg-lum-*`, the tile inherits its
  parent surface for contrast. This keeps gradients under invariant 2 with no special-casing.

---

## 6. Invariants (the rules, stated flat)

1. **Luminance is a surface property.** Only `bg-*` writes the cascading `--bg-l`.
2. **A surface you want contrast against must be stated with `bg-lum-*`.** A `bg-white`, a
   semantic token, or a raw gradient leaves `--bg-l` stale, and contrast will measure a
   surface that isn't there. (Optional escape hatch under Q3.)
3. **Bumps only on backgrounds; contrast only on non-backgrounds.**
4. **Never combine an absolute `bg-lum-N` and a bump on one element** (cycle → parent-surface).
5. **Hue/chroma cascade only when property-less.** `text-chroma-*` etc. are variable-leaves.
6. **Repainting re-resolves from the mood.** A leaf's color reaches non-repainting text
   descendants via CSS `color` inheritance only.

---

## 7. What's deleted vs. today

- **All per-property luminance vars** — `--tx-l`, `--dc-l`, `--bd-l`, `--bd{t,r,b,l,x,y,s,e}-l`,
  `--ac-l`, `--sh-l`, `--rg-l`, `--ro-l`. Luminance cascades only as `--bg-l`.
- **All per-property hue/chroma cascade** — the `--{stem}-c`, `--{stem}-cs`, `--{stem}-h`
  sets collapse to the single `--chroma` / `--cscale` / `--hue`. Per-property setters remain
  as leaves; they just stop writing cascading vars.
- **`--bg-anchor-l` stays** (bumps are kept for backgrounds), but every other anchor/adjust
  var that existed per-property goes away.

The per-property setters (`text-hue-danger`, `border-chroma-max`, `text-lum-9`) all still
exist and paint exactly as before — they simply become leaves.

---

## 8. Field-report bugs: dissolved vs. promoted

**Dissolved by construction:**

- **#4 (`text-con`/`border-con` share `--con-off`)** — leaves inline their own expression;
  no shared intermediate var to collide.
- **#11 (chroma/hue leak to descendants)** — per-property setters no longer write cascading
  vars, so `border-chroma-max` can't reach a descendant's border.
- **#1 (bg nudge cycle → transparent)** — already degrades gracefully via `@property`; and
  the cycle can only arise from the disallowed absolute+bump combo (rule 4).

**Promoted to prerequisites** (the cost of leaning everything on the surface):

- **#3** — default `--bg-l` = `lum-1`; the "surfaces must be `bg-lum-*`" rule (invariant 2).
- **#2** — folds into invariant 2: a gradient tile you want contrast on states `bg-lum-*`;
  gradient stops themselves never touch `--bg-l`.

---

## 9. Migration (sunlo) — deltas & checklist

Most of the app is untouched. From the usage survey on the v0.7 conversion:

- **Unchanged:** `bg-lum-*` (313), `text-con-*`/`border-con-*` (~750), `text-lum-*` (91),
  bare `hue-*`/`chroma-*` (moods). These are the overwhelming majority.
- **Now leaves (no code change, behavior identical — verified all are on painting leaves,
  zero container-cascade reliance):** `text-chroma-*`, `border-chroma-*`, `text-hue-*`,
  `border-hue-*` (~130 sites).
- **`bg-lum-up-*` (6 sites):** kept. **Audit these** for the disallowed same-element
  absolute+bump combo; convert any `bg-lum-N hover:bg-lum-up-M` to an absolute hover stop.

**Checklist to verify during implementation:**

- [ ] `lang-theme.ts` (and any runtime theming) sets per-property hue vars (`--bg-h`,
      `--dc-h`, `--ac-h`, `--sh-h`, …). Under B1 this collapses to setting **`--hue`**
      (+`--cscale`) once — a strict simplification, and it fixes field-report #7 (runtime
      `--hue-primary` below `:root`). **Rewrite these call-sites.**
- [ ] `globals.css` — any references to deleted internal vars (`--tx-*`, `--bd-*`, etc.),
      and the custom `--cscale-neutral` / neutral-hue setup, re-expressed against `--hue`/`--chroma`.
- [ ] Confirm no surface is painted by a non-`lum` background where contrast is then expected
      (invariant 2); add `bg-lum-*` or the Q3 helper where found.

---

## 10. Resolved decisions

- **Q1 — named `con` readability guarantee: deferred.** Named `con-low..max` stay as fixed
  ΔL offsets (with `max` guaranteeing the pole). A tier that *guarantees* a WCAG/APCA ratio
  against the surface is a worthwhile later feature, not part of this revision.
- **Q2 — gradients don't set `--bg-l`.** Gradient stops are pure leaves; declare `bg-lum-*`
  on a gradient tile to give it a contrast surface (see §5). This keeps
  `from-lum-1 to-lum-5 bg-lum-3` fully controllable and folds #2 into invariant 2.
- **Q3 — no `surface-lum-N`.** Rejected: a `--bg-l` that doesn't correspond to painted
  pixels makes contrast *lie*. Surfaces must actually paint. Backgrounds drawn by an image
  or token simply don't get trustworthy `con`; use absolute `text-lum-*` there.
- **Q4 — contrast is a leaf; no cascading contrast level.** Considered and rejected a
  cascading `--con` mood. Contrast reads only the immediate surface — the model has plain
  CSS's locality (change a surface → restate its text). A leaf that states only chroma/hue
  therefore paints its luminance from a **default contrast off the surface** (a readable
  foreground), still a per-element leaf, no cascade. The moods remain exactly two: `--hue`
  and `--chroma`.

## 11. Still to decide during implementation

- Exact default-contrast offset for a chroma/hue-only leaf (Q4) — pick the ΔL that reads as
  a comfortable default foreground; confirm against a few real surfaces.
- Whether `border` shares the text default or wants its own (borders are ~always explicit in
  practice, so likely moot).
