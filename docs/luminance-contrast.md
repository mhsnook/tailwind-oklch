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
;<div class="bg-lum-2 bg-chr-mid bg-hue-primary">
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
				<a className="hue-mhi bg-lum-8 text-lum-1">Read more</a>
				<a className="hue-mhi bg-lum-up1 text-con-mhigh">Go Back</a>
			</Row>
		</div>
	)
}
```

Obviously something like this can still be misused -- if you wrap the Card in a div
with `bg-lc-5` (right in the middle of the scale) then all but the lowest contrast
values will still result in either white or black text, but as long as you are using
sensible ranges like 1,2,3 or 8,9,10 (assuming your theme has 10 stops) you can use
this Card component in various different contexts, invert it (without keeping track of
flipping from light to dark at the theme level), wash it out or punch it up.

### Contrast levels (proposed)

NOTE TO AGENT: I like this scale, but maybe low, mlow, mid, mhigh, high, is just a better one? it's what we use for chroma too?

| Utility          | Intent              | Approx. APCA Lc |
| ---------------- | ------------------- | --------------- |
| text-contrast-xs | Decorative, muted   | Lc ~30-45       |
| text-contrast-sm | Secondary, metadata | Lc ~45-60       |
| text-contrast-md | Body text, readable | Lc ~60-75       |
| text-contrast-lg | Headlines, emphasis | Lc ~75-90       |
| text-contrast-xl | Max contrast (b/w)  | Lc ~90+         |

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
@utility text-con-md {
	--tx-l: clamp(0, calc(var(--bg-l) + var(--lum-dir) * 0.5), 1);
	color: oklch(var(--tx-l) var(--tx-c) var(--tx-h));
}
```
