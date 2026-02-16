# Concept Notes

## Dynamic Luminance Offsets (bg-lighten / bg-darken)

### Core idea

One-off luminance adjustments for state/emphasis (hover, active, focus) that
read the current `--bg-l` value and apply `calc()` offsets — without modifying
`--bg-l` itself, so these don't cascade to children. They're leaf-level tweaks.

### Direction-aware emphasis

"Lighten" and "darken" are perceptually clear but mode-dependent for emphasis.
A hover state on a surface should "move away from the surface" — which means +L
in dark mode, -L in light mode.

Solution: a `--lu-dir` multiplier:

```css
:root       { --lu-dir: -1; }   /* light mode: away from surface = decrease L */
:root.dark  { --lu-dir:  1; }   /* dark mode:  away from surface = increase L */
```

Then a utility like `bg-emphasis-1` computes:

```css
background-color: oklch(
  calc(var(--bg-l) + var(--lu-dir) * 0.08)
  var(--bg-c)
  var(--bg-h)
);
```

Each step equals one luminance stop on the 0–10 scale (~0.08 in OKLCH L).

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
