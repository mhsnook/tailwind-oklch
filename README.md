# tailwind-oklch

An OKLCH color composition system for Tailwind CSS v4. Uses independent CSS variables for **luminance**, **chroma**, and **hue**, so you can set a hue once on a container and adjust luminance and chroma per-element — no opacity hacks, no hand-picked hex values.

_Note: This is a working concept; it's not really in production anywhere; YMMV._

## Why OKLCH?

**OKLCH** (Lightness, Chroma, Hue) is a perceptually uniform color space. Unlike HSL, colors at the same lightness and chroma look equally bright regardless of hue. This makes it possible to build systematic, predictable color palettes from simple numeric scales.

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

| Axis | What it controls | How to set it |
|---|---|---|
| **Hue (H)** | Color identity | `hue-primary`, `hue-[180]` |
| **Luminance Contrast (LC)** | How far from the page color | `bg-lc-5`, `bg-lc-[87]` |
| **Chroma (C)** | Colorfulness / saturation | `chroma-[8]`, `bg-c-[15]` |

### The Recommended Pattern

Set hue (and optionally chroma) on a **container**, then vary luminance per-element:

```html
<div class="hue-primary chroma-[8]">
  <div class="bg-lc-[93] text-lc-fore border-lc-[80] border rounded-lg p-4">
    <h3 class="text-lc-[25]">Card title</h3>
    <p class="text-lc-[45]">Muted body text</p>
    <button class="bg-lc-[45] chroma-[18] text-lc-[95] px-4 py-2 rounded">
      Action
    </button>
  </div>
</div>
```

This works because:
1. `hue-primary` sets `--bg-h`, `--tx-h`, `--bd-h` (all properties) to the primary hue
2. `chroma-[8]` sets all chroma properties to 0.08
3. Each child only needs to set luminance — hue and chroma cascade down
4. The button overrides chroma locally for a more vivid look

### Luminance Contrast Scale

The scale measures contrast with the page — not absolute lightness:

- **0 / `base`** = close to the page color (blends in)
- **10 / `fore`** = high contrast with the page (stands out, like text)
- **1–9** = evenly distributed between those endpoints

Use the **named 0–10 scale** for quick, coarse values (`bg-lc-3`), or **arbitrary values** for precision (`bg-lc-[72]`).

Arbitrary luminance values auto-flip in dark mode: `bg-lc-[80]` renders as L=0.80 in light mode and L=0.20 in dark mode — always maintaining the same relationship to the page.

### CSS Cascade Inheritance

Every utility both **sets its axis variable** and **applies the resolved `oklch()` color**. Sensible defaults cascade from `:root`, so a single class like `bg-lc-5` immediately produces a visible color. A parent's hue flows to all children automatically.

## Usage

### Global Hue and Chroma (start here)

Most of the time, every color property on an element shares the same hue. Set it once on a container:

```html
<!-- Named hue — all children inherit it -->
<div class="hue-danger chroma-[10]">
  <div class="bg-lc-1 text-lc-fore border-lc-3 border rounded-lg p-4">
    <h4>Danger alert</h4>
    <p class="text-lc-[55]">Something went wrong.</p>
    <button class="bg-lc-[45] chroma-[20] text-lc-[95]">Acknowledge</button>
  </div>
</div>

<!-- Arbitrary hue — any degree value -->
<div class="hue-[180] chroma-[12]">
  <div class="bg-lc-[15] text-lc-[90]">Teal card</div>
</div>
```

Per-property utilities (`bg-h-*`, `text-c-*`, etc.) override the global when one property needs to differ.

### Per-Property Utilities (single-axis control)

Set one axis at a time. The other two inherit from the cascade.

| Pattern | Sets | Example |
|---|---|---|
| `bg-lc-{N}` | background luminance | `bg-lc-5`, `bg-lc-[87]` |
| `bg-c-{C}` | background chroma | `bg-c-[8]`, `bg-c-mid` |
| `bg-h-{H}` | background hue | `bg-h-primary`, `bg-h-[280]` |
| `text-lc-{N}` | text luminance | `text-lc-fore`, `text-lc-[25]` |
| `text-c-{C}` | text chroma | `text-c-[12]` |
| `text-h-{H}` | text hue | `text-h-accent` |
| `border-lc-{N}` | border luminance | `border-lc-3`, `border-lc-[70]` |
| `border-c-{C}` | border chroma | `border-c-[6]` |
| `border-h-{H}` | border hue | `border-h-neutral` |

The same pattern applies to `border-b-*` (border-bottom), `accent-*`, `from-*` (gradient from), `to-*` (gradient to), and `shadow-*`.

### Arbitrary Values

All three axes accept arbitrary integer values in brackets:

**Hue** — degrees 0–360:
```html
<div class="hue-[180]">Teal</div>
<div class="bg-h-[280] text-h-[40]">Purple bg, orange text</div>
```

**Chroma** — 0–100, mapped to OKLCH 0.00–1.00 (practical range 0–25):
```html
<div class="chroma-[8]">All properties at chroma 0.08</div>
<div class="bg-c-[15]">Background-only chroma 0.15</div>
```

**Luminance** — 0–100, with automatic light/dark flip:
```html
<div class="bg-lc-[80]">Light mode: L=0.80 · Dark mode: L=0.20</div>
```

### Named Chroma Stops

For quick work, five named chroma stops are available:

| Name | Value | Use case |
|---|---|---|
| `lo` | 0.02 | Near-neutral, subtle tint |
| `mlo` | 0.06 | Low saturation |
| `mid` | 0.12 | Medium saturation |
| `mhi` | 0.18 | Vivid |
| `hi` | 0.25 | Maximum practical saturation |

These work with decomposed utilities (`bg-c-mid`) and shorthands (`bg-3-mid`). For finer control, use arbitrary chroma values (`chroma-[8]`, `bg-c-[15]`).

### Shorthand Utilities

The plugin also generates compact shorthands for common combinations:

**Two-axis: `{property}-{L}-{C}`** — sets luminance and chroma, inherits hue:

```html
<div class="hue-accent bg-lc-[45] chroma-[18] text-lc-[95]">
  <!-- Or with named stops for quick prototyping: -->
  <span class="bg-3-mhi text-0-lo">Badge</span>
</div>
```

**Three-axis: `{property}-{L}-{C}-{H}`** — sets all three axes in one class:

```html
<span class="bg-3-mhi-accent">Quick one-off color</span>
```

These are useful for one-off elements, but for consistent theming, prefer `hue-*` + `chroma-[N]` on a container.

### Combining Global and Per-Property

The real power comes from setting context on a parent, then fine-tuning children:

```html
<!-- Parent sets hue + base chroma -->
<div class="hue-accent chroma-[8]">

  <!-- Child lightens background on hover -->
  <button class="bg-lc-[40] text-lc-[95] hover:bg-lc-[50]">
    Lighter on hover
  </button>

  <!-- Child drops to page-level luminance, inherits hue + chroma -->
  <footer class="bg-lc-base">Same hue, page-level brightness</footer>

  <!-- Child bumps chroma for emphasis -->
  <span class="bg-lc-3 chroma-[20]">Vivid badge</span>

  <!-- Child switches to a different hue entirely -->
  <aside class="bg-h-success bg-lc-2">Success sidebar</aside>
</div>
```

### Using with Tailwind Modifiers

All utilities work with standard Tailwind modifiers:

```html
<button class="bg-lc-[40] chroma-[18] text-lc-[95]
  hover:bg-lc-[50] focus:chroma-[22]">
  Hover and focus states
</button>

<div class="bg-lc-base dark:bg-lc-1">
  Responsive to color scheme
</div>

<input class="border-lc-3 focus:border-c-[12] focus:border-h-primary">
  Border increases chroma on focus
</input>
```

### Relative Luminance Offsets

Sometimes you don't want to set an absolute luminance — you want to nudge it relative to the inherited value. The `lc-up` and `lc-down` utilities shift luminance **toward more contrast** or **toward less contrast** without replacing the underlying variable. Children still inherit the original value.

- **`lc-up-{N}`** — increase contrast (move away from the page color)
- **`lc-down-{N}`** — decrease contrast (move toward the page color)

Where `{N}` is 1–5, with each step ≈ 0.08 OKLCH lightness (~one position on the 0–10 scale).

```html
<div class="hue-primary bg-lc-3 chroma-[8]">
  <button class="hover:bg-lc-up-1">More contrast on hover</button>
  <span class="bg-lc-down-2">Subtler, closer to page</span>
</div>
```

### Gradients

```html
<div class="hue-primary bg-gradient-to-r from-lc-3 from-c-[12] to-h-accent to-lc-3 to-c-[12]">
  Gradient from primary to accent, same luminance and chroma
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

### Custom Luminance Contrast Range

Shift the overall luminance contrast endpoints:

```css
@theme {
  --lc-range-start: 0.15;   /* base (0) is darker */
  --lc-range-end: 0.95;     /* fore (10) is brighter */
}
```

### Runtime Theming

Because everything is driven by CSS custom properties, you can re-theme at runtime:

```js
document.documentElement.style.setProperty('--hue-primary', '180');
```

## Reference

### Luminance Contrast Scale

| Stop | Light Mode | Dark Mode |
|---|---|---|
| `0` / `base` | 0.95 | 0.12 |
| `1` | 0.87 | 0.20 |
| `2` | 0.79 | 0.28 |
| `3` | 0.71 | 0.36 |
| `4` | 0.63 | 0.44 |
| `5` | 0.55 | 0.52 |
| `6` | 0.47 | 0.60 |
| `7` | 0.39 | 0.68 |
| `8` | 0.31 | 0.76 |
| `9` | 0.23 | 0.84 |
| `10` / `fore` | 0.15 | 0.92 |

### Supported Properties

**Global context setters** (set all properties at once):

| Utility | Sets |
|---|---|
| `hue-{H}` or `hue-[N]` | Hue for all properties |
| `chroma-{C}` or `chroma-[N]` | Chroma for all properties |

**Per-property utilities:**

| Prefix | CSS Property | Decomposed | Shorthand |
|---|---|---|---|
| `bg` | `background-color` | `bg-lc-*`, `bg-c-*`, `bg-h-*` | `bg-{L}-{C}`, `bg-{L}-{C}-{H}` |
| `text` | `color` | `text-lc-*`, `text-c-*`, `text-h-*` | `text-{L}-{C}`, `text-{L}-{C}-{H}` |
| `border` | `border-color` | `border-lc-*`, `border-c-*`, `border-h-*` | `border-{L}-{C}`, `border-{L}-{C}-{H}` |
| `border-b` | `border-bottom-color` | `border-b-lc-*`, `border-b-c-*`, `border-b-h-*` | `border-b-{L}-{C}`, `border-b-{L}-{C}-{H}` |
| `accent` | `accent-color` | `accent-lc-*`, `accent-c-*`, `accent-h-*` | `accent-{L}-{C}`, `accent-{L}-{C}-{H}` |
| `from` | gradient from | `from-lc-*`, `from-c-*`, `from-h-*` | `from-{L}-{C}`, `from-{L}-{C}-{H}` |
| `to` | gradient to | `to-lc-*`, `to-c-*`, `to-h-*` | `to-{L}-{C}`, `to-{L}-{C}-{H}` |
| `shadow` | shadow color | `shadow-lc-*`, `shadow-c-*`, `shadow-h-*` | — |

### LC Adjustment Steps

Used by relative luminance offset utilities (`bg-lc-up-*`, `bg-lc-down-*`, etc.):

| Step | OKLCH L offset | Approximate scale positions |
|---|---|---|
| `1` | 0.08 | ~1 step |
| `2` | 0.16 | ~2 steps |
| `3` | 0.24 | ~3 steps |
| `4` | 0.32 | ~4 steps |
| `5` | 0.40 | ~5 steps |

### Light / Dark Mode

Light mode is the default. Dark mode activates when the root element has the `.dark` class. The luminance contrast scale flips automatically — `lc-0` is always near the page, `lc-10` is always high contrast. Arbitrary values (`bg-lc-[80]`) auto-flip too.

## License

MIT
