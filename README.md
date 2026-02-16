# tailwind-oklch

An okLCH color composition system for Tailwind CSS. Uses independent CSS variables for **luminance**, **chroma**, and **hue**, so you can use atomic utility classes to
modify just the luminance for emphasis (with no opacity hacks), just the chroma for decoration, just the hue
for theme or semantic meanings.

_Note: This is a working concept; it's not really in production anywhere; YMMV._

## Why okLCH?

**okLCH** (Lightness, Chroma, Hue) is a perceptually uniform color space. Unlike HSL, colors at the same lightness and chroma look equally bright regardless of hue. This makes it possible to build systematic, predictable color palettes from simple numeric scales instead of hand-picking individual hex values.

`tailwind-oklch` takes this further: instead of defining dozens of static color tokens, you compose colors on the fly from three axes. CSS custom property inheritance means a parent can set a hue and children automatically share it — override just the axis you need.

## Installation

```bash
pnpm add tailwind-oklch
```

## Setup

In your main CSS file, import both the core CSS and the shorthand plugin:

```css
@import "tailwindcss";
@import "tailwind-oklch";
@plugin "tailwind-oklch/plugin";
```

## Core Concepts

### The Three Axes

Every color is built from three independent pieces:

| Axis | What it controls | Example values |
|---|---|---|
| **Luminance (L)** | Lightness, on a 0–10 scale | `0`–`10`, `base`, `fore` |
| **Chroma (C)** | Colorfulness / saturation | `lo`, `mlo`, `mid`, `mhi`, `hi` |
| **Hue (H)** | Color identity | `primary`, `accent`, `success`, `warning`, `danger`, `info`, `neutral` |

### Surface-Anchored Luminance

The 0–10 scale is anchored to your page surface, not to absolute black/white:

- **0 / `base`** = page surface (dark in dark mode, light in light mode)
- **10 / `fore`** = maximum contrast with the surface
- **1–9** = evenly distributed between those endpoints

This means `bg-lu-3` always means "3 steps away from the surface" regardless of light or dark mode.

### CSS Cascade Inheritance

Every utility both **sets its axis variable** and **applies the resolved `oklch()` color**. Sensible defaults are provided at `:root`, so a single class like `bg-lu-5` immediately produces a visible color. Variables inherit down the DOM, so a parent's hue automatically flows to children.

## Usage

### Decomposed Utilities (single-axis control)

Set one axis at a time. The other two axes inherit from the parent or the root defaults.

| Pattern | Sets | Example |
|---|---|---|
| `bg-lu-{L}` | background luminance | `bg-lu-5`, `bg-lu-base`, `bg-lu-fore` |
| `bg-c-{C}` | background chroma | `bg-c-lo`, `bg-c-mid`, `bg-c-hi` |
| `bg-h-{H}` | background hue | `bg-h-primary`, `bg-h-accent`, `bg-h-danger` |
| `text-lu-{L}` | text luminance | `text-lu-fore`, `text-lu-8` |
| `text-c-{C}` | text chroma | `text-c-mid` |
| `text-h-{H}` | text hue | `text-h-accent` |
| `border-lu-{L}` | border luminance | `border-lu-3` |
| `border-c-{C}` | border chroma | `border-c-mlo` |
| `border-h-{H}` | border hue | `border-h-neutral` |

The same pattern applies to `border-b-*` (border-bottom), `accent-*`, `from-*` (gradient from), `to-*` (gradient to), and `shadow-*`.

### Shorthand Utilities (all axes at once)

The plugin generates shorthands that set all three axes in a single class:

```
{property}-{L}-{C}-{H}
```

Examples:

```html
<div class="bg-3-mhi-accent">          <!-- L=3, C=medium-high, H=accent -->
<p class="text-fore-lo-neutral">       <!-- L=foreground, C=low, H=neutral -->
<div class="border-5-mid-primary">     <!-- L=5, C=medium, H=primary -->
```

Available properties: `bg`, `text`, `border`, `border-b`, `accent`, `from`, `to`.

### Combining Decomposed and Shorthand

The real power comes from combining both. Set a full color on a parent, then override a single axis on children:

```html
<!-- Parent sets the full color context -->
<div class="bg-3-mhi-accent text-fore-lo-accent">

  <!-- Child lightens only the background on hover -->
  <button class="hover:bg-lu-6">Lighter on hover</button>

  <!-- Child uses surface luminance, inherits chroma + hue -->
  <footer class="bg-lu-base">Same accent hue, surface brightness</footer>

  <!-- Child switches to a different hue, keeps luminance + chroma -->
  <aside class="bg-h-success">Success-colored sidebar</aside>
</div>
```

### Using with Tailwind Modifiers

All utilities work with standard Tailwind modifiers:

```html
<button class="bg-3-mid-primary hover:bg-lu-5 focus:bg-lu-6">
  Hover and focus states
</button>

<div class="bg-lu-base dark:bg-lu-1">
  Responsive to color scheme
</div>

<input class="border-lu-3 focus:border-c-mid focus:border-h-primary">
  Border chroma increases on focus
</input>
```

### Gradients

```html
<div class="bg-gradient-to-r from-3-mid-primary to-3-mid-accent">
  Gradient from primary to accent
</div>

<!-- Or decomposed: override just the hue on the "to" end -->
<div class="bg-gradient-to-r from-3-mid-primary to-h-accent">
  Same luminance and chroma, different hue
</div>
```

## Customization

### Custom Hues

Override the default hue values in a `@theme` block:

```css
@theme {
  --hue-primary: 180;   /* teal */
  --hue-accent: 320;    /* pink */
}
```

Default hue values:

| Name | Default | Color |
|---|---|---|
| `primary` | 233 | blue/indigo |
| `accent` | 350 | red/pink |
| `success` | 145 | green |
| `warning` | 55 | yellow |
| `danger` | 15 | orange-red |
| `info` | 220 | blue |
| `neutral` | 260 | purple-gray |

### Custom Luminance Range

Shift the overall luminance endpoints:

```css
@theme {
  --lu-range-start: 0.15;   /* darker surface in dark mode */
  --lu-range-end: 0.95;     /* brighter foreground in dark mode */
}
```

### Runtime Theming

Because everything is driven by CSS custom properties, you can re-theme the entire app at runtime:

```js
// Switch the primary hue to teal
document.documentElement.style.setProperty('--hue-primary', '180');
```

## Reference

### Luminance Scale

| Stop | Dark Mode | Light Mode |
|---|---|---|
| `0` / `base` | 0.12 | 0.95 |
| `1` | 0.20 | 0.87 |
| `2` | 0.28 | 0.79 |
| `3` | 0.36 | 0.71 |
| `4` | 0.44 | 0.63 |
| `5` | 0.52 | 0.55 |
| `6` | 0.60 | 0.47 |
| `7` | 0.68 | 0.39 |
| `8` | 0.76 | 0.31 |
| `9` | 0.84 | 0.23 |
| `10` / `fore` | 0.92 | 0.15 |

### Named Chroma Stops

| Name | Value | Description |
|---|---|---|
| `lo` | 0.02 | Near-neutral, subtle tint |
| `mlo` | 0.06 | Low saturation |
| `mid` | 0.12 | Medium saturation |
| `mhi` | 0.18 | Vivid |
| `hi` | 0.25 | Maximum saturation |

A numeric chroma scale (`c-10` through `c-95`) is also available for finer control in the decomposed utilities.

### Supported Properties

| Prefix | CSS Property | Decomposed | Shorthand |
|---|---|---|---|
| `bg` | `background-color` | `bg-lu-*`, `bg-c-*`, `bg-h-*` | `bg-{L}-{C}-{H}` |
| `text` | `color` | `text-lu-*`, `text-c-*`, `text-h-*` | `text-{L}-{C}-{H}` |
| `border` | `border-color` | `border-lu-*`, `border-c-*`, `border-h-*` | `border-{L}-{C}-{H}` |
| `border-b` | `border-bottom-color` | `border-b-lu-*`, `border-b-c-*`, `border-b-h-*` | `border-b-{L}-{C}-{H}` |
| `accent` | `accent-color` | `accent-lu-*`, `accent-c-*`, `accent-h-*` | `accent-{L}-{C}-{H}` |
| `from` | gradient from | `from-lu-*`, `from-c-*`, `from-h-*` | `from-{L}-{C}-{H}` |
| `to` | gradient to | `to-lu-*`, `to-c-*`, `to-h-*` | `to-{L}-{C}-{H}` |
| `shadow` | shadow color | `shadow-lu-*`, `shadow-c-*`, `shadow-h-*` | — |

### Light / Dark Mode

Dark mode is the default. Light mode activates when the root element does **not** have the `.dark` class (`:root:not(.dark)`). The luminance scale flips automatically — no additional classes needed.

## License

MIT
