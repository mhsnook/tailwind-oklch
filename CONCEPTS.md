# Concept Notes

## Dynamic Luminance Contrast Offsets (bg-emphasis)

### Core idea

One-off luminance adjustments for state/emphasis (hover, active, focus) that
read the current `--bg-l` value and apply `calc()` offsets — without modifying
`--bg-l` itself, so these don't cascade to children. They're leaf-level tweaks.

### Direction-aware emphasis

"Lighten" and "darken" are perceptually clear but mode-dependent for emphasis.
A hover state on a surface should "move away from the surface" — which means +L
in dark mode, -L in light mode.

Solution: a `--lum-dir` multiplier:

```css
:root       { --lum-dir: -1; }   /* light mode: away from surface = decrease L */
:root.dark  { --lum-dir:  1; }   /* dark mode:  away from surface = increase L */
```

Then a utility like `bg-emphasis-1` computes:

```css
background-color: oklch(
  calc(var(--bg-l) + var(--lum-dir) * 0.08)
  var(--bg-c)
  var(--bg-h)
);
```

Each step equals one luminance contrast stop on the 0–10 scale (~0.08 in OKLCH L).

### Step scale

| Utility          | Offset               |
| ---------------- | -------------------- |
| bg-emphasis-1    | 1 step  (~0.08)      |
| bg-emphasis-2    | 2 steps (~0.16)      |
| bg-emphasis-3    | 3 steps (~0.24)      |

Raw `bg-lighten-*` / `bg-darken-*` could also exist for explicit perceptual
control (e.g., `hover:bg-darken-1 dark:hover:bg-lighten-1`).

### Scope

Applies to bg, text, border, and any other property with decomposed L/C/H vars.
No cascade inheritance of the offset — purely local to the element.

### Naming note

The luminance contrast scale uses the `lum-` prefix (e.g., `bg-lum-5`) and is a
plain white→black ramp from `0` to `10` that auto-flips in dark mode:
- `lum-0` = pure white (light) / pure black (dark) — the page-ward extreme
- `lum-1` = blends with the page (lightest usable surface)
- `lum-10` = pure black (light) / pure white (dark) — maximum foreground contrast

As of 0.7 there are no `none`/`base`/`fore`/`full` aliases; `0` and `10` are the
pure extremes and the numbers cover everything between.

## Dynamic Text Contrast from Background (text-contrast-*)

### Core idea

Instead of setting text luminance manually, derive it from the element's
background luminance to guarantee a specific contrast level. The developer
never picks a text luminance — they pick a contrast *intent*:

```html
<div class="bg-lum-2 bg-chr-mid bg-hue-primary">
  <p class="text-contrast-md">Always readable against this background</p>
  <span class="text-contrast-xs">Subtle, muted caption</span>
</div>
```

### Contrast levels (proposed)

| Utility            | Intent               | Approx. APCA Lc |
| ------------------ | -------------------- | ---------------- |
| text-contrast-xs   | Decorative, muted    | Lc ~30-45        |
| text-contrast-sm   | Secondary, metadata  | Lc ~45-60        |
| text-contrast-md   | Body text, readable  | Lc ~60-75        |
| text-contrast-lg   | Headlines, emphasis  | Lc ~75-90        |
| text-contrast-xl   | Max contrast (b/w)   | Lc ~90+          |

### Prior art and references

- **CSS `contrast-color()`** (W3C Level 5/6): binary black/white, limited support
- **Lea Verou's threshold technique**: `oklch(from var(--bg) clamp(...) 0 0)`
- **Material Design 3**: `on-<role>` tokens (static pairs, not dynamic)
- **daisyUI**: `<role>-content` tokens (static pairs)
- **Radix Colors**: Steps 11-12 guarantee Lc 60/90 on step 2
- **tailwindcss-oklch** (MartijnCuppens): `text-bg-contrast` utility with threshold
- **APCA**: The perceptual contrast algorithm for WCAG 3

Key insight: all existing solutions are either binary (black/white) or
pre-calculated static pairs. Graduated contrast levels derived dynamically
from the background luminance would be a novel contribution.

### Implementation approach (CSS-only)

Since `--bg-l` is always a bare OKLCH lightness number (0–1), the text
luminance can be computed with `calc()` by offsetting from it in the
direction of maximum contrast:

```css
@utility text-contrast-md {
  --tx-l: clamp(0, calc(var(--bg-l) + var(--lum-dir) * 0.50), 1);
  color: oklch(var(--tx-l) var(--tx-c) var(--tx-h));
}
```

The `--lum-dir` variable ensures the offset always moves toward the
contrasting end regardless of light/dark mode.
