# Predictable behavior & the edges

A practical guide to *what happens* when you use the utilities — the reliable convention, a
quick lookup, and the handful of markup shapes that produce plausible-but-wrong results (each
with a one-line fix). For the *why* and the internals, see [`cascade.md`](./cascade.md).

## Three categories to start with

- **mood** -- the default hue, chroma, and contrast for your whole app or a component and its subtree, set with three cascading, paint-nothing utilities: `hue-*`, `chroma-*`, and `contrast-*`. They mirror the three OKLCH channels — hue is **H**, chroma is **C**, and contrast stands in for **L** (as a *relationship* to the surface, not a fixed value). Each sets an axis for every colour calculation below it and cascades by ordinary custom-property inheritance; descendants fall back to it whenever they repaint without stating their own: `<body class="hue-primary chroma-mid contrast-mid"> ... <Callout class="hue-info chroma-mlow contrast-low"> ... <Alert class="hue-success">`
- **leaf** -- standard colour-painting utilities that recompute one element's colour (`text-con-mid`, `text-chroma-high`, `border-lum-3`, …). Each states exactly one axis, so a leaf makes this element differ from a classless sibling in that one axis and nothing else. *(Handy test: put the class on one of two identical siblings — whatever changed is precisely what the class does.)*
- **surface** -- a background luminance that descendants measure against (`bg-lum-1`). In the OKLCH-variable sense `bg-lum-[number]` paints like any other leaf, but it also publishes the surface (`--bg-l`) that every `con-*` utility below it reads.

However, CSS and visual design require us to deal with cascades in a few different ways:

1. Backgrounds/surfaces cascade inherently, because they create the background surface for all their descendants that don't declare their own. This isn't CSS variable inheritance, just the way items stack on top of their container's background surface.
2. Some colours ride the cascade with no variable of ours — and two different mechanisms look alike here:
   - **Independent inherited channels:** `color`, `fill`, `stroke`, `caret-color`. Each carries its own value down its own wire. Setting `color` does nothing to `fill` — separate knobs. `fill: red` on a parent inherits `red` to children regardless of their colour.
   - **`currentColor` aliasing:** `border-color`, `outline-color`, `text-decoration-color`, and friends do **not** cascade at all. Their initial value is the keyword `currentColor`, which each element re-resolves *locally* against its own `color`. They appear to follow colour, but nothing about `border-color` is inheriting — it's re-derived at every element from the one thing that *is* inheriting: `color`.

   Either way the value is **sticky**. Declare a new mood like `hue-warning` on a subtree and none of these repaint on their own, because a mood only sets *our* custom properties — it never writes `color`/`fill`/`stroke`. Something has to actually paint (a `text-con`, a `fill-*`) for the new hue to take; until then the last-painted colour keeps inheriting.
3. The mood classes' variables cascade, so any element that repaints a colour falls back to the nearest ancestor's hue, chroma, or contrast whenever it doesn't state its own.

## Contrast & relative luminance controls

- **Global contrast utility** -- `contrast-[low|mid|high]`. It lets you define presets that move multiple properties at once — in `mid` mode, text can be `con-mid` while borders are `con-2`. Like the other mood controls it doesn't cause a paint, so you still need some `text-*` somewhere down the tree to actually paint. *(Use bare `text-con` for a no-op paint — or `* { @apply text-con border-con }` to paint everywhere at once.)*
- **Accessible text contrast controls** -- `text-con-{low, mlow, mid, mhigh, high, max}`. The most bog-standard way to make sure text is readable and carries the right visual weight, wherever it's placed: luminance is chosen for contrast against this element's current background surface, auto-directional so one class works on light *or* dark. *(E.g. `text-con-mid` for body copy, bump a heading to `text-con-high`, drop fine print to `text-con-mlow`.)* It's the only family measured against the surface, so it can't paint backgrounds — that'd be a circular reference, and there is no `bg-con-*`.
- **Relative contrast bump** -- many elements are decorative and don't need access-safe colours with big contrast values, so use the numbered `border-con-1` form to make a decorative element N stops more contrasty than its surface — whatever surface it lands on. Same ΔL-off-the-surface mechanism as the text ramp; the numbers just steer you toward borders and decorative SVG. Legal on any painted colour.
- **Relative background bump** -- `bg-lum-up-2` works like the contrast bump but creates a new *surface*: it steps off the nearest absolute `bg-lum-N` and republishes `--bg-l`, so descendants measure their contrast against the bumped surface. Nudges read the nearest absolute, so they don't compound.

## A couple of edges

- **A mood changes nothing you can see** — it only sets CSS variables. Those cascade to children, but the mood only "kicks in" once a child picks a property and paints it: `fill-hue-info`, `text-con-mid`, `bg-lum-up-1` are all property-specific leaf classes that paint an actual CSS colour (`fill`, `color`/`currentColor`, `background-color`), which then cascades — or doesn't — by standard CSS rules (`fill` cascades to descendant `fill`s, `color` cascades as `currentColor`, which lots of properties read from).
- **`text-hue` / `text-lum` paint at the *absolute* luminance, not the contrast one.** `text-con` picks luminance against the surface but deliberately doesn't write `--tx-l` (a leaf publishes nothing). So if your text's luminance came from a `text-con` and you drop `text-hue-danger` on a child, it snaps to the absolute `--tx-l`, not the contrast luminance its siblings show — they'll differ in luminance, not just hue. Fix: change hue through the cascading `hue-*` mood and let the next `text-con` carry it.

## The end result: less is more

The end result here is that the less you try to control colours, the more expressive your UI will be. Change chroma but not hue, set luminance on specific elements to make them stand out without disrupting colour schemes and moods, tweak the formulas and values to give yourself more range on the light surfaces (`bg-lum-1,2,3,4`), or slim your stylesheet down for a flatter palette.

```html
<style>
    /* anything with a border stands 2 bumps off its own surface */
    * { @apply border-con-2 outline-con-max stroke-con-low; }
</style>
<body class="bg-lum-1 hue-primary chroma-mlow contrast-mid text-con-mhigh">
    <div id="hero" class="chroma-mhigh">
        <h1 class="text-lum-9 text-2xl font-bold">title here</h1>
        <p class="text-con-low tracking-wide">description</p>
        <button class="text-con-max chroma-max bg-lum-6">go sign up</button>
    </div>
    <div id="subtler-marketing-section" class="hue-info chroma-mlow contrast-low text-con-mid">
        <p>anything goes</p>
        <p>we're styled properly</p>
        <p class="text-sm text-con-mlow">even lighter</p>
        <button class="bg-lum-up-2 border-con-1 chroma-mid text-con-high">more info</button>
    </div>
</body>
```

The result is a set of colour classes that are sparse, simple, and expressive. They don't speak in CSS properties exactly, or "component semantics," but they communicate design intent, mood, and emphasis — encoding more of your design work into your theme's formulas and the base values that give meaning to all these classes, and leaving less to be guessed about by the coder or agent writing your components. If you want it loud, it knows to turn the chroma up. It just knows, because OKLCH colour codes map pretty nicely onto the elements of good design.
