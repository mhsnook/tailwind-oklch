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

   SHORTHAND    bg-mid-hi-primary        one class, full color
   DECOMPOSED   bg-l-mid bg-c-hi bg-h-primary   per-axis control
   CASCADING    parent sets color, child overrides one axis

   To customize hues, override in your own @theme block: */

@theme {
  --hue-primary: 180;  /* teal instead of purple */
  --hue-accent:  320;  /* pink instead of orange */
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
<div class="bg-mid-hi-accent p-6 rounded-xl">

  <!-- Child overrides ONLY luminance — inherits chroma + hue -->
  <button class="hover:bg-l-strong px-4 py-2 rounded">
    Lighter on hover
  </button>

  <!-- Another child shifts to low luminance -->
  <footer class="bg-l-base p-4 rounded">
    Dark footer, same chroma + hue as parent
  </footer>
</div>

<!-- Works across nesting levels too -->
<div class="bg-base-mlo-primary">           <!-- L:base C:mlo H:primary -->
  <div class="bg-h-success">              <!-- swap hue, keep L+C -->
    <div class="bg-l-full">                 <!-- swap luminance, keep C+H -->
      Three levels deep, each overriding one axis.
    </div>
  </div>
</div>

<!-- Hover/focus only changes what matters -->
<button class="
  bg-mid-hi-primary text-full-lo-primary
  hover:bg-l-strong              only luminance shifts
  active:bg-l-subtle             darker on press
  focus:bg-c-mhi              more saturated on focus
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
   Best for: setting a complete color in one class. -->

<div class="bg-full-lo-primary rounded-xl p-6">
  <h2 class="text-base-hi-primary text-xl font-bold">Dashboard</h2>
  <p class="text-subtle-mlo-primary">Muted body text</p>
  <button class="bg-mid-hi-accent text-full-lo-accent px-4 py-2 rounded">
    Action
  </button>
</div>

<!-- ── DECOMPOSED ──────────────────────────────────────────
   Pattern: bg-l-{L} bg-c-{C} bg-h-{H}
   Best for: overriding a single axis on hover, or when a
   parent already set the other two axes. -->

<button class="
  bg-l-mid bg-c-hi bg-h-primary
  hover:bg-l-strong
">Only luminance changes on hover</button>

<!-- ── NUMERIC VALUES ──────────────────────────────────────
   Use the 10–95 scale for fine-grained steps between
   the named stops (base/subtle/mid/strong/full). -->

<div class="bg-l-70 bg-c-30 bg-h-primary">
  Luminance 70, Chroma 30
</div>

<!-- ── SINGLE AXIS ─────────────────────────────────────────
   Defaults cascade from :root. A single class is enough. -->

<div class="bg-l-90">
  Just luminance — chroma + hue come from :root defaults.
</div>

<!-- ── SEMANTIC ALERTS ─────────────────────────────────────
   Swap the hue for instant semantic meaning. -->

<div class="bg-full-mlo-danger text-base-mid-danger border-strong-mid-danger border rounded-lg p-4">
  Something went wrong
</div>`,
	},
	how: {
		label: 'How It Works',
		lang: 'css',
		code: `/* ── WHAT THE UTILITIES ACTUALLY DO ──────────────────────────

   Every setter both updates its axis AND applies the resolved
   color. This is why a single bg-l-mid works — the other two
   axes are already defined at :root. */

/* Decomposed utility (from index.css) */
.bg-l-mid {
  --bg-l: var(--l-mid);                   /* set the axis     */
  background-color: oklch(                 /* apply the color  */
    var(--bg-l) var(--bg-c) var(--bg-h)
  );
}

/* Shorthand utility (from plugin.js) */
.bg-mid-hi-primary {
  --bg-l: var(--l-mid);                   /* set all 3 axes   */
  --bg-c: var(--c-hi);
  --bg-h: var(--hue-primary);
  background-color: oklch(                 /* apply the color  */
    var(--bg-l) var(--bg-c) var(--bg-h)
  );
}

/* Root defaults — the reason single-axis classes work */
:root {
  --bg-l: var(--l-mid);
  --bg-c: var(--c-lo);
  --bg-h: var(--hue-primary);
  /* ...same for text, border, gradient, etc. */
}

/* ── THE CASCADE IN ACTION ──────────────────────────────────

   Parent:  bg-mid-hi-accent
     └─ sets --bg-l: mid, --bg-c: hi, --bg-h: accent

   Child:   bg-l-strong
     └─ overrides --bg-l: strong
     └─ --bg-c and --bg-h INHERIT from parent
     └─ result: oklch(0.72 0.25 30) — lighter accent

   This is pure CSS inheritance. No JS, no context providers,
   no re-renders. The browser does the work. */

/* ── COMPARISON ─────────────────────────────────────────────

   Opacity-based (old):
     bg-primary/30            depends on what's behind it
     hover:bg-primary/20      washes out over other colors

   OKLCH composed (new):
     bg-full-lo-primary         absolute color, portable
     hover:bg-l-strong           single-axis shift, no blending

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
