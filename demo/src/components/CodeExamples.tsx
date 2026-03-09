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

   GLOBAL HUE   hue-primary              sets hue for all properties
   GLOBAL CHROMA chroma-[8]              sets chroma for all properties
   PER-ELEMENT   bg-lc-[93] text-lc-[25] precise luminance per element
   CASCADING     parent sets hue, child overrides luminance

   Luminance contrast (0–10 named scale or [0–100] arbitrary):
     0 / base  = close to the page color (blends in)
     10 / fore = high contrast with the page (stands out)
     [N]       = exact value, auto-flips in dark mode

   To customize hues, override in your own @theme block: */

@theme {
  --hue-primary: 180;  /* teal instead of blue */
  --hue-accent:  320;  /* pink instead of red */
}`,
	},
	cascade: {
		label: 'The Cascade',
		lang: 'html',
		code: `<!-- ── THE KEY IDEA ─────────────────────────────────────────

   Set hue-* and chroma-[N] on a container. Children inherit
   all three axes and override only what they need — usually
   just luminance.

   This means you NEVER need to redeclare the full color
   just to change one channel. -->

<!-- Parent sets hue + chroma, children vary luminance -->
<div class="hue-accent chroma-[18] bg-lc-[45] text-lc-[95] p-6 rounded-xl">

  <!-- Child overrides ONLY luminance on hover -->
  <button class="hover:bg-lc-[55] px-4 py-2 rounded">
    Lighter on hover
  </button>

  <!-- Another child drops to page-level luminance -->
  <footer class="bg-lc-base p-4 rounded">
    Page-level footer, same chroma + hue as parent
  </footer>
</div>

<!-- Works across nesting levels too -->
<div class="hue-primary chroma-[6] bg-lc-1">
  <div class="bg-h-success">              <!-- swap hue, keep L+C -->
    <div class="bg-lc-fore">              <!-- swap luminance, keep C+H -->
      Three levels deep, each overriding one axis.
    </div>
  </div>
</div>

<!-- Hover/focus only changes what matters -->
<button class="
  hue-primary chroma-[20]
  bg-lc-[45] text-lc-[95]
  hover:bg-lc-[55]             only luminance shifts
  active:bg-lc-[35]            darker on press
  focus:chroma-[25]            more saturated on focus
">Interactive</button>

<!-- Re-theme the entire tree via JS -->
<script>
  document.documentElement.style.setProperty('--hue-primary', '180')
<\/script>`,
	},
	usage: {
		label: 'Usage Patterns',
		lang: 'html',
		code: `<!-- ── GLOBAL HUE + CHROMA (recommended) ────────────────────
   Set hue and chroma on a container. Vary luminance per element.
   Use arbitrary values for precise control. -->

<div class="hue-primary chroma-[6]">
  <div class="bg-lc-[93] rounded-xl p-6">
    <h2 class="text-lc-[25] text-xl font-bold">Dashboard</h2>
    <p class="text-lc-[55]">Muted body text</p>
    <button class="hue-accent bg-lc-[45] chroma-[20] text-lc-[95] px-4 py-2 rounded">
      Action
    </button>
  </div>
</div>

<!-- ── SINGLE-AXIS OVERRIDES ──────────────────────────────
   When the parent already set hue + chroma, just vary luminance.
   Great for hover states and emphasis. -->

<button class="
  hue-primary bg-lc-[45] chroma-[20] text-lc-[95]
  hover:bg-lc-[55]
">Only luminance changes on hover</button>

<!-- ── SEMANTIC ALIASES ──────────────────────────────────────
   base = 0 (blends with page), fore = 10 (high contrast).
   Works identically in light and dark mode. -->

<div class="hue-primary chroma-[4] bg-lc-base">
  Blends with the page in any mode.
</div>

<!-- ── SEMANTIC ALERTS ─────────────────────────────────────
   Swap hue for instant meaning. Same luminance + chroma pattern. -->

<div class="hue-danger chroma-[10] bg-lc-[93] text-lc-[30] border-lc-[75] border rounded-lg p-4">
  Something went wrong
</div>

<!-- ── NAMED STOPS (quick prototyping) ─────────────────────
   Named 0–10 luminance and lo/mlo/mid/mhi/hi chroma
   are still available for rougher work. -->

<div class="hue-primary bg-lc-1 chroma-lo border border-lc-3 rounded-lg p-4">
  Named stops for quick iteration.
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

/* Arbitrary luminance — auto-flips in dark mode */
.bg-lc-\\[80\\] {
  --bg-l: calc(0.8 + var(--lc-flip) * -0.6);
  background-color: oklch(
    var(--bg-l) var(--bg-c) var(--bg-h)
  );
}

/* Global hue — sets ALL hue properties at once */
.hue-primary {
  --bg-h: var(--hue-primary);
  --tx-h: var(--hue-primary);
  --bd-h: var(--hue-primary);
  /* ...and gradient, shadow, accent, etc. */
}

/* Root defaults — the reason single-axis classes work */
:root {
  --bg-l: var(--l-5);
  --bg-c: var(--c-lo);
  --bg-h: var(--hue-primary);
  /* ...same for text, border, gradient, etc. */
}

/* ── THE CASCADE IN ACTION ──────────────────────────────────

   Parent:  hue-accent chroma-[18] bg-lc-[45]
     └─ sets --bg-h: accent, --bg-c: 0.18, --bg-l: 0.45

   Child:   bg-lc-[55]
     └─ overrides --bg-l only
     └─ --bg-c and --bg-h INHERIT from parent
     └─ result: lighter accent at same chroma

   This is pure CSS inheritance. No JS, no context providers,
   no re-renders. The browser does the work. */

/* ── COMPARISON ─────────────────────────────────────────────

   Opacity-based (old):
     bg-primary/30            depends on what's behind it
     hover:bg-primary/20      washes out over other colors

   OKLCH composed (new):
     hue-primary bg-lc-[93]     absolute color, portable
     hover:bg-lc-[85]           single-axis shift, no blending

   The color is the SAME regardless of what sits behind it.
   No stacking-context surprises. No blending artifacts. */`,
	},
	arbitrary: {
		label: 'Arbitrary Values',
		lang: 'html',
		code: `<!-- ── ARBITRARY VALUES (the default approach) ──────────────
   Bracket syntax gives fine-grained control over all three axes.
   Integer scales: hue 0–360, chroma 0–100, luminance 0–100. -->

<!-- Global: sets hue + chroma for ALL properties on the subtree -->
<div class="hue-[180] chroma-[12]">
  <div class="bg-lc-[20] text-lc-[90]">
    Teal card — hue 180°, chroma 0.12
  </div>
</div>

<!-- Per-property: only affects one channel -->
<div class="bg-h-[280] bg-c-[20] bg-lc-[45]">
  Purple background — hue 280°, chroma 0.20
</div>

<!-- ── AUTO-FLIP LUMINANCE ───────────────────────────────
   bg-lc-[N] auto-flips for dark mode.
   bg-lc-[80] → L=0.80 in light, L=0.20 in dark.
   Toggle the theme to see it in action. -->

<div class="hue-[180] chroma-[12]">
  <div class="bg-lc-[15] text-lc-[90]">
    Near-page bg, high-contrast text
  </div>
  <span class="bg-lc-[30]">Subtle chip</span>
  <span class="bg-lc-[50]">Mid-range chip</span>
  <span class="bg-lc-[70]">Prominent chip</span>
</div>

<!-- Works with all properties and pseudo-states -->
<button class="
  hue-primary chroma-[15]
  bg-lc-[25] text-lc-[85] border-lc-[35]
  hover:bg-lc-[30] hover:border-lc-[40]
">Auto-flip button</button>

<!-- ── MIXING NAMED + ARBITRARY ─────────────────────────
   Named stops (bg-lc-3, chroma-mid) are great for quick work.
   Arbitrary values give you precision when the named stops
   don't hit the exact tone you need. Mix freely. -->

<div class="hue-danger chroma-[10]">
  <div class="bg-lc-1 text-lc-fore">Named luminance, arbitrary chroma</div>
  <button class="bg-lc-[45] chroma-[22]">Precise button</button>
</div>`,
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
