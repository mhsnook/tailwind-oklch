# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html),
but it is pre-1.0 so we are informal and almost everything gets a minor version bump.

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
  working against the cascade. Split them into axes and hoist hue/chroma to a
  `hue-*` / `chroma-*` seeder.
- **The `none` / `base` / `fore` / `full` luminance aliases.** The scale is just
  `0`–`10`, with `0`/`10` as the pure extremes. Replace `base` → `1`,
  `fore` → `9`/`10`, `none` → `0`, `full` → `10`.

### Changed

- **Renamed the axis prefixes to `lum` / `chroma` / `hue`** for readability now that
  all three axes are first-class: `{prop}-lc-*` → `{prop}-lum-*`,
  `{prop}-c-*` → `{prop}-chroma-*`, `{prop}-h-*` → `{prop}-hue-*` (e.g. `bg-lc-5` →
  `bg-lum-5`, `bg-c-mid` → `bg-chroma-mid`, `text-h-info` → `text-hue-info`). The
  global seeders are `hue-*` and `chroma-*`.
- **Chroma stops spelled out** — `lo`/`mlo`/`mhi`/`hi` → `low`/`mlow`/`mhigh`/`high`
  (`mid` unchanged). Whole words for anything five letters or fewer; the same
  `low·mlow·mid·mhigh·high` scale is reused across axes wherever it fits.
- **Luminance scale reindexed to a plain white→black ramp.** `lum-0` is now pure
  white (light) / pure black (dark) — the page-ward extreme — instead of the old
  near-page 0.95. Everyday surfaces shift down: a near-page background is `lum-1`,
  a card `lum-2`. The low end is finely graded (0→1→2 are small steps) and opens
  up toward the dark end, matching where the eye is sensitive.
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
