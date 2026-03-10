# Plan: Luminance Scale Redesign (LC → LUM)

## Summary

Replace the linear 0-10 "luminance contrast" scale with a perceptually-tuned 1-12 luminance scale. Language is always anchored in light-mode terms (lum-1 = darkest, lum-12 = lightest). Dark mode auto-flips the values. A new interactive Luminance Explorer on the demo page provides a draggable bezier curve editor to shape the distribution, theme toggle, and legibility preview.

## Scale Design

- **none** = 0 (pure black in light mode, pure white in dark)
- **lum-1** = theme-min (default 0.13) — darkest themed stop
- **lum-2 through lum-11** — 10 interior stops from cubic bezier curve
- **lum-12** = theme-max (default 0.96) — lightest themed stop
- **full** = 1.0 (pure white in light mode, pure black in dark)

Dark mode: lum-1 flips to 0.96 (lightest), lum-12 flips to 0.13 (darkest). The whole scale reverses.

Default bezier produces values ≈: 13, 18, 24, 31, 39, 49, 59, 69, 78, 85, 91, 96

## Phase 1: Core CSS (`index.css`)

1. Replace `--lc-*` variables with `--lum-*`:
   - `--lum-flip: 0` (light) / `1` (dark)
   - `--lum-dir: -1` (light) / `1` (dark)
   - `--lum-min: 0.13` / `--lum-max: 0.96` (light defaults)
   - `--lum-1` through `--lum-12` (bezier-generated values)
   - `--lum-none: 0` / `--lum-full: 1`
   - `--lum-adj-1` through `--lum-adj-5` (relative offsets)
2. Dark mode block: reverse all `--lum-N` values (lum-1 gets lum-12's light value, etc.)
3. Rename all `@utility` directives: `bg-lc-*` → `bg-lum-*`, etc.
4. Update cascade defaults: `--bg-l`, `--tx-l`, `--bd-l`, etc.

## Phase 2: Plugin (`plugin.js`)

1. Rename `lc` → `lum` in all matchUtilities calls
2. Update flip formula to reference `--lum-flip` instead of `--lc-flip`
3. Update comments

## Phase 3: Demo Config (`color-config.ts`)

1. New `LUM_STOPS` array (1-12)
2. `generateLumScale(min, max, bezier)` — cubic bezier interpolation
3. New range constants
4. Export bezier defaults

## Phase 4: Update All Demo Components

Rename every `lc-*` class to `lum-*` with correct stop mapping:
- Old 0 (lightest) → new 12; old 10 (darkest) → new 1
- `ColorMatrix.tsx`, `HueControls.tsx`, `ComponentDemos.astro`, `HueContextDemo.tsx`, `RelativeLuminanceDemo.astro`, `CodeExamples.tsx`, `ThemeToggle.tsx`, `global.css`, `index.astro`

## Phase 5: New `LuminanceExplorer.tsx` Component

### A. Bezier Curve Editor (SVG)
- SVG canvas showing the mapping curve: X axis = stop index (1-12), Y axis = OKLCH lightness (min→max)
- Two draggable control points for the cubic bezier
- Dots on the curve showing where each of the 12 stops lands
- Real-time update as user drags control points
- Display the bezier values (e.g., `cubic-bezier(0.3, 0.0, 0.7, 1.0)`)

### B. Theme Controls
- Sliders for theme-min and theme-max
- Light/dark toggle
- Hue picker (to color the swatches)

### C. Color Sample Grid
- 14 swatches (none + 1-12 + full)
- Each swatch: colored background at that luminance, mid chroma, current hue
- "Aa" text in white overlaid + "Aa" text in black overlaid
- WCAG contrast ratio for each pairing
- Green/yellow/red indicator (≥4.5:1 AA / ≥3:1 AA-large / fail)

### D. CSS Variable Sync
- Changes push to `document.documentElement.style` so the rest of the page updates live
- Dispatch `hue-change` events for other components

## Stop Mapping (old → new)

| Old | New | Light L |
|-----|-----|---------|
| lc-0/base (0.95) | lum-12 (0.96) | lightest |
| lc-1 (0.87) | lum-10 (~0.85) | |
| lc-2 (0.79) | lum-9 (~0.78) | |
| lc-3 (0.71) | lum-8 (~0.69) | |
| lc-5 (0.55) | lum-6 (~0.49) | midpoint |
| lc-7 (0.39) | lum-4 (~0.31) | |
| lc-8 (0.31) | lum-3 (~0.24) | |
| lc-10/fore (0.15) | lum-1 (0.13) | darkest |
| lc-none (1.0) | lum-full (1.0) | |
| lc-full (0.0) | lum-none (0.0) | |
