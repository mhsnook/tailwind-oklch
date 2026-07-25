## The cascade model & reference frames

Every color in tailwind-oklch is composed from three axes — luminance (`lum`),
chroma, and hue — and two of them **cascade**. You set a component's character
once near its root and most elements inside only ever state their own luminance.
This doc is about the part that trips people up: **what a class is measured
_against_**. Get the reference frames straight and the rest of the system falls
out of it.

For the contrast math itself (the `con-*` ΔL offsets, direction, prior art), see
[luminance-contrast.md](./luminance-contrast.md). This doc is the plumbing.

### What cascades, and what's a leaf

Everything runs on inherited CSS custom properties. Whether a class affects
descendants comes down to one question: **does it write an inheriting variable,
or just paint itself?**

| Class kind | Examples | Writes | Cascades to descendants? |
| --- | --- | --- | --- |
| **Property-less axis** | `hue-primary`, `chroma-mid` | `--*-h`, `--*-c`, `--*-cs` (every property) | ✅ that's their whole job — paint nothing |
| **Absolute setters** | `bg-lum-5`, `text-chroma-high`, `border-hue-info` | that property's axis var, e.g. `--bg-l` | ✅ the var inherits; also paints the property |
| **Relative nudges** | `bg-lum-up-1`, `text-lum-down-2` | see [below](#the-anchor-split) | ⚠️ bg updates `--bg-l` (the real surface) but not the anchor |
| **Contrast (leaf)** | `text-con-mid`, `border-con-low` | nothing that inherits | ❌ computes a color for this element only |

The property-less axis classes and absolute setters are the only classes that
change a subtree's inherited character. Nudges and `con-*` read the cascade and
mostly paint themselves.

### Three reference frames

A luminance class can be measured against one of exactly three things. Knowing
which is which is the whole game:

1. **Absolute — the numbered stops.** `bg-lum-2`, `text-lum-9`. A fixed point on
   the 0–10 ramp. These are your **reference points**: drop one on a parent and
   you know exactly where a subtree sits.

2. **Same-property relative — `lum-up/down`.** `text-lum-up-1` moves off the
   _text's own_ inherited luminance. "A step more contrast than whatever I
   inherited," for this element only.

3. **Background-relative — `con`.** `text-con-mid` moves off the _background
   behind the element_ (`--bg-l`), and auto-picks its direction toward contrast.
   It is the **only** family measured against the surface rather than against its
   own property.

Two rails for "relative," and they never blur: `lum-up/down` is off _me_, `con`
is off _my background_.

### The worked example

This is the case that exposes the whole mechanism. Three nested elements, light
mode (`--lum-1 = .92`, the `up-1` step is `.08`, `con-low` is a `.18` ΔL):

```html
<div class="bg-lum-1">            <!-- absolute:  --bg-l = .92, paints .92 -->
  <div class="bg-lum-up-1">       <!-- nudge:     paints .84, and sets --bg-l = .84 -->
    <span class="text-con-low">   <!-- leaf:      reads --bg-l = .84 → text .66 -->
      one step of contrast off the surface it actually sits on
    </span>
  </div>
</div>
```

- The `bg-lum-up-1` div paints `.92 − .08 = .84` **and writes `.84` into
  `--bg-l`**, because that is now the real surface.
- `text-con-low` reads `--bg-l = .84` and lands at `.84 − .18 = .66` — a full
  `.18 ΔL` against the surface it's actually on.

The subtle part: if the nudge had _not_ updated `--bg-l`, `con` would have read
the last absolute (`.92`) and produced `.74` — only `.10 ΔL` against the real
`.84` surface. Contrast-compliant against a surface that isn't there. So the
nudge **must** publish the real surface for `con` to trust it.

### Why you can't just make it compound

The tempting one-liner is to have the nudge write its result straight back:

```css
/* ✗ does NOT work */
@utility bg-lum-up-1 {
  --bg-l: calc(var(--bg-l) + var(--lum-dir) * .08);
}
```

A CSS custom property **cannot be defined in terms of its own inherited value**.
`--bg-l: calc(var(--bg-l) + …)` is a dependency cycle; per spec the property
computes to its guaranteed-invalid value, `background-color: oklch(var(--bg-l) …)`
falls back to `transparent`, and the invalid `--bg-l` inherits down and breaks
`con` too. (Verified in-browser — the element renders with no background.)

So "add a step to whatever I inherited, _in place_" is simply **not expressible**
in pure CSS, and true compounding across nesting is off the table regardless of
whether you'd want it. A nudge has to read from a _different_ variable than the
one it writes.

### The anchor split

That constraint is also the fix. `bg-lum-up/down` splits the two roles across two
variables:

- **`--bg-anchor-l`** — the nearest **absolute** `bg-lum-N`. Nudges _read_ this
  and never rewrite it.
- **`--bg-l`** — the **real** painted surface. A nudge _writes_ its result here.

```css
/* ✓ how it actually ships */
@utility bg-lum-up-1 {
  --bg-l-adj: var(--lum-adj-1);
  --bg-l: clamp(0, calc(var(--bg-anchor-l) + var(--lum-dir) * var(--bg-l-adj)), 1);
  background-color: oklch(var(--bg-l) calc(var(--bg-c) * var(--bg-cs)) var(--bg-h));
}
```

An absolute `bg-lum-N` (and `:root`) sets **both** vars. From this, two rules
fall out for free:

- **Nudges don't compound.** They measure from `--bg-anchor-l` (the nearest
  absolute), which they never touch — so two nested `bg-lum-up-1`s land on the
  same luminance, not two steps down. Want a new reference point? Drop an
  absolute `bg-lum-N`; it resets the anchor for its subtree.
- **`con` reads the real surface.** It reads `--bg-l`, which every nudge keeps
  truthful, so contrast is always computed against the background that actually
  exists — nudge included.

`text-lum-up/down` needs no anchor: nothing downstream reads `--tx-l`, so it just
computes its color inline and paints. It's non-compounding for the same reason
(it reads its inherited `--tx-l` and never rewrites it).

### The variables, in one place

| Variable | Set by | Read by | Inherits |
| --- | --- | --- | --- |
| `--bg-l` | `bg-lum-N` (absolute) **and** `bg-lum-up/down` (real surface) | `con-*`, `bg-lum-up/down`'s paint | ✅ |
| `--bg-anchor-l` | `bg-lum-N` (absolute) and `:root` only | `bg-lum-up/down` (its step) | ✅ |
| `--bg-c` / `--bg-h` / `--bg-cs` | `chroma-*` / `hue-*`, `bg-chroma/hue-*` | every bg paint | ✅ |
| `--tx-l` | `text-lum-N` (absolute) | `text-lum-up/down`, `text-con-*`'s hue/chroma path | ✅ |
| `--con-dir` / `--con-off` | `con-*` (scratch, per element) | `con-*`'s own calc | — |

The takeaway: **absolute stops are the anchors, nudges drift from the nearest
one, and `con` always speaks to the surface that's really there.**
