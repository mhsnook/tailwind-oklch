import { useState, useEffect } from 'react'
import { TabsRoot, TabsList, TabsTrigger, TabsPanel } from '@/components/ui/tabs'

const CODE_EXAMPLES = {
	css: {
		label: 'CSS Variables',
		lang: 'css',
		code: `/* ── your-project.css ────────────────────────────────────────
   Import tailwind-oklch into your Tailwind v4 project's main CSS. */

@import "tailwindcss";
@import "tailwind-oklch";
@plugin "tailwind-oklch/plugin";

/* That's it! You now have:
   - CSS theme variables (--hue-primary, --l-lo, --c-mid, etc.)
   - Decomposed utilities (bg-l-*, bg-c-*, bg-h-*, text-*, border-*)
   - Shorthand utilities (bg-{L}-{C}-{H}, text-{L}-{C}-{H}, border-{L}-{C}-{H})

   To customize hues, override in your own @theme block: */

@theme {
  --hue-primary: 180;  /* teal instead of purple */
  --hue-accent:  320;  /* pink instead of orange */
}`,
	},
	plugin: {
		label: 'Tailwind v4 Plugin',
		lang: 'javascript',
		code: `// ── plugin.js ──────────────────────────────────────────────
// Shorthand generator: creates .{prop}-{L}-{C}-{H} utilities
// for all named luminance × chroma × hue combinations.
//
// Load via: @plugin "tailwind-oklch/plugin";

module.exports = function ({ addUtilities }) {
  const luminances  = ['lo', 'mlo', 'mid', 'mhi', 'hi'];
  const chromas     = ['lo', 'mlo', 'mid', 'mhi', 'hi'];
  const hues        = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];
  const properties  = [
    { prefix: 'bg',     css: 'background-color' },
    { prefix: 'text',   css: 'color' },
    { prefix: 'border', css: 'border-color' },
  ];

  const utilities = {};

  for (const prop of properties) {
    for (const l of luminances) {
      for (const c of chromas) {
        for (const h of hues) {
          utilities[\`.\${prop.prefix}-\${l}-\${c}-\${h}\`] = {
            [prop.css]: \`oklch(var(--l-\${l}) var(--c-\${c}) var(--hue-\${h}))\`,
          };
        }
      }
    }
  }

  addUtilities(utilities);
};`,
	},
	usage: {
		label: 'Usage Examples',
		lang: 'html',
		code: `<!-- ── SHORTHAND SYNTAX ──────────────────────────────────────
     Pattern: {property}-{luminance}-{chroma}-{hue}

     This is the main API. Every color in your app becomes
     a transparent composition of L, C, and H. -->

<!-- Subtle card with strong heading -->
<div class="bg-hi-lo-primary rounded-xl p-6">
  <h2 class="text-lo-hi-primary text-xl font-bold">Dashboard</h2>
  <p class="text-mlo-mlo-primary">Muted body text</p>
  <button class="bg-mid-hi-accent text-hi-lo-accent px-4 py-2 rounded">
    Action
  </button>
</div>

<!-- Hover states with luminance shift (no opacity!) -->
<button class="
  bg-mid-hi-primary text-hi-lo-primary
  hover:bg-mhi-hi-primary
  active:bg-mlo-hi-primary
">Click me</button>

<!-- Alert with semantic color -->
<div class="bg-hi-mlo-danger text-lo-mid-danger border-mhi-mid-danger border rounded-lg p-4">
  Something went wrong
</div>

<!-- Re-theme via JS (or server-side): -->
<script>
  document.documentElement.style.setProperty('--hue-primary', '180'); // teal!
  document.documentElement.style.setProperty('--hue-accent',  '320'); // pink!
<\/script>`,
	},
	shorthand: {
		label: 'Shorthand vs Decomposed',
		lang: 'html',
		code: `<!-- TWO SYNTAXES, ONE SYSTEM ─────────────────────────────────

   SHORTHAND: bg-{L}-{C}-{H}
   One class, fully resolved color.
   Great for: most cases, quick prototyping, readable markup.

   DECOMPOSED: bg-composed + bg-l-{L} + bg-c-{C} + bg-h-{H}
   Three classes set CSS vars, one class reads them.
   Great for: hover/focus state changes on single axes,
   animations, when you want to vary just one channel. -->

<!-- SHORTHAND — most common usage -->
<div class="bg-hi-lo-primary">
  Simple. One class. Done.
</div>

<!-- DECOMPOSED — when you need axis-level control -->
<button class="
  bg-composed bg-l-mid bg-c-hi bg-h-primary
  hover:bg-l-mhi
">
  Only luminance changes on hover. Chroma and hue stay fixed.
  No need to re-declare the full color.
</button>

<!-- NUMERIC VALUES — for fine-grained control -->
<div class="bg-composed bg-l-70 bg-c-30 bg-h-primary">
  Luminance 70, Chroma 30 — between the named stops.
</div>

<!-- COMPARISON ──────────────────────────────────────────────

   Old approach (opacity-based):
     bg-primary/30               ← depends on what's behind it
     hover:bg-primary/20         ← can wash out over other colors

   New approach (OKLCH composed):
     bg-hi-lo-primary            ← absolute color, portable
     hover:bg-mhi-lo-primary     ← luminance shift, no blending

   The composed color is the SAME regardless of what element
   or container it sits inside. No blending artifacts. -->`,
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
		<TabsRoot defaultValue="css">
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
