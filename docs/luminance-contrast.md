## Dynamic Luminance Contrast

### Core idea

Because of the magic of CSS, any element's CSS can use `calc()` for their own
CSS variables, as well as those they inherit from their parents. This means
we can do things like `bg-lum-up1` to bump the luminance value up without
knowing what it is. This means "this item will stand out a little, no matter
where it's placed".

Our luminance utility classes use a simple set of theme-defined stops from 0-to-N, so
that we can run some logic over it, such as flipping it in darkmode without ever
needing classes `dark:...`, and applying a theme-defined formula or set of colour
values for the different stops `lum-1`, `lum-2` ... `lum-10`, and so on.

This also allows us to opt in to automatic text contrast classes, like
`text-con-[high,mhigh,mid,mlow,low]`, which will read the element's background luminance
value, decide which direction to move in, and calculate the appropriate luminance
value for the element's text or borders. This allows us to write even more aggressively
ignorant component classes for maximum composability, while keeping contrast and
emphasis all relative within a component:

```tsx
// calling context knows how bright this should be
;<div class="bg-lum-2 bg-chroma-mid bg-hue-primary">
	<Card content={content} />
</div>

function Card(props) {
	// the card itself knows about its _relative_ colour values
	return (
		<div>
			<h2 className="text-con-mhigh font-bold text-2xl">{props.title}</h2>
			<h3 className="text-con-mlow">
				{props.subtitle}, {props.date}
			</h3>
			<div className="text-con-mhigh">{props.text}</div>
			<Row>
				<a className="chroma-mhigh bg-lum-8 text-lum-1">Read more</a>
				<a className="chroma-mhigh bg-lum-up1 text-con-mhigh">Go Back</a>
			</Row>
		</div>
	)
}
```

Obviously something like this can still be misused -- if you wrap the Card in a div
with `bg-lum-5` (right in the middle of the scale) then all but the lowest contrast
values will still result in either white or black text, but as long as you are using
sensible ranges like 1,2,3 or 8,9,10 (assuming your theme has 10 stops) you can use
this Card component in various different contexts, invert it (without keeping track of
flipping from light to dark at the theme level), wash it out or punch it up.

### Relative utilities don't cascade

The relative / derived utilities — `text-con-*`, `border-con-*`, and the nudges
`lum-up-*` / `lum-down-*` — read an inherited value and compute a color for **this
element only**. They never rewrite the cascading variable, so they don't compound
down the tree and don't change what descendants inherit.

Only the axis classes change what cascades: the **seeders** (`hue-*`, `chroma-*`)
and the **direct setters** (`bg-lum-N`, `text-chroma-N`, `border-hue-N`, …), which
assign `--bg-l` / `--bg-c` / `--bg-h` (and the per-hue `--*-cs`). A child's
`text-con-*` therefore reads the nearest ancestor's _set_ `--bg-l`, never a
parent's already-nudged one — the same "no compounding" rule the `lum-up`/`down`
adjustments follow.

### Naming

Yes — use `low · mlow · mid · mhigh · high`, the same scale as chroma. Whole
words for anything five letters or fewer; the prefix stays `con` only because
"contrast" is longer than that. So `text-con-low` … `text-con-high` (and
`border-con-*`). The graduated table lives in the implementation section below.

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

Since `--bg-l` is always a bare OKLCH lightness number (0–1), the text luminance
can be computed with `calc()` by offsetting **away from the surface's own
luminance**, toward whichever end is farther.

The direction must come from `--bg-l` itself — **not** from `--lum-dir`.
`--lum-dir` is _page_-relative (−1 in light, +1 in dark), so on a `bg-lum-10`
surface (near-black in light mode) it would point _toward_ the surface and kill
the contrast. Instead, derive the direction from where `--bg-l` actually sits:

```css
@utility text-con-mid {
	/* +1 when the surface is dark, −1 when it's light (crossover ≈ 0.6, which
	   leans slightly toward black text to match perceptual asymmetry) */
	--con-dir: clamp(-1, calc((0.6 - var(--bg-l)) * 1000), 1);
	/* move a fixed perceptual distance in that direction; the clamp snaps to
	   pure black/white whenever there isn't room left */
	--tx-l: clamp(0, calc(var(--bg-l) + var(--con-dir) * 0.32), 1);
	color: oklch(var(--tx-l) var(--tx-c) var(--tx-h));
}
```

Each level is the same formula with a different offset. `text-con-high` uses an
offset big enough (≥ ~0.55) that it always clamps to pure black or white — i.e.
it _is_ `contrast-color()`. The lower levels stay graduated:

| Utility          | Intent                              | ≈ ΔL offset |
| ---------------- | ----------------------------------- | ----------- |
| `text-con-low`   | Decorative, muted                   | ~0.18       |
| `text-con-mlow`  | Secondary, metadata                 | ~0.25       |
| `text-con-mid`   | Body text, readable                 | ~0.32       |
| `text-con-mhigh` | Headlines, emphasis                 | ~0.42       |
| `text-con-high`  | Max contrast — snaps to black/white | ~0.55+      |

This is a distance-in-`L` model, and it trusts OKLCH's perceptual uniformity: an
equal `L` gap ≈ an equal perceived lightness step. That's a strong heuristic, not
a WCAG/APCA guarantee — contrast perception is polarity-asymmetric (see APCA
below) — but it reads correctly in the overwhelming majority of cases, and any
level is a one-word bump away. Borders and outlines get the same treatment via
`border-con-*` and `outline-con-*` (reading the inherited border hue/chroma).

**Shipped in 0.7.** `text-con-*`, `border-con-*`, and `outline-con-*` are live
with exactly the offsets tabled above. They compute the luminance inline rather
than rewriting `--tx-l` / `--bd-l`, so — like `lum-up/down` — they paint without
touching the cascading axis vars and never compound down the tree. `con` is the
one family always measured against the background; `lum` and `lum-up/down` stay
measured against the property's own inherited value.
