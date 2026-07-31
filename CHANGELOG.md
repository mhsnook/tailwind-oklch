# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html),
but it is pre-1.0 so we are informal and almost everything gets a minor version bump.

## [Unreleased]

### Added

- **`contrast-*` moods** — `contrast-low/mid/high`, the third cascading mood axis
  alongside `hue-*` and `chroma-*`. A named profile that fans one intent out
  across properties, each to its own step (text a little, borders a lot). Paints
  nothing; the bare `*-con` leaves below inherit it. Defaults are
  `@property`-registered so a bare `text-con` resolves even with no mood set.
- **Bare `*-con`** — `text-con`, `border-con`, `outline-con`, `ring-con`,
  `decoration-con`, `stroke-con`, `fill-con`: a no-op paint at the ΔL the nearest
  `contrast-*` mood set. Apply globally (`* { @apply text-con border-con }`) or
  per component.
- **Numbered contrast bumps** — `con-1..5`, a finer decorative ramp resolved
  through the same utilities as the named stops (`border-con-2`).
- **`stroke-*` / `fill-*` families** — full lum/chroma/hue/con setters for SVG
  paint, plus `stroke-con-*` / `fill-con-*`.
- **`decoration-con-*`** — contrast-aware `text-decoration-color`.
- **`.light`** — the explicit inverse of `.dark`, so the luminance scale flip
  nests both ways: a `.light` island inside a dark page (or a `.dark` region)
  flips back to the light scale. Both are absolute, so they alternate to any depth.
- **`.flip`** — a context-relative scale flip: becomes the opposite of whatever
  scale it sits in, and nested `.flip`s alternate, without hard-coding light/dark.
  Implemented with a style container query on `--lum-flip` (reads the ancestor's
  polarity, applies the opposite — no self-reference cycle). Progressive: a no-op
  where style queries are unsupported (Chrome 111+, Safari 18+, Firefox 128+), so
  `.dark`/`.light` remain the universally-supported absolute tools.

### Changed

- The `con-*` scratch offset is now **per-property** (`--tx-coff`, `--bd-coff`, …)
  instead of a shared `--con-off`, so stacking `con` leaves on one element (e.g.
  `* { @apply text-con border-con }`) no longer cross-wires to a single ΔL.
- **Dark scale retuned.** Light and dark now use separate luminance gammas (light
  1.45, dark 1.15): near black the old front-load crowded the low stops and left
  the mids dark, so dark now spreads the low-stop gaps (e.g. `lum-1`→`lum-2`) and
  sits mid stops lighter (`lum-6` .498 → .559). The named `con-*` ramp is also
  bumped in dark mode (`con-mid` .32 → .40) since dark surfaces need a bigger ΔL
  for the same apparent contrast. Light mode is unchanged.

## [0.8.0] - 2026-07-26

### Added

- **Per-side border colors** — `border-{t,r,b,l}-*` (physical), `border-{x,y}-*`
  (axis), `border-{s,e}-*` (logical), each carrying the full lum/chroma/hue trio;
  a per-side setter overrides all-sides `border-*` on that edge.
- **Ring colors** — `ring-lum/chroma/hue-*` set `--tw-ring-color`; pair with
  Tailwind's `ring-2` to paint.
- **`ring-con-*`** — a contrast-aware ring that auto-picks a luminance against the
  surface, for focus rings that stay visible anywhere.
- **Ring-offset colors** — `ring-offset-lum/chroma/hue-*` set
  `--tw-ring-offset-color`, defaulting to the page pole so it auto-flips for dark mode.

## [0.7.0] - 2026-07-24

A cascade-first overhaul: pure CSS, a re-cut luminance scale, and per-hue chroma.
Breaking throughout — the concepts carry over, but the API surface, the scale,
and the naming all changed. Still pre-1.0; the API isn't settled yet, so expect
further churn.

### Removed

- **The JavaScript plugin (`plugin.js`).** Arbitrary-value support moved into
  pure CSS (paired `@utility` blocks — named value or arbitrary integer,
  whichever resolves wins), so no `@plugin` is needed. Install is now a single
  `@import "tailwind-oklch";`.
- **Shorthand utilities** (`{prop}-{L}-{C}` and `{prop}-{L}-{C}-{H}`, e.g.
  `bg-3-mhi`, `bg-3-mhi-accent`). They re-pinned all three axes on every leaf,
  working against the cascade. Split them into axes and hoist hue/chroma to the
  property-less `hue-*` / `chroma-*` classes.
- **The `base` / `fore` / `full` luminance aliases.** Replace `base` → `1`,
  `fore` → `9`/`10`, `full` → `lum-max`. (The page-pole alias survives, renamed:
  `none` → `lum-none`.)

### Changed

- **Renamed the axis prefixes to `lum` / `chroma` / `hue`** for readability now that
  all three axes are first-class: `{prop}-lc-*` → `{prop}-lum-*`,
  `{prop}-c-*` → `{prop}-chroma-*`, `{prop}-h-*` → `{prop}-hue-*` (e.g. `bg-lc-5` →
  `bg-lum-5`, `bg-c-mid` → `bg-chroma-mid`, `text-h-info` → `text-hue-info`). The
  property-less axis classes are `hue-*` and `chroma-*` — they set an axis for
  every LCH calculation that cascades to them (no "seeder" concept; it's just
  custom-property inheritance).
- **Chroma stops spelled out** — `lo`/`mlo`/`mhi`/`hi` → `low`/`mlow`/`mhigh`/`high`
  (`mid` unchanged). Whole words for anything five letters or fewer; the same
  `low·mlow·mid·mhigh·high` scale is reused across axes wherever it fits.
- **Luminance scale is a front-loaded formula with named poles.** Numbered stops
  `1`–`10` ride a generated ramp (`lum-1` ≈ 0.92 → `lum-10` ≈ 0.13); the pure
  extremes are the named stops `lum-none` (page: white/black) and `lum-max`
  (contrast: black/white), kept out of the numbered range so a low-contrast theme
  can pull the numbers in without losing the poles. `lum-0` is gone — it was just
  `none`. Everyday surfaces: a near-page background is `lum-1`, a card `lum-2`.
- README and docs rewritten around the character-vs-emphasis model.

### Added

- **Per-hue chroma normalization.** Each hue carries a `--cscale-*` multiplier and
  every color resolves chroma as `calc(base × scale)`, so a given `chroma-*` stop
  looks about equally saturated across hues (blue no longer reads hotter than
  green). Override `--cscale-*` in `@theme` to retune.
- `scripts/gen-index.js` generates `index.css`, keeping every painting utility's
  `oklch()` expression identical.
- **Contrast utilities `text-con-*`, `border-con-*`, `outline-con-*`.** Unlike
  `lum-up/down` (measured off the property's own inherited value), `con-*` is
  measured off the element's background (`--bg-l`) and auto-directional — it
  moves toward whichever pole gives contrast, so one class reads correctly on a
  light or dark surface with no `dark:` variant. Strength stops reuse the
  `low·mlow·mid·mhigh·high` scale (here: faint → stark). Inherited hue/chroma are
  kept; only luminance is computed. A leaf utility — it doesn't cascade.
- **Chroma taper toward white (`--chroma-taper`).** A fixed chroma looks far more
  saturated at high luminance, so light surfaces went neon and the lightest stop
  couldn't reach clean white. Chroma is now multiplied by
  `clamp(0, (1 − L) × --chroma-taper, 1)` (default 3): full below L ≈ 0.67,
  ramping to 0 at white. A `chroma-*` stop now looks about equally saturated
  across the scale, light surfaces stay subtle, and the light pole (`lum-none`)
  resolves to true white. Keys on resolved `L`, so it also calms near-white text
  and works in dark mode; tune `--chroma-taper` per theme.
- **`decoration-*` setters** (`text-decoration-color`) — `decoration-lum-*`,
  `decoration-chroma-*`, `decoration-hue-*` — so an underline can sit on its own
  luminance stop, independent of the text color.
- **Contrast crossover follows the scale (`--con-flip`).** `con-*` now flips its
  text direction (black↔white) at the scale's own midpoint — computed per mode —
  instead of a fixed `0.6`, so max contrast switches at the same numbered stop in
  light and dark. (Also fixed a specificity bug where `:root` was emitted after
  `.dark`, so `--lum-dir` / `--lum-flip` / the crossover kept their light values
  in dark mode; `:root` now comes first.)
- **`max` stops for chroma and contrast.** `chroma-max` (base 0.25) overshoots the
  sRGB gamut so `oklch()` maps each hue to its most saturated displayable color —
  "full color, whatever that is here." `text-con-max` / `border-con-max` /
  `outline-con-max` use a ≥1 offset so the clamp always snaps to pure black or
  white — a guaranteed `contrast-color()` regardless of surface, where the graded
  `con-high` only reaches the extreme on mid-range surfaces.
- **`--bg-l` now tracks the real surface through relative nudges.** `bg-lum-up/down`
  reads its step from a new `--bg-anchor-l` (the nearest absolute `bg-lum-N`) and
  writes the result into `--bg-l`, so the contrast utilities always measure
  against the background that actually exists — including a nudge above them —
  while nudges still don't compound (they measure from the anchor, never from a
  parent's already-nudged value). This is also a hard CSS constraint: a custom
  property can't derive from its own inherited value without forming a cycle.

### Migration

See the "Migrating to 0.7" section in the README.

## [0.6.0] - 2026-05-21

### Changed

- Light mode is now the default color mode. `@theme` seeds light-mode luminance
  values and the `.dark` class opts into dark mode (previously inverted).
- The light-mode luminance scale now follows a power curve (p≈1.3) for more
  perceptually even steps.

### Removed

- Numeric chroma scale (`--c-10` … `--c-95`). Its overlap with the named chroma
  stops and arbitrary-value syntax was confusing — use named stops or arbitrary
  values instead.

### Added

- README "Arbitrary Values" section documenting the bracket syntax for hue,
  chroma, and auto-flip luminance.

## [0.5.0] - 2026-02-27

### Added

- Arbitrary value support for hue, chroma, and auto-flip luminance.

### Changed

- Arbitrary chroma now uses an integer scale (`chroma-[15]` → `0.15`).

## [0.4.0]

### Added

- Global `hue-*` and `chroma-*` utilities.
- Two-axis shorthand utilities.

## [0.3.0]

### Added

- `lc-up-*` / `lc-down-*` directional luminance adjustment utilities.
- Relative luminance offsets.

## [0.2.0]

### Changed

- Reframed the luminance scale as a luminance-contrast scale.
- Renamed the luminance utility prefix from `lu-` to `lc-`.

### Added

- `lc-none` / `lc-full` for absolute luminance extremes.

## [0.1.0]

### Added

- Initial release: an OKLCH color composition system for Tailwind CSS v4.
- 0–10 numeric luminance scale and named chroma stops.
