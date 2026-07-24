# tailwind-oklch

A cascade-first OKLCH color system for Tailwind CSS v4. Pure CSS, no JavaScript
plugin. Instead of hand-picking hundreds of static color tokens, you **compose**
colors from three independent axes — **luminance contrast**, **chroma**, and
**hue** — and let two of them flow down the DOM tree so most elements only ever
state one thing about themselves.

_Note: This is a working concept; it's not really in production anywhere; YMMV._

## The idea in one sentence

**Each class states one fact about one axis.** Hue and chroma are a component's
_character_ — you set them once, near the root, and they cascade. Luminance is
_emphasis_ — you set it per element, constantly. So a component says "I'm
success-flavored and quiet" at the top, and its interior just says "this part is
subtle, this part stands out, this border is faint."

```html
<!-- "generally success-colored, generally low-key" — declared once… -->
<div class="hue-success chroma-mlo">
  <!-- …then everything inside speaks only luminance -->
  <div class="bg-lc-1">
    <span class="text-lc-8">Saved to your deck</span>
    <hr class="border-lc-3" />
  </div>
</div>
```

Change `hue-success` to `hue-danger` and the whole subtree re-colors — no other
edits. The interior markup is _portable_: it carries emphasis, and inherits its
character from wherever you drop it.

## Why OKLCH?

**OKLCH** (Lightness, Chroma, Hue) is a perceptually uniform color space. Unlike
HSL, colors at the same lightness and chroma look equally bright regardless of
hue. That's what makes composing on the fly work: a single numeric luminance
scale reads consistently across every hue, so you can build systematic,
predictable palettes from three simple axes instead of a wall of hex values.

CSS custom property inheritance does the rest — a parent sets an axis, children
share it automatically, and you override just the axis you need.

## Install

```css
@import "tailwindcss";
@import "tailwind-oklch";
```

That's the whole setup. No `@plugin`, no build step, no JS.

Dark mode activates when the root element has the `.dark` class. Wire it to your
theme toggle however you like; if you use a custom variant, declare it alongside
the imports:

```css
@custom-variant dark (&:is(.dark, .dark *));
```

## The two kinds of class

**Cascade seeders** set an axis for _everything below them_ and apply no color
of their own. Put them near a component's root:

| Seeder      | Sets for all descendants            |
| ----------- | ----------------------------------- |
| `hue-*`     | hue (`hue-primary`, `hue-danger`, …) |
| `chroma-*`  | chroma (`chroma-lo`, `chroma-hi`, …) |

**Per-property setters** apply exactly one CSS property from one axis. Luminance
is the one you set constantly; chroma and hue inherit from a seeder (or the
`:root` default) unless you set them explicitly:

```html
<span class="bg-lc-1 bg-chroma-mlo bg-hue-primary">all three explicit</span>
<span class="text-lc-6 text-chroma-hi text-hue-info">…</span>
<span class="hover:bg-lc-2">luminance only; chroma + hue inherited</span>
```

Because `:root` already seeds `hue-primary` + low chroma, a brand-colored
surface often needs only `bg-lc-1`.

## One item, three characters

The payoff: the same interior markup, restyled entirely by the seeder above it.
Only the wrapper's two classes change — the `bg-lc-*`, `text-lc-*`,
`border-lc-*` inside are byte-for-byte identical.

```html
<!-- Primary, middling weight -->
<article class="hue-primary chroma-mid item">…</article>

<!-- Warning, subtle -->
<article class="hue-warning chroma-lo item">…</article>

<!-- Success, bright and shiny -->
<article class="hue-success chroma-hi item">…</article>
```

```html
<!-- the shared interior, written once, reused verbatim under each seeder -->
<article class="… bg-lc-1 border-lc-3 rounded-lg border p-4">
  <h3 class="text-lc-9">Title</h3>
  <p class="text-lc-7">Body copy that inherits its hue and chroma.</p>
  <button class="bg-lc-4 text-lc-0 hover:bg-lc-up-1">Action</button>
</article>
```

The component author writes emphasis; the caller decides the color and how loud
it is.

## Luminance contrast scale (`lc`)

`{prop}-lc-{0–10 | base | fore | none | full}`. The scale measures contrast with
the page — not absolute lightness — and auto-flips between light and dark mode,
so you almost never write `dark:`.

| Value         | Light mode        | Dark mode         | Meaning          |
| ------------- | ----------------- | ----------------- | ---------------- |
| `0` / `base`  | 0.95 (near white) | 0.12 (near black) | Blends with page |
| `1`           | 0.91              | 0.20              | Subtle tint      |
| `5`           | 0.63              | 0.52              | Mid-contrast     |
| `7`           | 0.44              | 0.68              | Prominent        |
| `10` / `fore` | 0.15 (near black) | 0.92 (near white) | Maximum contrast |
| `none`        | 1.0 (white)       | 0.0 (black)       | Beyond base      |
| `full`        | 0.0 (black)       | 1.0 (white)       | Beyond fore      |

`bg-lc-3` is always "3 steps from the page" — a subtle, low-contrast element in
either mode. Light mode uses a power curve (p≈1.3) so steps near the near-white
base are smaller, where the eye is most sensitive; dark mode stays linear.

## Chroma stops (`chroma`)

`{prop}-chroma-{lo | mlo | mid | mhi | hi}`, or the seeder `chroma-{…}`:

| Name  | Value | Use for                            |
| ----- | ----- | ---------------------------------- |
| `lo`  | 0.02  | Backgrounds, muted surfaces        |
| `mlo` | 0.06  | Tinted backgrounds, subtle borders |
| `mid` | 0.12  | Medium saturation                  |
| `mhi` | 0.18  | Prominent accents                  |
| `hi`  | 0.25  | Vivid, saturated colors            |

## Hues (`hue`)

`{prop}-hue-{…}`, or the seeder `hue-{…}`:

| Name      | Default | Color         |
| --------- | ------- | ------------- |
| `primary` | 233     | blue/indigo   |
| `accent`  | 350     | red/pink      |
| `success` | 145     | green         |
| `warning` | 55      | yellow        |
| `danger`  | 15      | orange-red    |
| `info`    | 220     | blue          |
| `neutral` | 260     | purple-gray   |

## Per-property setters

Every property carries the full trio (`lc` / `chroma` / `hue`). Set only the axes
that differ from what's inherited.

| Prefix     | CSS property           | Setters                                          |
| ---------- | ---------------------- | ------------------------------------------------ |
| `bg`       | `background-color`     | `bg-lc-*` · `bg-chroma-*` · `bg-hue-*`           |
| `text`     | `color`                | `text-lc-*` · `text-chroma-*` · `text-hue-*`     |
| `border`   | `border-color`         | `border-lc-*` · `border-chroma-*` · `border-hue-*` |
| `border-b` | `border-bottom-color`  | `border-b-lc-*` · `border-b-chroma-*` · `border-b-hue-*` |
| `accent`   | `accent-color`         | `accent-lc-*` · `accent-chroma-*` · `accent-hue-*` |
| `shadow`   | shadow color           | `shadow-lc-*` · `shadow-chroma-*` · `shadow-hue-*` |
| `from`     | gradient from          | `from-lc-*` · `from-chroma-*` · `from-hue-*`     |
| `to`       | gradient to            | `to-lc-*` · `to-chroma-*` · `to-hue-*`           |

All setters work with standard Tailwind modifiers (`hover:`, `focus:`, `md:`, …).

## Relative luminance adjustments

Nudge off the _inherited/current_ luminance without rewriting it — ideal for
hover/active states, and it doesn't cascade to children.

```html
<div class="bg-lc-1">
  <button class="hover:bg-lc-up-1">one step more contrast on hover</button>
  <span class="text-lc-7 group-hover:text-lc-down-1">one step less</span>
</div>
```

`{prop}-lc-up-{1–5}` / `{prop}-lc-down-{1–5}` (bg and text). "Up" always means
more contrast with the page, "down" less — direction adapts to light/dark
automatically. Adjustments **don't compound**: a grandchild's `lc-up-1` nudges
from the nearest ancestor's _set_ luminance, not a parent's already-nudged value.

## Arbitrary values

All three axes accept Tailwind's bracket syntax, on every setter and both
seeders.

```html
<!-- Hue: any degree 0–360 -->
<div class="hue-[180] bg-lc-3">Teal subtree</div>
<div class="bg-hue-[280] text-hue-[40]">Purple bg, orange text</div>

<!-- Chroma: integer 0–100, mapped to OKLCH 0.00–1.00 (practical range ~0–25) -->
<div class="chroma-[8] bg-lc-3">Everything at chroma 0.08</div>
<div class="bg-chroma-[15]">Background chroma 0.15</div>

<!-- Luminance: integer 0–100, auto-flips in dark mode (reflected around 0.50) -->
<div class="bg-lc-[70]">Light: L=0.70 · Dark: L=0.30</div>
```

## Gradients

```html
<div class="bg-linear-to-r from-lc-3 to-lc-7">
  Same hue + chroma from the cascade, luminance ramps across
</div>

<!-- Override just the hue on the "to" end -->
<div class="bg-linear-to-r from-lc-3 to-lc-3 to-hue-accent">
  Primary → accent, matched luminance and chroma
</div>
```

## Customization

Override any of the defaults in a `@theme` block.

```css
@theme {
  /* Re-theme the whole app */
  --hue-primary: 180;   /* teal */
  --hue-accent: 320;    /* pink */

  /* Shift the luminance-contrast endpoints */
  --lc-range-start: 0.95;   /* base (0) */
  --lc-range-end: 0.15;     /* fore (10) */
}
```

Because everything is driven by CSS custom properties, you can also re-theme at
runtime — set `--hue-primary` (or any axis variable) inline on a subtree and
every descendant that resolves through it updates:

```js
document.documentElement.style.setProperty('--hue-primary', '180');
```

This is how per-section or per-user theming works: an inline `--hue-*` override
flows through the same variables the utilities read, so seeders and setters keep
composing on top of it.

## Migrating from 0.6.x

0.7 drops the JavaScript plugin and the shorthand columns in favor of the pure
single-axis API. The changes:

- **No more `@plugin`.** Delete the `@plugin "tailwind-oklch/plugin";` line;
  `@import "tailwind-oklch";` is now the entire install.
- **Shorthands removed.** `bg-3-mhi` and `bg-3-mhi-accent` no longer exist —
  they re-pinned all three axes on every leaf, which defeats the cascade. Split
  them into their axes and hoist hue/chroma to a seeder:
  `bg-3-mhi-accent` → `hue-accent` (on the parent) + `bg-lc-3 bg-chroma-mhi`.
- **`-c-` → `-chroma-`, `-h-` → `-hue-`.** `bg-c-mid` → `bg-chroma-mid`,
  `text-h-info` → `text-hue-info`. The global seeders `hue-*` / `chroma-*` are
  unchanged.
- Arbitrary values, relative adjustments, and every property family carry over
  unchanged (now implemented in pure CSS).

## License

MIT
