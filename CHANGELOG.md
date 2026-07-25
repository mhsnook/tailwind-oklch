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

- **Renamed per-property axis setters** for clarity: `{prop}-c-*` → `{prop}-chroma-*`
  and `{prop}-h-*` → `{prop}-hue-*` (e.g. `bg-c-mid` → `bg-chroma-mid`,
  `text-h-info` → `text-hue-info`). The global seeders `hue-*` and `chroma-*`
  are unchanged.
- **Luminance scale reindexed to a plain white→black ramp.** `lc-0` is now pure
  white (light) / pure black (dark) — the page-ward extreme — instead of the old
  near-page 0.95. Everyday surfaces shift down: a near-page background is `lc-1`,
  a card `lc-2`. The low end is finely graded (0→1→2 are small steps) and opens
  up toward the dark end, matching where the eye is sensitive.
- README and docs rewritten around the character-vs-emphasis model.

### Added

- **Per-hue chroma normalization.** Each hue carries a `--cscale-*` multiplier and
  every color resolves chroma as `calc(base × scale)`, so a given `chroma-*` stop
  looks about equally saturated across hues (blue no longer reads hotter than
  green). Override `--cscale-*` in `@theme` to retune.
- `scripts/gen-index.js` generates `index.css`, keeping every painting utility's
  `oklch()` expression identical.

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
