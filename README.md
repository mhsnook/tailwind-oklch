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
| **Luminance** | Lightness | `bg-lum-11`, `bg-lum-6`, `bg-lum-[72]` — the workhorse, set on every element |

## Quick Start

```html
<div class="hue-primary">
  <div class="bg-lum-11 border border-lum-9 rounded-lg p-6">
    <h2 class="text-lum-1">Card title</h2>
    <p class="text-lum-6">Muted body text</p>
    <button class="bg-lum-6 chroma-mhi text-lum-12 hover:bg-lum-up-1 px-4 py-2 rounded">
      Action
    </button>
  </div>
</div>
```

That's it. `hue-primary` cascades to every child. Chroma defaults are already set per-property (backgrounds get `lo`, borders get `mlo`, accents get `mhi`). You just vary luminance.

## Luminance Scale

12 stops distributed along a cubic bezier curve. Language is always anchored in light-mode terms:

- **lum-1** = darkest themed stop (0.13 in light mode)
- **lum-12** = lightest themed stop (0.96 in light mode)
- **none** = pure black (light mode) / pure white (dark mode)
- **full** = pure white (light mode) / pure black (dark mode)

Dark mode auto-flips the entire scale — lum-1 becomes the lightest, lum-12 becomes the darkest.

| Stop | Light Mode | Dark Mode |
|---|---|---|
| `none` | 0.00 | 1.00 |
| `1` | 0.13 | 0.96 |
| `2` | 0.18 | 0.91 |
| `3` | 0.24 | 0.85 |
| `4` | 0.31 | 0.78 |
| `5` | 0.39 | 0.69 |
| `6` | 0.49 | 0.59 |
| `7` | 0.59 | 0.49 |
| `8` | 0.69 | 0.39 |
| `9` | 0.78 | 0.31 |
| `10` | 0.85 | 0.24 |
| `11` | 0.91 | 0.18 |
| `12` | 0.96 | 0.13 |
| `full` | 1.00 | 0.00 |

Arbitrary values (`bg-lum-[72]`) auto-flip in dark mode too.

## Hue — Set Once, Inherit Everywhere

```html
<!-- Named hue on a container — all children inherit -->
<div class="hue-danger">
  <div class="bg-lum-10 text-lum-1 border border-lum-8 rounded-lg p-4">
    <h4>Alert</h4>
    <p class="text-lum-6">Something went wrong.</p>
    <button class="bg-lum-6 chroma-mhi text-lum-12">Acknowledge</button>
  </div>
</div>

<!-- Arbitrary hue -->
<div class="hue-[180]">Teal everything</div>

<!-- Per-property override when one element differs -->
<div class="hue-primary bg-lum-10">
  <span class="bg-h-success bg-lum-8 chroma-mid">Success badge</span>
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
<button class="bg-lum-6 chroma-mhi text-lum-12">Vivid</button>

<!-- Global chroma override — all properties on this subtree -->
<div class="chroma-mid">...</div>

<!-- Per-property chroma -->
<div class="bg-c-mhi border-c-lo">Vivid bg, subtle border</div>
```

Named stops: `lo` (0.02), `mlo` (0.06), `mid` (0.12), `mhi` (0.18), `hi` (0.25). Arbitrary: `chroma-[8]` → 0.08.

## Relative Luminance Offsets

Nudge luminance relative to the inherited value — perfect for hover states:

```html
<div class="hue-primary bg-lum-8 chroma-mid text-lum-1">
  <button class="hover:bg-lum-up-1">More contrast on hover</button>
  <span class="bg-lum-down-2">Subtler, closer to page</span>
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
<div class="bg-lum-[72]">L=0.72 light, L=0.28 dark</div>
```

## Using with Tailwind Modifiers

```html
<button class="bg-lum-6 chroma-mhi text-lum-12
  hover:bg-lum-up-1 focus:chroma-hi">
  Hover and focus states
</button>

<input class="border-lum-8 focus:border-c-mid focus:border-h-primary">
  Border gets more chromatic on focus
</input>
```

## Gradients

```html
<div class="hue-primary bg-gradient-to-r from-lum-8 from-c-mid to-h-accent to-lum-8 to-c-mid">
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
  --lum-min: 0.15;
  --lum-max: 0.95;
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
| `bg` | `background-color` | `bg-lum-*` | `bg-c-*` | `bg-h-*` |
| `text` | `color` | `text-lum-*` | `text-c-*` | `text-h-*` |
| `border` | `border-color` | `border-lum-*` | `border-c-*` | `border-h-*` |
| `border-b` | `border-bottom-color` | `border-b-lum-*` | `border-b-c-*` | `border-b-h-*` |
| `accent` | `accent-color` | `accent-lum-*` | `accent-c-*` | `accent-h-*` |
| `from` | gradient from | `from-lum-*` | `from-c-*` | `from-h-*` |
| `to` | gradient to | `to-lum-*` | `to-c-*` | `to-h-*` |
| `shadow` | shadow color | `shadow-lum-*` | `shadow-c-*` | `shadow-h-*` |

### Global Setters

| Utility | Sets |
|---|---|
| `hue-{name}` or `hue-[N]` | Hue for all properties |
| `chroma-{stop}` or `chroma-[N]` | Chroma for all properties |

### Light / Dark Mode

Light mode is the default. Dark mode activates when the root element has the `.dark` class. The luminance scale flips automatically — `lum-1` always uses light-mode language (darkest), but in dark mode it resolves to the lightest value. Arbitrary values auto-flip too.

## License

MIT
