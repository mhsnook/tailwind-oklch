# tailwind-oklch

An OKLCH color composition system for Tailwind CSS v4. Set a **hue** once on a container, let **chroma** default to sensible per-property values, and vary **luminance** per-element — the one axis you actually adjust all the time.

_Note: This is a working concept; it's not really in production anywhere; YMMV._

## Why OKLCH?

**OKLCH** (Lightness, Chroma, Hue) is a perceptually uniform color space. Unlike HSL, colors at the same lightness and chroma look equally bright regardless of hue. This makes it possible to build systematic, predictable color palettes from simple numeric scales.

`tailwind-oklch` takes this further: instead of defining dozens of static color tokens, you compose colors on the fly from three axes. CSS custom property inheritance means a parent can set a hue and children automatically share it — override just the axis you need.

## Installation

```bash
pnpm add tailwind-oklch
```

## Setup

```css
@import "tailwindcss";
@import "tailwind-oklch";
@plugin "tailwind-oklch/plugin";
```

## The Three Axes

| Axis | Role | How you typically set it |
|---|---|---|
| **Hue** | Color identity | `hue-primary` on a container — cascades to all children |
| **Chroma** | Saturation | Sensible per-property defaults; override with `chroma-mid` etc. when needed |
| **Luminance** | Contrast with the page | `bg-lc-05`, `bg-lc-5`, `bg-lc-[72]` — the workhorse, set on every element |

## Quick Start

```html
<div class="hue-primary">
  <div class="bg-lc-05 border border-lc-2 rounded-lg p-6">
    <h2 class="text-lc-fore">Card title</h2>
    <p class="text-lc-5">Muted body text</p>
    <button class="bg-lc-5 chroma-mhi text-lc-0 hover:bg-lc-up-1 px-4 py-2 rounded">
      Action
    </button>
  </div>
</div>
```

That's it. `hue-primary` cascades to every child. Chroma defaults are already set per-property (backgrounds get `lo`, borders get `mlo`, accents get `mhi`). You just vary luminance.

## Luminance Contrast Scale

The scale measures contrast with the page — not absolute lightness:

- **0 / `base`** = close to the page color (blends in)
- **10 / `fore`** = high contrast with the page (stands out, like text)

**15 stops** with half-steps at the extremes where subtle differences matter most:

```
0   05   1   15   2    3    4    5    6    7    8   85   9   95   10
╰──── 0.04 ─────╯    ╰──── 0.08 steps ────╯    ╰──── 0.04 ─────╯
```

| Stop | Light Mode | Dark Mode |
|---|---|---|
| `0` / `base` | 0.95 | 0.12 |
| `05` | 0.91 | 0.16 |
| `1` | 0.87 | 0.20 |
| `15` | 0.83 | 0.24 |
| `2` | 0.79 | 0.28 |
| `3` | 0.71 | 0.36 |
| `4` | 0.63 | 0.44 |
| `5` | 0.55 | 0.52 |
| `6` | 0.47 | 0.60 |
| `7` | 0.39 | 0.68 |
| `8` | 0.31 | 0.76 |
| `85` | 0.27 | 0.80 |
| `9` | 0.23 | 0.84 |
| `95` | 0.19 | 0.88 |
| `10` / `fore` | 0.15 | 0.92 |

Arbitrary values (`bg-lc-[72]`) auto-flip in dark mode too.

## Hue — Set Once, Inherit Everywhere

```html
<!-- Named hue on a container — all children inherit -->
<div class="hue-danger">
  <div class="bg-lc-1 text-lc-fore border border-lc-3 rounded-lg p-4">
    <h4>Alert</h4>
    <p class="text-lc-5">Something went wrong.</p>
    <button class="bg-lc-5 chroma-mhi text-lc-0">Acknowledge</button>
  </div>
</div>

<!-- Arbitrary hue -->
<div class="hue-[180]">Teal everything</div>

<!-- Per-property override when one element differs -->
<div class="hue-primary bg-lc-1">
  <span class="bg-h-success bg-lc-3 chroma-mid">Success badge</span>
</div>
```

Available hues: `primary` (233), `accent` (350), `success` (145), `warning` (55), `danger` (15), `info` (220), `neutral` (260).

## Chroma — Sensible Defaults

Each property type has a default chroma so you rarely need to set it:

| Property | Default chroma | Why |
|---|---|---|
| `background` | `lo` (0.02) | Subtle tint |
| `text` | `lo` (0.02) | Readable |
| `border` | `mlo` (0.06) | Visible boundary |
| `accent` | `mhi` (0.18) | Stands out |
| `gradient` | `mid` (0.12) | Moderate |
| `shadow` | `lo` (0.02) | Subtle |

Override when you need more or less:

```html
<!-- Bump chroma for a vivid button -->
<button class="bg-lc-5 chroma-mhi text-lc-0">Vivid</button>

<!-- Global chroma override — all properties on this subtree -->
<div class="chroma-mid">...</div>

<!-- Per-property chroma -->
<div class="bg-c-mhi border-c-lo">Vivid bg, subtle border</div>
```

Named stops: `lo` (0.02), `mlo` (0.06), `mid` (0.12), `mhi` (0.18), `hi` (0.25). Arbitrary: `chroma-[8]` → 0.08.

## Relative Luminance Offsets

Nudge luminance relative to the inherited value — perfect for hover states:

```html
<div class="hue-primary bg-lc-3 chroma-mid text-lc-fore">
  <button class="hover:bg-lc-up-1">More contrast on hover</button>
  <span class="bg-lc-down-2">Subtler, closer to page</span>
</div>
```

Steps 1–5, each ≈ 0.08 lightness. Direction auto-adapts to light/dark mode.

## Arbitrary Values

When named stops aren't precise enough:

```html
<!-- Hue: 0–360 degrees -->
<div class="hue-[180]">Custom teal</div>

<!-- Chroma: 0–100 → 0.00–1.00 -->
<div class="chroma-[8]">All properties at 0.08</div>

<!-- Luminance: 0–100, auto-flips in dark mode -->
<div class="bg-lc-[72]">L=0.72 light, L=0.28 dark</div>
```

## Using with Tailwind Modifiers

```html
<button class="bg-lc-5 chroma-mhi text-lc-0
  hover:bg-lc-up-1 focus:chroma-hi">
  Hover and focus states
</button>

<input class="border-lc-3 focus:border-c-mid focus:border-h-primary">
  Border gets more chromatic on focus
</input>
```

## Gradients

```html
<div class="hue-primary bg-gradient-to-r from-lc-3 from-c-mid to-h-accent to-lc-3 to-c-mid">
  Primary to accent gradient
</div>
```

## Customization

### Custom Hues

```css
@theme {
  --hue-primary: 180;   /* teal */
  --hue-accent: 320;    /* pink */
}
```

### Custom Luminance Range

```css
@theme {
  --lc-range-start: 0.15;
  --lc-range-end: 0.95;
}
```

### Runtime Theming

```js
document.documentElement.style.setProperty('--hue-primary', '180');
```

## Reference

### Per-Property Utilities

| Prefix | CSS Property | Luminance | Chroma | Hue |
|---|---|---|---|---|
| `bg` | `background-color` | `bg-lc-*` | `bg-c-*` | `bg-h-*` |
| `text` | `color` | `text-lc-*` | `text-c-*` | `text-h-*` |
| `border` | `border-color` | `border-lc-*` | `border-c-*` | `border-h-*` |
| `border-b` | `border-bottom-color` | `border-b-lc-*` | `border-b-c-*` | `border-b-h-*` |
| `accent` | `accent-color` | `accent-lc-*` | `accent-c-*` | `accent-h-*` |
| `from` | gradient from | `from-lc-*` | `from-c-*` | `from-h-*` |
| `to` | gradient to | `to-lc-*` | `to-c-*` | `to-h-*` |
| `shadow` | shadow color | `shadow-lc-*` | `shadow-c-*` | `shadow-h-*` |

### Global Setters

| Utility | Sets |
|---|---|
| `hue-{name}` or `hue-[N]` | Hue for all properties |
| `chroma-{stop}` or `chroma-[N]` | Chroma for all properties |

### Light / Dark Mode

Light mode is the default. Dark mode activates when the root element has the `.dark` class. The luminance scale flips automatically — `lc-0` is always near the page, `lc-10` is always high contrast. Arbitrary values auto-flip too.

## License

MIT
