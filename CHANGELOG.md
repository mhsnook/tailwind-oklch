# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
</content>
</invoke>
