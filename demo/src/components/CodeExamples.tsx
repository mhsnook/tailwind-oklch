import { useState, useEffect } from 'react'
import { TabsRoot, TabsList, TabsTrigger, TabsPanel } from '@/components/ui/tabs'

const CODE_EXAMPLES = {
	setup: {
		label: 'Setup',
		lang: 'css',
		code: `/* ── your-project.css ────────────────────────────────────────
   Import tailwind-oklch into your Tailwind v4 project. */

@import "tailwindcss";
@import "tailwind-oklch";
@plugin "tailwind-oklch/plugin";

/* That's it. You now have:

   SHORTHAND    bg-5-hi-primary          one class, full color
   DECOMPOSED   bg-lc-5 bg-c-hi bg-h-primary   per-axis control
   CASCADING    parent sets color, child overrides one axis

   Luminance contrast 0–10 scale:
     0 / base  = close to the page color (blends in)
     10 / fore = high contrast with the page (stands out)
     1–9       = evenly distributed increments

   To customize hues, override in your own @theme block: */

@theme {
  --hue-primary: 180;  /* teal instead of purple */
  --hue-accent:  320;  /* pink instead of orange */
}

/* To shift the luminance contrast range: */
:root {
  --lc-range-start: 0.95;  /* light-mode base/0 */
  --lc-range-end:   0.15;  /* light-mode fore/10 */
}
.dark {
  --lc-range-start: 0.12;  /* dark-mode base/0 */
  --lc-range-end:   0.92;  /* dark-mode fore/10 */
}`,
	},
	cascade: {
		label: 'The Cascade',
		lang: 'html',
		code: `<!-- ── THE KEY IDEA ─────────────────────────────────────────

   Every color utility — shorthand or decomposed — sets CSS
   custom properties (--bg-l, --bg-c, --bg-h) that cascade
   through the DOM. Children inherit all three axes and can
   override any single one.

   This means you NEVER need to redeclare the full color
   just to change one channel. -->

<!-- Parent sets the full color via shorthand -->
<div class="bg-5-hi-accent p-6 rounded-xl">

  <!-- Child overrides ONLY luminance — inherits chroma + hue -->
  <button class="hover:bg-lc-8 px-4 py-2 rounded">
    Lighter on hover
  </button>

  <!-- Another child drops to page-level luminance -->
  <footer class="bg-lc-base p-4 rounded">
    Page-level footer, same chroma + hue as parent
  </footer>
</div>

<!-- Works across nesting levels too -->
<div class="bg-1-mlo-primary">              <!-- L:1 C:mlo H:primary -->
  <div class="bg-h-success">              <!-- swap hue, keep L+C -->
    <div class="bg-lc-fore">                <!-- swap luminance, keep C+H -->
      Three levels deep, each overriding one axis.
    </div>
  </div>
</div>

<!-- Hover/focus only changes what matters -->
<button class="
  bg-5-hi-primary text-fore-lo-primary
  hover:bg-lc-8                only luminance shifts
  active:bg-lc-3               darker on press
  focus:bg-c-mhi               more saturated on focus
">Interactive</button>

<!-- Re-theme the entire tree via JS -->
<script>
  document.documentElement.style.setProperty('--hue-primary', '180')
<\/script>`,
	},
	usage: {
		label: 'Usage Patterns',
		lang: 'html',
		code: `<!-- ── SHORTHAND ────────────────────────────────────────────
   Pattern: {property}-{luminance}-{chroma}-{hue}
   Luminance contrast: 0–10 (or base/fore aliases)
   Best for: setting a complete color in one class. -->

<div class="bg-fore-lo-primary rounded-xl p-6">
  <h2 class="text-1-hi-primary text-xl font-bold">Dashboard</h2>
  <p class="text-3-mlo-primary">Muted body text</p>
  <button class="bg-5-hi-accent text-fore-lo-accent px-4 py-2 rounded">
    Action
  </button>
</div>

<!-- ── DECOMPOSED ──────────────────────────────────────────
   Pattern: bg-lc-{L} bg-c-{C} bg-h-{H}
   Best for: overriding a single axis on hover, or when a
   parent already set the other two axes. -->

<button class="
  bg-lc-5 bg-c-hi bg-h-primary
  hover:bg-lc-8
">Only luminance changes on hover</button>

<!-- ── SEMANTIC ALIASES ──────────────────────────────────────
   base = 0 (blends with page), fore = 10 (high contrast).
   The same class works in both light and dark mode. -->

<div class="bg-lc-base bg-c-lo bg-h-primary">
  Blends with the page in any mode.
</div>
<div class="bg-lc-fore bg-c-lo bg-h-primary">
  Maximum contrast in any mode.
</div>

<!-- ── MENTAL MODEL ───────────────────────────────────────
   "My card bg is lc-1, my border is lc-3"
   = 2 stops of visible difference, in both modes. -->

<div class="bg-1-lo-primary border border-3-lo-primary rounded-lg p-4">
  Predictable contrast increments.
</div>

<!-- ── SEMANTIC ALERTS ─────────────────────────────────────
   Swap the hue for instant semantic meaning. -->

<div class="bg-fore-mlo-danger text-1-mid-danger border-8-mid-danger border rounded-lg p-4">
  Something went wrong
</div>`,
	},
	how: {
		label: 'How It Works',
		lang: 'css',
		code: `/* ── WHAT THE UTILITIES ACTUALLY DO ──────────────────────────

   Every setter both updates its axis AND applies the resolved
   color. This is why a single bg-lc-5 works — the other two
   axes are already defined at :root. */

/* Decomposed utility (from index.css) */
.bg-lc-5 {
  --bg-l: var(--l-5);                    /* set the axis     */
  background-color: oklch(                /* apply the color  */
    var(--bg-l) var(--bg-c) var(--bg-h)
  );
}

/* Shorthand utility (from plugin.js) */
.bg-5-hi-primary {
  --bg-l: var(--l-5);                    /* set all 3 axes   */
  --bg-c: var(--c-hi);
  --bg-h: var(--hue-primary);
  background-color: oklch(                /* apply the color  */
    var(--bg-l) var(--bg-c) var(--bg-h)
  );
}

/* Root defaults — the reason single-axis classes work */
:root {
  --bg-l: var(--l-5);
  --bg-c: var(--c-lo);
  --bg-h: var(--hue-primary);
  /* ...same for text, border, gradient, etc. */
}

/* ── THE 0–10 CONTRAST SCALE ──────────────────────────────

   0 / base = close to the page color (blends in)
   10 / fore = high contrast with the page (stands out)

   The range flips between modes:

   Light mode: 0→0.95, 5→0.55, 10→0.15
   Dark mode:  0→0.12, 5→0.52, 10→0.92

   So "lc-3" always means "3 stops from the page" —
   a subtle, low-contrast element in either mode. */

/* ── THE CASCADE IN ACTION ──────────────────────────────────

   Parent:  bg-5-hi-accent
     └─ sets --bg-l: var(--l-5), --bg-c: hi, --bg-h: accent

   Child:   bg-lc-8
     └─ overrides --bg-l: var(--l-8)
     └─ --bg-c and --bg-h INHERIT from parent
     └─ result: brighter accent at same chroma

   This is pure CSS inheritance. No JS, no context providers,
   no re-renders. The browser does the work. */

/* ── COMPARISON ─────────────────────────────────────────────

   Opacity-based (old):
     bg-primary/30            depends on what's behind it
     hover:bg-primary/20      washes out over other colors

   OKLCH composed (new):
     bg-fore-lo-primary         absolute color, portable
     hover:bg-lc-8               single-axis shift, no blending

   The color is the SAME regardless of what sits behind it.
   No stacking-context surprises. No blending artifacts. */`,
	},
} as const

type TabKey = keyof typeof CODE_EXAMPLES

export default function CodeExamples() {
	const [highlighted, setHighlighted] = useState<Record<string, string>>({})

	useEffect(() => {
		let cancelled = false

		async function highlightAll() {
			const { codeToHtml } = await import('shiki')
			const results: Record<string, string> = {}

			for (const [key, example] of Object.entries(CODE_EXAMPLES)) {
				results[key] = await codeToHtml(example.code, {
					lang: example.lang,
					theme: 'github-dark',
				})
			}

			if (!cancelled) setHighlighted(results)
		}

		highlightAll()
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<TabsRoot defaultValue="setup">
			<TabsList>
				{Object.entries(CODE_EXAMPLES).map(([key, example]) => (
					<TabsTrigger key={key} value={key} className="font-mono text-[0.8rem]">
						{example.label}
					</TabsTrigger>
				))}
			</TabsList>

			{Object.keys(CODE_EXAMPLES).map((key) => (
				<TabsPanel key={key} value={key}>
					<div className="code-block rounded-xl p-6 overflow-x-auto mt-2">
						{highlighted[key] ? (
							<div
								className="font-mono text-[0.78rem] leading-[1.7] [&_pre]:!bg-transparent [&_code]:!bg-transparent"
								dangerouslySetInnerHTML={{ __html: highlighted[key] }}
							/>
						) : (
							<pre className="font-mono text-[0.78rem] leading-[1.7] text-muted-foreground">
								{CODE_EXAMPLES[key as TabKey].code}
							</pre>
						)}
					</div>
				</TabsPanel>
			))}
		</TabsRoot>
	)
}
