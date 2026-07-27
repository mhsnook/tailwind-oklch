# tailwind-oklch — the B1 model

**Status:** draft spec · target for the next major model revision · **breaking** (pre-1.0, expected).

The design we converged on for making the system as small and as explainable as possible:
**one surface, one foreground, one mood; everything else a leaf.** It collapses the ~72
cascading axis variables to a handful, dissolves several known bugs by construction, and
reduces the developer's model to a few one-sentence rules.

---

## 1. One-page overview

A color is `oklch(L C H)`. The three axes are sourced differently, and that difference
*is* the model.

**Two things cascade (the "environment" — see §2):**

- **Luminance cascades as two references:** a **surface** (`--surface-l`, set by `bg-lum-*`)
  and a **foreground** (`--text-l`, set by `text-lum-*`). A surface is what descendants
  *contrast against*; the foreground is the ambient text lightness they *adopt*.
- **Hue and chroma cascade as a mood** (`--mood-hue`, `--mood-chroma`), set property-less
  (`hue-danger`, `chroma-high`).

**Everything else is a leaf** — it paints one element from the environment and writes no
cascading variable.

The rules, flat:

1. **Absolute luminance, anywhere:** `bg-lum-3`, `text-lum-9`, `border-lum-4`. Absolute
   *background* luminance cascades as `--surface-l`; absolute *text* luminance cascades as
   `--text-l`; absolute luminance on any other property is a pure leaf.
2. **Relative luminance forks by target:**
   - **backgrounds → bumps** (`bg-lum-up/down-N`): a *new surface*, off the **parent** surface.
   - **everything else → contrast** (`text-con-*`, `border-con-*`): a *leaf color*, off the
     **immediate** surface. Contrast never cascades — it is local, like plain CSS.
3. **Hue/chroma:** property-less → cascades (mood); property-full → variable-leaf (paints, no cascade).

The fork in rule 2 is principled: a background **is** a surface (its relative move is another
surface off its parent); everything else **sits on** a surface (its relative move is measured
against that surface). Bumps make surfaces; contrast reads them.

> **Why luminance cascades in two places but hue/chroma in one.** Hue and chroma have a
> property-less *mood* form to carry their cascade, so `text-hue-*`/`text-chroma-*` can be pure
> leaves. Luminance has no mood form (bare `lum-*` would be an "invisible surface" that lies to
> contrast — rejected), so the cascade vehicles are the setters themselves: `bg-lum-*` for the
> surface, `text-lum-*` for the foreground.

---

## 2. The two planes (why the model behaves as it does)

Everything follows from CSS having **two independent inheritance systems**, and our using
them for two different jobs.

**Plane 1 — Variables (the signals / context).** Custom properties (`--surface-l`,
`--text-l`, `--mood-hue`, `--mood-chroma`). They **all inherit by default** — the reactive
context flowing down the tree. This is the only plane that carries state.

**Plane 2 — Painted colors (the rendered output).** The actual `color`, `background-color`,
`border-color`, `fill`, `stroke`, … computed *from* Plane 1. Among them `color`, `fill`, and
`stroke` **inherit** (text and SVG ink); `background-color`, `border-color`, and the rest are
per-element and inherit nothing.

**Plane 1 has two roles** — and this is the part I earlier got wrong by saying leaves "paint
inline, write no variable." They *do* write variables; the trick is *which* variables:

- **Cascading signals** (`inherits: true`): the environment — `--surface-l`, `--text-l`,
  `--mood-hue`, `--mood-chroma`. Seeders and surfaces write these.
- **Per-element inputs** (`inherits: false`, `syntax: "*"`): one set per painting property —
  `--tx-l/-c/-h` for text, `--bd-l/-c/-h` for border, `--fl-*` for fill, etc. A *leaf* writes
  these. They feed *this element's* paint and **do not cascade** (so they can't leak — #11).
  Unset, they fall back to the cascading signal: `var(--tx-c, var(--mood-chroma))`.

That per-element role is the "third category" — a class that changes *this element's* copy of a
variable without cascading it. It's the answer to composition (next), and I was wrong to say it
didn't exist.

**Composition — why leaves must not each paint their own color.** Every painter for a given
property emits the *same canonical* declaration —
`color: oklch(var(--tx-l, …) calc(var(--tx-c, …) * …) var(--tx-h, …))` — and each utility sets
just *its* per-element input. So `text-con-mid text-chroma-max` composes: `con` writes `--tx-l`
(its computed contrast luminance), `chroma` writes `--tx-c`, both emit the identical `color`, and
whichever wins the cascade paints from *all* the current inputs — **order-independent, no
competition.** The bug in 0.7 is precisely that `text-con` painted a *different* expression and
never wrote `--tx-l`, so `text-chroma` (painting at a stale `--tx-l`) silently beat it. In B1
`con` funnels its luminance into the shared `--tx-l`, and the whole family composes.

**The one-way rule:**

> A color calculation reads **only Plane-1 variables**, never the inherited computed color.
> The painted color is a *terminal output* — it flows to descendants that don't paint, and it
> is never an input to anything.

So an element that repaints throws away the inherited `color` and re-derives from the
variables (a color is atomic — you can't decompose an inherited `oklch()` back to L/C/H).
That is why repainting *any* text axis re-resolves *all three* from the current environment.

Think of it as Solid-style signals: **variables are signals; a painting element is a
component that reads the signals and renders a color; the rendered `color` is handed to
children only as an inert default for children that don't render their own.** The one bridge
back from Plane 2 is CSS's `currentColor` (e.g. SVG `fill-current`) — that's CSS's mechanism,
not ours.

**Consequence to design around:** a mood (or any signal) only shows through elements that
**paint**. `<div class="hue-accent"><p>x</p></div>` leaves the bare `<p>` untinted — nothing
read the signal. Add `text-con-*` to the `<p>` and it subscribes. In practice text is painted
almost everywhere, so this rarely surprises — but it's why the library should establish a
**default text paint at `:root`** (a baseline `color`, e.g. `text-lum-10`), so all text starts
painted, readable, and seeded with `--text-l`.

---

## 3. The cascading variables

The entire variable cascade (registered via `@property`, `<number>`, `inherits: true`):

| Var             | Meaning                              | `:root` default        | `.dark`        |
|-----------------|--------------------------------------|------------------------|----------------|
| `--surface-l`   | the **surface** luminance            | `lum-1` (page-hugging) | flips          |
| `--text-l`      | the **foreground** (text) luminance  | `lum-10` (strong fg)   | flips          |
| `--mood-hue`    | ambient hue angle                    | `--hue-primary` (233)  | —              |
| `--mood-chroma` | ambient chroma                       | `--chroma-low`         | —              |
| `--mood-cscale` | ambient per-hue chroma multiplier    | `--cscale-primary`     | —              |
| `--lum-dir`     | contrast/bump direction (−1 / +1)    | `-1`                   | `1`            |
| `--lum-flip`    | arbitrary-value auto-flip (0 / 1)    | `0`                    | `1`            |
| `--con-flip`    | surface L where contrast flips pole  | mid(lum-5,lum-6) light | dark midpoint  |

**8 cascading vars**, down from ~72. The four "environment" signals are `--surface-l`,
`--text-l`, `--mood-hue`, `--mood-chroma` (`--mood-cscale` rides with the hue; the rest are
mode/scale constants). Note the surface needs only a *luminance* — a surface's chroma/hue come
from the mood, so there is no `--surface-c`/`--surface-h`.

> **Changed from today:** `--surface-l` defaults to `lum-1` (the page is the surface), not
> `lum-5` (field-report #3). Gradient stop luminances (`--gf-l`, `--gt-l`) are **not** in the
> cascade — they're leaf paint values (see §5).

---

## 4. How any color resolves

Every painting utility emits one `oklch()`:

```
oklch( <L>  calc(<C> * <cscale> * <taper(L)>)  <H> )
```

- **`<L>`** comes from one source, in precedence on the element itself: a bump (bg only) → an
  absolute `lum-N` → a contrast `con-*` (non-bg) → else, for text, the inherited **`--text-l`**.
- **`<C>`** = the element's own `chroma-*` override, else the ambient `--mood-chroma`.
- **`<cscale>`** = the multiplier for the element's own `hue-*` override, else `--mood-cscale`.
- **`<H>`** = the element's own `hue-*` override, else the ambient `--mood-hue`.
- **`taper(L)`** = `clamp(0, calc((1 - L) * --chroma-taper), 1)`.

Luminance scale (unchanged): front-loaded ramp, numbered `1..10`, auto-flipping for dark;
`none`/`max` are the pure poles outside the numbered range. Contrast is auto-directional:
`--con-dir = clamp(-1, (--con-flip − --surface-l) × 1000, 1)`, and
`L_con = clamp(0, --surface-l + --con-dir × offset, 1)`.

---

## 5. Utility families (what each emits)

| Family              | Examples                          | Cascading var (`inherits:true`)          | Per-element input (`inherits:false`) | Paints (Plane 2)      |
|---------------------|-----------------------------------|------------------------------------------|--------------------------------------|-----------------------|
| **Surface**         | `bg-lum-3`, `bg-lum-[60]`         | `--surface-l`                            | —                                    | `background-color`    |
| **Bump**            | `bg-lum-up-1`, `bg-lum-down-2`    | `--surface-l` (off parent)               | —                                    | `background-color`    |
| **Foreground**      | `text-lum-9`, `text-lum-[40]`     | `--text-l`                               | `--tx-l`                             | `color` (inherits)    |
| **Mood**            | `hue-danger`, `chroma-high`       | `--mood-hue`/`-cscale`, `-chroma`        | —                                    | nothing               |
| **Contrast leaf**   | `text-con-mid`, `border-con-low`  | —                                        | `--tx-l` / `--bd-l` (computed)       | that property         |
| **Absolute leaf**   | `border-lum-4`, `fill-lum-6`      | —                                        | `--bd-l` / `--fl-l`                  | that property         |
| **Variable-leaf**   | `text-chroma-max`, `text-hue-danger` | —                                     | `--tx-c` / `--tx-h`                  | that property         |

Every painter for a property emits **one canonical** `oklch()` over that property's inputs
(`var(--tx-l, var(--text-l))`, `var(--tx-c, var(--mood-chroma))`, `var(--tx-h, var(--mood-hue))`),
so leaves on one element **compose** rather than compete (§2). Inputs are per-property namespaced
(`--tx-*` vs `--bd-*` vs `--fl-*`), so text/border/fill never collide.

Notes:

- **Surface** publishes `--surface-l` and the anchor bumps measure from; it's the only thing
  whose luminance descendants *contrast against*.
- **Bump** reads the parent surface and writes a new `--surface-l`. Cycle-free alone; an
  absolute stop **and** a bump on the **same element** form a cycle that degrades to the
  parent surface (registered inheriting vars) — disallowed by convention.
- **Foreground** (`text-lum-*`) is the luminance counterpart to the mood: it cascades
  `--text-l` *and* paints `color`. Absolute, so cascading it forms no cycle. Text-only —
  `border-lum`/`ring-lum`/etc. are absolute **leaves** (a border's luminance isn't environmental).
- **Contrast leaf** reads `--surface-l` (own or inherited) and writes its computed luminance to
  the property's *per-element* input (`--tx-l`, `--bd-l`) so chroma/hue leaves compose with it —
  but never to a cascading var, so contrast stays local (doesn't leak to descendants). `bg` has no
  contrast (a surface can't contrast itself); non-bg props have no bump (they don't make surfaces).
- **Fill / stroke** (`fill-lum/chroma/hue-*`, `stroke-*`) are painting families like text, with
  their own `--fl-*` / `--st-*` inputs — for chart ink and icons. `fill`/`stroke` inherit in CSS,
  so they behave like `color`. (Runtime hue theming stays one variable, `--mood-hue`, no matter how
  many painting properties exist — see §7, dissolving the "growing internal var list" problem.)
- **Gradients** (`from-lum-*`/`to-lum-*`) are pure leaves — they paint the stops and don't
  touch `--surface-l`. For contrast on a gradient tile, also state `bg-lum-N` (it paints a real
  background under the gradient and declares the contrast surface): `from-lum-1 to-lum-5 bg-lum-3
  text-con-high`. No `bg-lum-*` → the tile inherits its parent surface. (Folds #2 into invariant 2.)

---

## 6. Invariants (the rules, stated flat)

1. **Luminance cascades as a surface (`--surface-l`, from `bg-*`) and a foreground
   (`--text-l`, from `text-lum-*`).** No other property's luminance cascades.
2. **A surface you want contrast against must be stated with `bg-lum-*`.** A `bg-white`, a
   token, or a raw gradient leaves `--surface-l` stale and contrast measures a phantom.
3. **Bumps only on backgrounds; contrast only on non-backgrounds.**
4. **Never combine an absolute `bg-lum-N` and a bump on one element** (cycle → parent surface).
5. **Hue/chroma cascade only when property-less; contrast never cascades** (both are local
   leaves — `text-con-low` on an area doesn't survive a descendant's repaint; `text-lum-7` does).
6. **A signal shows only through elements that paint.** Set moods/foreground at or above where
   painting happens; establish a default text paint at `:root`.
7. **Bare seeders never paint; per-property setters always paint.** `chroma-high`/`hue-danger`
   write a cascading signal and render nothing (use them for "this subtree is danger-coloured").
   `text-chroma-high`/`text-hue-danger` write a per-element input and render `color` (use them for
   "this element"). This is *why* the seeder is the right tool for a subtree and the setter is wrong
   for one — and worth stating in user docs.
8. **Same-property leaves compose, order-independently.** Any mix of `{con|lum} × chroma × hue`
   on one element resolves to a single color, because they funnel into shared per-property inputs
   and emit one canonical paint (§2). No "later class silently wins."

---

## 7. What's deleted vs. today

- **All per-property luminance vars except the two that cascade** — gone: `--dc-l`, `--bd-l`,
  `--bd{t,r,b,l,x,y,s,e}-l`, `--ac-l`, `--sh-l`, `--rg-l`, `--ro-l`. Kept/renamed: `--bg-l →
  --surface-l`, and `--tx-l → --text-l` (now the cascading foreground).
- **All per-property hue/chroma cascade** — the `--{stem}-c/-cs/-h` sets collapse to the
  single `--mood-chroma` / `--mood-cscale` / `--mood-hue`. Per-property setters stay as leaves.
- **`--bg-anchor-l` stays** (renamed with the surface) since bg bumps are kept.

Per-property setters (`text-hue-danger`, `border-chroma-max`, `border-lum-4`) still exist and
paint exactly as before — they simply become leaves (write no cascading variable).

---

## 8. Field-report bugs: dissolved vs. promoted

**The "three bugs of one shape"** — all "utility A writes a var B reads, or fails to write one
B needs," all silent — are dissolved by the same mechanism: **per-property namespaced inputs +
one canonical paint** (§2, §5).

- **#4 (`text-con`/`border-con` share `--con-off`/`--con-dir`)** — each con leaf computes into
  its *own* property input (`--tx-l` vs `--bd-l`); nothing is shared to collide.
- **#new (`text-chroma`/`text-hue` beat `text-con` at a stale `--tx-l`)** — `con` funnels its
  luminance into `--tx-l`, and every text painter emits the same canonical `oklch()`, so the
  family composes in any order instead of the last class winning.
- **#2 (gradient `--gf-l` vs `con`'s `--surface-l`)** — gradients declare `bg-lum-*` for the
  contrast surface (invariant 2); stops never masquerade as the surface.

**Also dissolved:**

- **#11 (chroma/hue leak to descendants)** — per-property setters write `inherits:false` inputs,
  so `border-chroma-max` can't reach a descendant's border. (A milder luminance path remains via
  `--text-l`, by design; luminance-leak is benign and shared primitives pin their own.)
- **#1 (bg nudge cycle → transparent)** — degrades gracefully via `@property`; the cycle can
  only arise from the disallowed absolute+bump combo (invariant 4).
- **#7 (runtime `--hue-primary` below `:root` does nothing; the internal var list keeps growing)**
  — hue cascades as **one** `--mood-hue`; runtime/per-language theming sets that single variable,
  regardless of how many painting properties (text, border, fill, stroke, …) exist.

**Promoted to prerequisites:**

- **#3** — default `--surface-l` = `lum-1`; the "surfaces must be `bg-lum-*`" rule.
- **#2** — folds into invariant 2 (gradients declare `bg-lum-*` for contrast).

---

## 9. Migration (sunlo) — deltas & checklist

Most of the app is untouched (from the v0.7-conversion usage survey):

- **Unchanged:** `bg-lum-*` (313), `text-con-*`/`border-con-*` (~750), `text-lum-*` (91),
  bare `hue-*`/`chroma-*`.
- **Now leaves (identical paint; verified all on painting leaves, zero container-cascade
  reliance):** `text-chroma-*`, `border-chroma-*`, `text-hue-*`, `border-hue-*` (~130 sites).
- **`text-lum-*` now also cascades `--text-l`** — a *new* behavior. Repainting descendants
  that state only chroma/hue will now inherit the ancestor's text luminance instead of a fixed
  default. Confirm no place relied on the old "each text restates its own lightness" default in
  a way this changes; expected impact is nil-to-positive.
- **`bg-lum-up-*` (6 sites):** kept. Audit for the disallowed same-element absolute+bump combo.

**Checklist:**

- [ ] `lang-theme.ts` / runtime theming: per-property hue vars (`--bg-h`, `--dc-h`, …) collapse
      to setting **`--mood-hue`** (+`--mood-cscale`) once — a strict simplification that also
      fixes field-report #7 (runtime `--hue-primary` below `:root`). Rewrite these call-sites.
- [ ] `globals.css`: references to deleted internal vars, and the custom neutral-hue setup,
      re-expressed against `--mood-*`.
- [ ] Establish/confirm a default text paint at `:root` so unstyled text is seeded (§2, §6.6).
- [ ] No surface painted by a non-`lum` background where contrast is expected (invariant 2).

---

## 10. Resolved decisions

- **Q1 — named `con` readability guarantee: deferred.** Named `con-low..max` stay fixed ΔL
  offsets; a WCAG/APCA-guaranteeing tier is a later feature.
- **Q2 — gradients don't set `--surface-l`.** Declare `bg-lum-*` on a gradient tile for
  contrast (§5). Keeps `from-lum-1 to-lum-5 bg-lum-3` controllable; folds #2 into invariant 2.
- **Q3 — no `surface-lum-N`.** A `--surface-l` not matching painted pixels makes contrast lie;
  surfaces must actually paint. Image/token surfaces use absolute `text-lum-*` for legibility.
- **Q4 — chroma/hue-only leaf luminance = inherited `--text-l`.** Resolved by the `text-lum`
  cascade decision: the "default" foreground *is* the `--text-l` signal (default `lum-10`).
- **`text-lum-*` cascades `--text-l` (text-only).** Absolute foreground luminance is an
  environment signal; contrast stays local; hue/chroma stay leaves (mood is their vehicle).
- **`fill-*` / `stroke-*` are first-class painting families** (chart ink, icons), each with
  their own per-element inputs — thanks to the sunlo implementation. Runtime hue theming still
  touches only `--mood-hue`.
- **Variable renaming (cascading signals):** `--bg-l → --surface-l`, `--hue → --mood-hue`,
  `--chroma → --mood-chroma`, `--cscale → --mood-cscale`, and the cascading foreground is
  `--text-l`. The *per-element inputs* keep short property-namespaced names (`--tx-l/-c/-h`,
  `--bd-*`, `--fl-*`, `--st-*`). Class names unchanged.

## 11. Recommended patterns (proven in the sunlo migration)

- **Global focus ring with `outline-con-*`.** One rule, no per-component opt-in; because `con`
  measures the element's own surface, it's correct on a page, a card, or a coloured button, and
  follows per-language hue for free:
  ```css
  :focus-visible { --bd-c: var(--mood-chroma); @apply outline-con-high outline-2 outline-offset-2; }
  ```
  Replaced 53 per-component focus-ring restatements.
- **`--lum-max` / `--lum-none` as auto-flipping values in arbitrary CSS.** The poles aren't just
  scale endpoints — reach for them anywhere a raw value must flip light/dark:
  `oklch(var(--lum-max) 0 0)` replaces a `dark:`-gated pair of hand-coded black/white values.

## 12. Still to decide during implementation

- Exact `:root` `--text-l` default (a comfortable strong foreground; `lum-10` proposed) and
  the default text paint at `:root`.
- Default luminance for a *non-text* leaf that states only chroma/hue (e.g. `border-chroma-*`
  alone) — no `--text-l` counterpart there; likely a contrast default off the surface.
- Whether any non-text property ever wants the foreground cascade (currently text-only).
