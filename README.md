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
  <div class="bg-lc-2">
    <span class="text-lc-9">Saved to your deck</span>
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

**Cascade seeders** set an axis for _everything below them_ and paint nothing of
their own. Put them near a component's root:

| Seeder      | Sets for all descendants                          |
| ----------- | ------------------------------------------------- |
| `hue-*`     | hue — and its per-hue chroma scale (see below)    |
| `chroma-*`  | chroma (`chroma-lo`, `chroma-hi`, …)              |

**Per-property setters** paint exactly one CSS property from one axis. Luminance
is the one you set constantly; chroma and hue inherit from a seeder (or the
`:root` default) unless you set them explicitly:

```html
<span class="bg-lc-2 bg-chroma-mlo bg-hue-primary">all three explicit</span>
<span class="text-lc-6 text-chroma-hi text-hue-info">…</span>
<span class="hover:bg-lc-up-1">luminance only; chroma + hue inherited</span>
```

Because `:root` already seeds `hue-primary` + low chroma, a brand-colored
surface often needs only `bg-lc-2`.

A common pattern is to let a component own its luminance structure and take only
character from the caller:

```css
.card { @apply bg-lc-2 border-lc-3 rounded-lg border p-4; }
.card-title { @apply text-lc-9; }
.card-note  { @apply text-lc-6; }
```

```html
<article class="card hue-primary chroma-mid">…</article>  <!-- middling -->
<article class="card hue-warning chroma-lo">…</article>    <!-- subtle -->
<article class="card hue-success chroma-hi">…</article>    <!-- bright -->
```

Same markup, three identities. The author writes emphasis; the caller decides
the color and how loud it is.

## Luminance contrast scale (`lc`)

`{prop}-lc-{0–10}` — a plain **white → black ramp** that measures contrast with
the page and auto-flips between light and dark mode, so you almost never write
`dark:`.

| Stop | Light | Dark  | Meaning                                    |
| ---- | ----- | ----- | ------------------------------------------ |
| `0`  | 1.00  | 0.00  | pure white / pure black — the page-ward extreme |
| `1`  | 0.965 | 0.185 | blends with the page (lightest usable surface) |
| `2`  | 0.95  | 0.22  | subtle surface / card                      |
| `3`  | 0.885 | 0.30  | raised surface / border                    |
| `5`  | 0.69  | 0.49  | mid                                        |
| `7`  | 0.46  | 0.67  | prominent                                  |
| `9`  | 0.22  | 0.86  | strong text                                |
| `10` | 0.00  | 1.00  | pure black / pure white — maximum foreground contrast |

Two things worth internalizing:

- **`0` and `10` are the pure extremes** (white and black), not everyday values.
  Your page sits near `0`; the lightest surface you'd actually paint is `1`, a
  card is `2`, and so on. Text lives up around `8`–`10`.
- **The low end is finely graded.** The eye is most sensitive to differences
  next to the page color, so `0`→`1`→`2` are tiny steps and the scale opens up
  toward the dark end. That's why a "subtle card" is a real, distinct stop
  rather than something you have to reach for with an arbitrary value.

## Chroma stops (`chroma`)

`{prop}-chroma-{lo | mlo | mid | mhi | hi}`, or the seeder `chroma-{…}`:

| Name  | Base value | Use for                            |
| ----- | ---------- | ---------------------------------- |
| `lo`  | 0.02       | Backgrounds, muted surfaces        |
| `mlo` | 0.05       | Tinted backgrounds, subtle borders |
| `mid` | 0.09       | Medium saturation                  |
| `mhi` | 0.13       | Prominent accents                  |
| `hi`  | 0.17       | Vivid, saturated colors            |

These are _base_ values — the chroma actually painted is the base times the
active hue's scale (next section).

## Per-hue chroma

Hues don't reach perceived saturation at the same chroma: blue and purple look
vivid at a low chroma, while yellow and green need more to read as colorful. A
single flat chroma scale therefore looks uneven — `chroma-mid` that's right for
green is garish on blue.

So each hue carries a **`--cscale-*` multiplier**, and every color resolves its
chroma as `calc(base × scale)`. A given chroma stop then looks about equally
saturated across every hue. Setting a hue (via `hue-*` or `bg-hue-*`) applies its
scale automatically.

| Hue       | Degrees | `--cscale-*` |
| --------- | ------- | ------------ |
| `primary` | 233     | 0.72         |
| `info`    | 220     | 0.68         |
| `accent`  | 350     | 0.76         |
| `danger`  | 15      | 0.95         |
| `success` | 145     | 1.00         |
| `warning` | 55      | 1.05         |

These are calibrated by eye and easy to retune — override any `--cscale-*` in a
`@theme` block. Arbitrary hues (`hue-[280]`) use a scale of `1` since their
ceiling is unknown; set `bg-chroma-[n]` directly if you need to tame them.

**There is no `neutral` hue.** A neutral is the _absence_ of chroma, not a color:
reach for `chroma-lo` (a faint temperature from whatever hue is seeded) or
`chroma-[0]` for a dead-flat gray. Keeping the axes decomposed means neutrality
belongs to the chroma axis — folding it into the hue list would smuggle a chroma
decision back into hue.

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
<div class="bg-lc-2">
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
<!-- Hue: any degree 0–360 (uses chroma scale 1) -->
<div class="hue-[180] bg-lc-3">Teal subtree</div>
<div class="bg-hue-[280] text-hue-[40]">Purple bg, orange text</div>

<!-- Chroma: integer 0–100, mapped to OKLCH 0.00–1.00 (practical range ~0–25) -->
<div class="chroma-[8] bg-lc-3">Everything at chroma 0.08</div>
<div class="bg-chroma-[15]">Background chroma 0.15</div>

<!-- Luminance: integer 0–100 = direct L, auto-flips in dark mode -->
<div class="bg-lc-[70]">Light: L=0.70 · Dark: L=0.30</div>
```

Note that arbitrary `lc-[n]` is a _direct luminance_ (`n/100`), while the named
`lc-0…10` scale is a curved contrast ramp — two different tools that share the
prefix.

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
  --hue-primary: 180;    /* teal */
  --hue-accent: 320;     /* pink */

  /* Retune how saturated a hue reads */
  --cscale-primary: 0.8;

  /* Reshape the luminance ramp */
  --l-2: 0.94;           /* make the "card" stop lighter */
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

## Migrating to 0.7

0.7 is a breaking overhaul of everything below the core concept. It's still
pre-1.0 — the API isn't settled, so pin the version and expect more churn.

- **No more JS plugin or shorthands.** Delete the `@plugin "tailwind-oklch/plugin";`
  line — `@import "tailwind-oklch";` is the whole install now. The
  `{prop}-{L}-{C}[-{H}]` shorthands (`bg-3-mhi`, `bg-3-mhi-accent`) are gone;
  they re-pinned all three axes on every leaf, against the cascade. Split them
  into axes and hoist hue/chroma to a seeder: `bg-3-mhi-accent` →
  `hue-accent` (on the parent) + `bg-lc-3 bg-chroma-mhi`.
- **`-c-` → `-chroma-`, `-h-` → `-hue-`.** `bg-c-mid` → `bg-chroma-mid`,
  `text-h-info` → `text-hue-info`. The global seeders `hue-*` / `chroma-*` are
  unchanged.
- **The luminance scale is reindexed.** `lc-0` is now **pure white/black**, not
  the old near-page 0.95. The everyday surfaces shifted down a notch: a
  near-page background is now `lc-1`, a card `lc-2`. Bump backgrounds that used
  `lc-0` to `lc-1`/`lc-2`; text at `lc-10` is now pure black (use `lc-9` for the
  old near-black).
- **The `none` / `base` / `fore` / `full` aliases are gone.** The scale is just
  `0`–`10`, with `0` and `10` as the pure extremes. Replace `lc-base` → `lc-1`,
  `lc-fore` → `lc-9`/`lc-10`, `lc-none` → `lc-0`, `lc-full` → `lc-10`.
- **Chroma is now scaled per hue.** A given `chroma-*` stop paints less on blue
  than it used to (and about the same on green). If a color looks off, retune
  its `--cscale-*` or set an explicit `*-chroma-[n]`.

## Building

`index.css` is generated from `scripts/gen-index.js` to keep every color-painting
utility's `oklch()` expression identical. Edit the generator, then run
`node scripts/gen-index.js index.css`.

## License

MIT
