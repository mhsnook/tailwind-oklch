# Bug: `@tailwindcss/vite` minifier strips required spaces between `oklch()` arguments

## Summary

When `oklch()` color function arguments are CSS `var()` references (not static values), the Tailwind v4 built-in minifier (LightningCSS) strips the required whitespace between space-separated arguments, producing invalid CSS.

**Input (authored CSS):**
```css
background-color: oklch(var(--my-l) var(--my-c) var(--my-h));
```

**Expected minified output:**
```css
background-color:oklch(var(--my-l) var(--my-c) var(--my-h))
```

**Actual minified output:**
```css
background-color:oklch(var(--my-l)var(--my-c)var(--my-h))
```

The spaces between the three arguments are removed. Since `oklch()` uses space-separated syntax (not comma-separated), the browser cannot parse the value and the declaration is silently discarded.

## Workaround

Pass `optimize: { minify: false }` to the Tailwind Vite plugin:

```js
// vite.config.js or astro.config.mjs
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tailwindcss({ optimize: { minify: false } })],
}
```

## Affected versions

- `tailwindcss` 4.1.18
- `@tailwindcss/vite` 4.1.18
- LightningCSS 1.30.2 (bundled internally by `@tailwindcss/vite`)

## Minimal reproduction

### 1. Scaffold the project

```bash
mkdir oklch-minify-bug && cd oklch-minify-bug
npm init -y
npm install tailwindcss @tailwindcss/vite vite
```

### 2. Create `index.html`

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="./src/style.css" />
  </head>
  <body>
    <div class="demo-box">This should have a colored background</div>
  </body>
</html>
```

### 3. Create `src/style.css`

```css
@import "tailwindcss";

@theme {
  --color-demo: oklch(0.6 0.15 250);
}

:root {
  --my-l: 0.6;
  --my-c: 0.15;
  --my-h: 250;
}

.demo-box {
  /* Static oklch — works fine after minification */
  border: 2px solid oklch(0.8 0.1 250);

  /* Dynamic oklch via var() — BROKEN after minification */
  background-color: oklch(var(--my-l) var(--my-c) var(--my-h));
  color: oklch(0.95 0.02 var(--my-h));

  padding: 2rem;
  font-family: system-ui;
}
```

### 4. Create `vite.config.js`

```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### 5. Build and inspect

```bash
npx vite build
```

Inspect the CSS output in `dist/assets/*.css`. You will see:

```css
/* Spaces stripped — invalid CSS, browser ignores the declaration */
background-color:oklch(var(--my-l)var(--my-c)var(--my-h))
```

### 6. Verify the fix

Change `vite.config.js` to:

```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss({ optimize: { minify: false } })],
})
```

Rebuild — the spaces are preserved and the colors render correctly.

## What's happening

The `oklch()` CSS color function uses **space-separated** arguments:

```
oklch(<lightness> <chroma> <hue> [ / <alpha> ])
```

When all three arguments are static literals, LightningCSS appears to handle them correctly (it even normalizes `0.6` to `60%` etc). But when one or more arguments are `var()` references, the minifier treats the inter-argument spaces as collapsible whitespace and removes them.

This applies to any pattern where `var()` calls are used as space-separated arguments to `oklch()`:

| Pattern | Minified (broken) |
|---|---|
| `oklch(var(--l) var(--c) var(--h))` | `oklch(var(--l)var(--c)var(--h))` |
| `oklch(clamp(0, calc(...), 1) var(--c) var(--h))` | `oklch(clamp(0,calc(...),1)var(--c)var(--h))` |
| `oklch(0.5 var(--c) var(--h))` | `oklch(.5 var(--c)var(--h))` |

This likely also affects other space-separated color functions (`lab()`, `lch()`, `oklab()`) when their arguments are `var()` references, though I've only tested `oklch()`.

## Root cause (probable)

This is likely a LightningCSS bug rather than a Tailwind-specific issue. LightningCSS is the CSS transformer/minifier used internally by `@tailwindcss/vite`. When it encounters `oklch()` with `var()` arguments that it cannot statically resolve, it falls back to treating the contents as generic token sequences where whitespace between `)` and `var(` appears collapsible — but in this context, the space is a syntactically required argument separator.
