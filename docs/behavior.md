# Predictable behavior & the edges

A practical guide to *what happens* when you use the utilities — the reliable convention, a
quick lookup, and the handful of markup shapes that produce plausible-but-wrong results (each
with a one-line fix). For the *why* and the internals, see [`b1-spec.md`](./b1-spec.md).

Three words up front:

- **surface** — a background luminance that descendants measure against (`bg-lum-*`).
- **mood** — a hue/chroma set for a whole subtree (`hue-*`, `chroma-*`), adopted by anything
  that paints below.
- **leaf** — a utility that paints *one element* (`text-con-*`, `text-chroma-*`, `border-*`, …).

---

## The convention (the golden path)

Do these and the system is boring and predictable — you will never hit an edge:

1. **State every surface with `bg-lum-N`.** It's the one thing children read to contrast against.
2. **State text and ink with `*-con-*` (contrast, the default) or `*-lum-N` (absolute).** Same
   for `border-*`, `fill-*`, `ring-*`.
3. **Set a whole area's colour with the bare `hue-*` / `chroma-*` (the mood).** It cascades to
   everything painted below.
4. **Set one element's colour with the prefixed `text-hue-*` / `text-chroma-*`.** It affects only
   that element.
5. **Paint what should be coloured, and give `:root` a default text paint**
   (`body { … text-con-mhigh }`) so all text starts painted and readable.

The single habit that keeps you on the path: **every element whose colour matters states its own
paint.** That's how you'd naturally write it anyway.

---

## Quick lookup

| You write | Cascades to descendants? | Paints | How its effect reaches children |
|---|---|---|---|
| `bg-lum-3` (surface) | **yes** — the surface | its background | children *contrast against* it |
| `bg-lum-up-1` (bump) | **yes** — a new surface | its background | same |
| `hue-danger` · `chroma-high` (mood) | **yes** — the mood | nothing | painted descendants *adopt* it |
| `text-lum-9` (foreground) | **yes** — the text-lightness default | its `color` | repainting text adopts it; bare text inherits the colour |
| `text-con-mid` (contrast) | no | its `color` | only as an inherited colour (bare text) |
| `text-chroma-max` · `text-hue-danger` | no | its `color` | only as an inherited colour (bare text) |
| `border-*` · `fill-*` · `ring-*` | no | that property | itself only (those properties don't inherit) |

Two cascades run at once — keep them straight:

- **Variable cascade** (surface, mood, text-lightness default): flows down, *read whenever
  something paints*.
- **Colour cascade** (CSS's own): only `color`, `fill`, `stroke` inherit — it carries a
  *finished* colour to **bare** (unpainted) descendants, and stops the instant one repaints.

---

## The edges

Each produces a believable wrong result. Each has a one-line fix. They're all the same two
mistakes underneath: **expecting a leaf (or a contrast) to cascade**, or **expecting a mood to
show without a paint.**

### 1. A mood on a container, with bare text inside

```html
<div class="hue-danger"><p>Something went wrong</p></div>   <!-- text is NOT red -->
```

The `<p>` never paints, so nothing reads `hue-danger`; it shows the colour it inherited from
above. **Do instead** — paint the text, or paint text on the container so bare children inherit it:

```html
<div class="hue-danger"><p class="text-con-mhigh">…</p></div>   <!-- p reads the mood ✓ -->
<div class="hue-danger text-con-mhigh"><p>…</p></div>           <!-- p inherits the red ✓ -->
```

### 2. A contrast "level" you expect to stick across a repaint

```html
<div class="text-con-low">
  <p class="text-chroma-high">…</p>    <!-- p is NOT low-contrast -->
</div>
```

`con` is *local* — it doesn't cascade. The `<p>` repaints and takes its lightness from the
text-lightness default, not the parent's `con-low`. **Do instead** — restate it, or use `text-lum-*`
(which *does* cascade) to set an area's lightness:

```html
<p class="text-con-low text-chroma-high">…</p>     <!-- restated ✓ -->
<div class="text-lum-7"> … </div>                  <!-- lightness cascades to repaints ✓ -->
```

### 3. An absolute surface **and** a bump on the same element

```html
<div class="bg-lum-2 hover:bg-lum-up-1">   <!-- hover snaps to the PARENT surface, not lum-3 -->
```

The base stop and the nudge reference each other → a variable cycle → it falls back to the
inherited (parent) surface. **Do instead** — an absolute hover stop, or a filter:

```html
<div class="bg-lum-2 hover:bg-lum-3">          <!-- ✓ -->
<div class="bg-lum-2 hover:brightness-95">     <!-- ✓ -->
```

### 4. Contrast against a non-`lum` background

```html
<div class="bg-white"><p class="text-con-mid">…</p></div>   <!-- contrast is wrong -->
```

`con` reads the surface, which **only `bg-lum-*` sets**. `bg-white` (or a semantic token) leaves
it stale, so contrast measures a surface that isn't there. **Do instead** — state the surface with
`bg-lum-*`; if the background *must* be an image or token, set the text with absolute `text-lum-*`,
not `con`.

### 5. Contrast on a gradient

```html
<div class="from-lum-1 to-lum-5 bg-gradient-to-br text-con-high">   <!-- contrast wrong -->
```

Gradient stops don't set the surface. **Do instead** — add a `bg-lum-N` for the contrast surface
(it paints a real background under the gradient):

```html
<div class="from-lum-1 to-lum-5 bg-lum-3 bg-gradient-to-br text-con-high">   <!-- ✓ -->
```

### 6. A per-property setter on a container, expecting it to cascade

```html
<div class="text-chroma-high">
  <p class="text-con-mid">…</p>    <!-- p does NOT get high chroma -->
</div>
```

`text-chroma-*` is a leaf — it paints the div and nothing else. Only the **bare seeder** cascades.
**Do instead** — use the seeder for a subtree, the setter for one element:

```html
<div class="chroma-high"> <p class="text-con-mid">…</p> </div>   <!-- cascades ✓ -->
```

---

## The one sentence

**Surface and mood cascade downhill and are read at paint time; a leaf paints one element; bare
descendants ride the inherited colour.** Bare seeders (`hue-*`, `chroma-*`) never paint;
per-property setters (`text-*`) always do. Every edge above is forgetting one of those.
