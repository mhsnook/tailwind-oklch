# tailwind-oklch

A cascade-first OKLCH color system for Tailwind CSS v4. Pure CSS, no JavaScript
plugin. You **compose** every color from three axes — **hue**, **chroma**, and
**luminance** — and let the first two flow down the DOM tree, so most elements
only ever state their own luminance (`text-lum-9`, `bg-lum-2`) and take their
hue and chroma from the section around them.

_Note: This is a working concept; it's not really in production anywhere; YMMV._

---

## Part one — the simple part

### The whole idea

Color in a UI moves on two different rhythms, and OKLCH lets you drive each on
its own axis.

**Hue and chroma set the mood.** They carry the mood, semantics, and energy of a
component or section — and that's largely an _area_ concern: within a given area,
background, text, border, and outline tend to draw from the same family of color.
A muted-blue panel's border is muted blue too; a bright section keeps its buttons
bright. So these two axes change _rarely_, at the section level — state them once,
high up, and every property and every descendant takes them.

**Luminance is what makes things legible.** Inside that area, what separates a
surface from its text from its border is _contrast_ — a difference in luminance.
You'd never give a background and its foreground the same lightness and expect a
shift of hue or chroma to tell them apart; it can't, and it wouldn't be
accessible. So luminance is the axis you set _per property_ and _per element_,
and the one you reach for constantly.

The two kinds of class map straight onto that split:

- **Set the mood once** with property-less `hue-*` / `chroma-*` — they paint
  nothing, and set hue and chroma for _every_ color calculation below them.
- **Work the contrast per element** with `bg-lum-*`, `text-lum-*`,
  `border-lum-*` — each element stating its own luminance against the page.

```html
<!-- the section's mood — muted blue — set once -->
<div class="hue-primary chroma-mlow">
  <!-- inside, elements differ by luminance; that's what makes them legible -->
  <div class="bg-lum-2">
    <span class="text-lum-9">Saved to your deck</span>
    <hr class="border-lum-3" />
  </div>
</div>
```

Change `hue-primary` to `hue-danger` and the whole subtree re-colors — the mood
moves, the contrast structure stays put. The interior markup is _portable_: it
carries its own legibility and takes on the mood of wherever you drop it.

This leans on OKLCH being **perceptually uniform** — a given luminance reads as
about the same contrast across every hue — so one numeric scale can do the
legibility work no matter which mood sits above it.

### Install

```css
@import "tailwindcss";
@import "tailwind-oklch";
```

That's the whole setup. No `@plugin`, no build step, no JS. Dark mode activates
when the root element has `.dark`:

```css
@custom-variant dark (&:is(.dark, .dark *));
```

### Set the mood: `hue-*` and `chroma-*`

These are **property-less** classes: they paint nothing themselves and set an
axis for every color calculated below them. One class on a wrapper colors the
whole area — so put them where a mood belongs: a section, a card, the page root.

```html
<section class="hue-warning chroma-mid">…everything in here is warning-flavored…</section>
```

| Class      | Sets for everything below                          |
| ---------- | -------------------------------------------------- |
| `hue-*`    | hue — and its per-hue chroma scale (see Part two)  |
| `chroma-*` | chroma: `low` `mlow` `mid` `mhigh` `high` `max`    |

The six named hues (`primary` `info` `accent` `danger` `success` `warning`) are
just defaults — rename, retune, or generate your own (see
[Tune the formulas](#tune-the-formulas-generate-your-theme)). There is **no
`neutral` hue**: a neutral is the _absence_ of chroma, so reach for `chroma-low`
(a faint temperature) or `chroma-[0]` (dead-flat gray).

`:root` already carries `hue-primary` and a low chroma, so a brand-colored
surface often needs only a luminance. When you want to scope an axis to a single
property instead of cascading it, every setter has a `bg-hue-*` / `bg-chroma-*`
form too (see the [reference](#every-property-every-axis)).

### The contrast axis: luminance

Luminance is how a surface, its text, and its border stay distinct — the axis
you work per element, and touch constantly. `{prop}-lum-{1–10}` is a ramp that
measures **contrast with the page** and auto-flips between light and dark mode,
so you almost never write `dark:`. The numbered stops ride a front-loaded curve;
the pure poles are **named**, outside the numbered range:

| Stop   | Light | Dark  | Meaning                                       |
| ------ | ----- | ----- | --------------------------------------------- |
| `none` | 1.00  | 0.00  | the page color: white / black — zero contrast |
| `1`    | 0.92  | 0.185 | lightest usable surface (hugs the page)       |
| `2`    | 0.887 | 0.22  | subtle surface / card                         |
| `3`    | 0.831 | 0.28  | raised surface                                |
| `5`    | 0.676 | 0.44  | mid                                           |
| `7`    | 0.481 | 0.63  | prominent                                     |
| `9`    | 0.254 | 0.83  | strong text                                   |
| `10`   | 0.13  | 0.92  | a strong foreground (near, not at, the max)   |
| `max`  | 0.00  | 1.00  | full contrast: black / white                  |

The scale is **front-loaded** — the eye is most sensitive next to the page, so
steps are tight near `1` and open toward `10`. That's why "subtle card" is a
real, distinct stop. The poles stay _out_ of the numbers, so a low-contrast
theme can pull the numbered range in without giving up pure white/black.

Because a component owns its own luminance and takes only its mood from the
caller, the same markup yields many identities:

```css
.card { @apply bg-lum-2 border-lum-3 rounded-lg border p-4; }
.card-title { @apply text-lum-9; }
.card-note  { @apply text-lum-6; }
```

```html
<article class="card hue-primary chroma-mid">…</article>   <!-- middling -->
<article class="card hue-warning chroma-low">…</article>   <!-- subtle -->
<article class="card hue-success chroma-high">…</article>  <!-- bright -->
```

### Two ways to move luminance around

Once luminance is doing all the work, two families make components _endlessly_
composable — they let an element decide its own contrast without knowing where
it lives.

**Nudge from right here — `lum-up/down`.** `{prop}-lum-up-{1–5}` /
`down-{1–5}` (bg and text) steps off the _inherited_ luminance without rewriting
it — ideal for hover/active and raised chips. "Up" always means more contrast
with the page; direction adapts to light/dark. Nudges **don't compound**.

```html
<div class="bg-lum-2">
  <button class="hover:bg-lum-up-1">one step more contrast on hover</button>
</div>
```

**Let it solve its own contrast — `con-*`.** `text-con-*`, `border-con-*`,
`outline-con-*`, and `ring-con-*` read the element's **background** and pick a
luminance that contrasts — in whichever direction is needed, on a light _or_
dark surface, with no `dark:`. One class, readable anywhere — a `ring-con-*`
gives a focus ring that stays visible on any surface.

```html
<article class="card">            <!-- card sets its own bg-lum-* -->
  <p class="text-con-high">Stark against whatever surface this lands on.</p>
  <hr class="border-con-mlow" />  <!-- a soft step off the surface -->
</article>
```

`con` uses the same `low·mlow·mid·mhigh·high·max` words, but here they read as
_how much contrast_ (faint → stark). `low`…`high` step a fixed perceptual
distance in `L`; `max` always clamps to pure black/white — a guaranteed
`contrast-color()`. `con` keeps the inherited hue/chroma and paints only its one
property, so it changes nothing descendants inherit.

**What more could you ask for?** The mood set once up top, contrast worked per
element, and a class that solves contrast for you. That's the everyday API — you
rarely need the rest.

---

## Part two — the part that makes it look right

A simple surface API left room to spend the real effort on _perception_: making
a given stop look the same across every hue and all the way up the luminance
scale. Two corrections run automatically, and both are just formulas you can
retune.

### Per-hue chroma

Hues don't reach perceived saturation at the same chroma — blue and purple look
vivid at a low chroma, while yellow and green need more to read as colorful. A
single flat chroma scale therefore looks uneven.

So each hue carries a **`--cscale-*` multiplier**, and every color resolves its
chroma as `calc(base × scale)`. A given `chroma-*` stop then looks about equally
saturated across every hue; setting a hue applies its scale automatically.

| Hue       | Degrees | `--cscale-*` |
| --------- | ------- | ------------ |
| `primary` | 233     | 0.86         |
| `info`    | 220     | 0.88         |
| `accent`  | 350     | 0.90         |
| `danger`  | 15      | 0.93         |
| `success` | 145     | 1.00         |
| `warning` | 55      | 1.00         |

Arbitrary hues (`hue-[280]`) use a scale of `1`, since their ceiling is unknown.

### Chroma taper toward white

At high luminance a fixed chroma reads as _much_ more saturated — it fills more
of the visible gamut — so a stop that's right at mid luminance turns neon on a
near-white surface (and can't resolve to clean white at all). So chroma tapers
toward the light end: every color multiplies its chroma by
`clamp(0, (1 − L) × --chroma-taper, 1)`. With the default `--chroma-taper: 3`,
chroma is at full below L ≈ 0.67 and ramps to 0 at pure white — so a stop looks
about equally saturated across the whole scale, light surfaces stay subtle, and
the lightest stop resolves to true white. The taper keys on the resolved `L`, so
it calms near-white text too and works the same in dark mode.

### Tune the formulas, generate your theme

Every default is a CSS custom property, and the two corrections above plus the
luminance ramp are **formula-driven** — so you tune the _shape_, not hundreds of
values, and get a whole theme back.

```css
@theme {
  --hue-primary: 180;      /* re-theme: teal primary            */
  --hue-accent: 320;       /*           pink accent             */
  --cscale-primary: 0.8;   /* how saturated primary reads       */
  --chroma-taper: 4;       /* let color survive closer to white */
  --lum-2: 0.94;           /* reshape the ramp: lighter "card"  */
}
```

The knobs, all at the formula level:

- **Luminance ramp** — stop count and front-loading curve. `bg-lum-14` exists the
  moment `--lum-14` does; the poles are added for you.
- **Per-hue chroma** — one `--cscale-*` per hue, so custom colors normalize too.
- **Chroma taper** — one number for the whole app's high-luminance saturation.

The [demo](demo) ships two generators for exactly this: pick a stop count and
curve, or a set of hues, and copy a paste-ready `@theme` block — your CSS
variables and whole theme, ready to go. And because it's all variables, you can
re-theme at runtime:

```js
document.documentElement.style.setProperty('--hue-primary', '180');
```

Every descendant that resolves through it updates — that's how per-section or
per-user theming works.

---

## Every property, every axis

Every property carries the full trio (`lum` / `chroma` / `hue`). Set only the
axes that differ from what's inherited.

| Prefix       | CSS property            | Setters                                                          |
| ------------ | ----------------------- | --------------------------------------------------------------- |
| `bg`         | `background-color`      | `bg-lum-*` · `bg-chroma-*` · `bg-hue-*`                          |
| `text`       | `color`                 | `text-lum-*` · `text-chroma-*` · `text-hue-*`                    |
| `decoration` | `text-decoration-color` | `decoration-lum-*` · `decoration-chroma-*` · `decoration-hue-*` |
| `border`     | `border-color`          | `border-lum-*` · `border-chroma-*` · `border-hue-*`             |
| `border-b`   | `border-bottom-color`   | `border-b-lum-*` · `border-b-chroma-*` · `border-b-hue-*`       |
| `accent`     | `accent-color`          | `accent-lum-*` · `accent-chroma-*` · `accent-hue-*`             |
| `shadow`     | shadow color            | `shadow-lum-*` · `shadow-chroma-*` · `shadow-hue-*`             |
| `ring`       | `--tw-ring-color`       | `ring-lum-*` · `ring-chroma-*` · `ring-hue-*`                   |
| `ring-offset`| `--tw-ring-offset-color`| `ring-offset-lum-*` · `ring-offset-chroma-*` · `ring-offset-hue-*` |
| `from`       | gradient from           | `from-lum-*` · `from-chroma-*` · `from-hue-*`                    |
| `to`         | gradient to             | `to-lum-*` · `to-chroma-*` · `to-hue-*`                          |

All setters work with standard Tailwind modifiers (`hover:`, `focus:`, `md:`, …).

`shadow-*`, `ring-*`, and `ring-offset-*` only set the _color_ — pair them with
Tailwind's own size utilities (`shadow-md`, `ring-2`, `ring-offset-2`) to paint,
just like Tailwind's built-in color utilities do:

```html
<button class="ring-2 ring-lum-6 ring-offset-2 ring-offset-lum-none">focus ring in the section's hue</button>
<button class="focus:ring-2 focus:ring-con-high">ring that auto-contrasts with the surface</button>
<div class="shadow-lg shadow-lum-8 shadow-chroma-mid">a shadow tinted by the cascade</div>
```

**Chroma stops:** `low` (0.02) · `mlow` (0.05) · `mid` (0.09) · `mhigh` (0.13) ·
`high` (0.17) · `max` (0.25). These are _base_ values, before the per-hue scale.
`max` deliberately overshoots sRGB, so `oklch()` gamut-maps it to the most
saturated color each hue can display — "give me the full color, whatever it is
here."

**Arbitrary values** — all three axes accept Tailwind's bracket syntax on every
setter and both property-less classes:

```html
<div class="hue-[180] bg-lum-3">Teal subtree (chroma scale 1)</div>
<div class="chroma-[8] bg-lum-3">Everything at chroma 0.08</div>   <!-- integer 0–100 → 0.00–1.00 -->
<div class="bg-lum-[70]">Light: L=0.70 · Dark: L=0.30</div>        <!-- integer = direct L, auto-flips -->
```

Note that arbitrary `lum-[n]` is a _direct luminance_ (`n/100`), while the named
`lum-1…10` scale is a curved contrast ramp — two tools sharing a prefix.
Likewise `con-[40]` sets ΔL directly (`n/100` off the background).

**Gradients** compose with Tailwind v4's own plumbing:

```html
<div class="bg-linear-to-r from-lum-3 to-lum-7">luminance ramps, hue + chroma from the cascade</div>
<div class="bg-linear-to-r from-lum-3 to-lum-3 to-hue-accent">primary → accent, matched L and C</div>
```

---

## Migrating to 0.7

0.7 is a breaking overhaul of everything below the core concept. It's still
pre-1.0 — the API isn't settled, so pin the version and expect more churn.

- **No more JS plugin or shorthands.** Delete the `@plugin "tailwind-oklch/plugin";`
  line — `@import "tailwind-oklch";` is the whole install now. The
  `{prop}-{L}-{C}[-{H}]` shorthands (`bg-3-mhi`, `bg-3-mhi-accent`) are gone;
  they re-pinned all three axes on every leaf, against the cascade. Split them
  into axes and hoist hue/chroma: `bg-3-mhi-accent` → `hue-accent` (on the
  parent) + `bg-lum-3 bg-chroma-mhigh`.
- **Axis prefixes renamed for readability** — `lum` / `chroma` / `hue`.
  `bg-lc-5` → `bg-lum-5`, `bg-c-mid` → `bg-chroma-mid`, `bg-h-info` → `bg-hue-info`.
- **Chroma stops spelled out** — `lo` / `mlo` / `mhi` / `hi` → `low` / `mlow` /
  `mhigh` / `high` (`mid` unchanged).
- **The luminance scale is reindexed and re-cut.** Numbered stops are now `1`–`10`
  on a front-loaded formula; the pure poles moved out of the numbers to
  `lum-none` (white/black) and `lum-max` (black/white). `lum-0` is gone.
  Everyday surfaces shift a notch: a card is `lum-2`.
- **The `none` / `base` / `fore` / `full` aliases are gone.** `lc-none` →
  `lum-none`, `lc-full` → `lum-max`, `lc-base` → `lum-1`, `lc-fore` → `lum-9`/`lum-10`.
- **Chroma is now scaled per hue.** A given `chroma-*` stop paints less on blue
  than it used to. If a color looks off, retune its `--cscale-*` or set an
  explicit `*-chroma-[n]`.

## Further reading

- **[docs/cascade.md](docs/cascade.md)** — the cascade model and reference
  frames: what cascades vs. what's a leaf, the three ways a class can be measured
  (absolute stops · `lum-up/down` · `con`), and the anchor split that lets `con`
  read the real surface while nudges stay non-compounding.
- **[docs/luminance-contrast.md](docs/luminance-contrast.md)** — the contrast
  math behind `con-*`: direction, the graduated ΔL offsets, and prior art.

## Building

`index.css` is generated from `scripts/gen-index.js` to keep every
color-painting utility's `oklch()` expression identical. Edit the generator,
then run `node scripts/gen-index.js index.css`.

## License

MIT
