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

   HUE        hue-primary          cascading, set once on container
   LUMINANCE  bg-lc-05, bg-lc-5    the workhorse — 15 stops + [0-100]
   CHROMA     chroma-mid           sensible defaults, rarely override

   Luminance scale (denser at extremes):
     0, 05, 1, 15, 2, 3, 4, 5, 6, 7, 8, 85, 9, 95, 10
     base = 0 (blends with page)
     fore = 10 (high contrast, like text)

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

   Set hue-* on a container. Children inherit hue + chroma
   and only vary luminance — usually all you need.

   Chroma has sensible per-property defaults:
     bg: lo (0.02)    — subtle tint
     text: lo (0.02)  — readable
     border: mlo (0.06) — visible boundary
     accent: mhi (0.18) — stands out

   Override chroma with chroma-mid, chroma-mhi, etc. when
   you need more or less saturation. -->

<!-- Parent sets hue, children vary luminance -->
<div class="hue-accent bg-lc-3 chroma-mhi text-lc-fore p-6 rounded-xl">

  <!-- Child overrides ONLY luminance on hover -->
  <button class="hover:bg-lc-up-1 px-4 py-2 rounded">
    Lighter on hover
  </button>

  <!-- Another child drops to page-level luminance -->
  <footer class="bg-lc-base p-4 rounded">
    Page-level footer, same chroma + hue as parent
  </footer>
</div>

<!-- Three levels deep, each overriding one axis -->
<div class="hue-primary bg-lc-1">
  <div class="bg-h-success">              <!-- swap hue -->
    <div class="bg-lc-fore">              <!-- swap luminance -->
      Pure CSS inheritance. No JS. No re-renders.
    </div>
  </div>
</div>

<!-- Half-steps at the extremes for subtle backgrounds -->
<div class="hue-primary bg-lc-05 border border-lc-15 p-4 rounded-lg">
  Just off-white in light mode, just off-black in dark mode.
  The 05 and 15 stops give you finer control near the page color.
</div>

<!-- Re-theme the entire tree via JS -->
<script>
  document.documentElement.style.setProperty('--hue-primary', '180')
<\/script>`,
	},
	usage: {
		label: 'Usage Patterns',
		lang: 'html',
		code: `<!-- ── SET HUE ONCE, VARY LUMINANCE ─────────────────────────
   The recommended pattern. Almost everything is just
   hue-* + bg-lc-N. Chroma defaults handle the rest. -->

<div class="hue-primary">
  <div class="bg-lc-05 rounded-xl p-6">
    <h2 class="text-lc-fore text-xl font-bold">Dashboard</h2>
    <p class="text-lc-5">Muted body text</p>
    <button class="hue-accent bg-lc-5 chroma-mhi text-lc-0 px-4 py-2 rounded">
      Action
    </button>
  </div>
</div>

<!-- ── HALF-STEPS AT THE EXTREMES ───────────────────────────
   The 05/15/85/95 stops fill the gap where whole steps
   are too far apart — near the page color and near text. -->

<div class="hue-primary bg-lc-05 border border-lc-15 rounded-lg p-4">
  Subtle card — just one half-step off the page.
</div>

<div class="hue-primary bg-lc-95 text-lc-05 rounded-lg p-4">
  Near-text-color background with near-page-color text.
</div>

<!-- ── CHROMA FOR EMPHASIS ──────────────────────────────────
   Named chroma stops: lo, mlo, mid, mhi, hi.
   Backgrounds default to lo. Bump up for emphasis. -->

<div class="hue-danger bg-lc-1 chroma-mid text-lc-fore border border-lc-3 rounded-lg p-4">
  Danger alert — chroma-mid makes it feel more urgent.
</div>

<!-- ── RELATIVE LUMINANCE BUMPS ────────────────────────────
   bg-lc-up-1 / bg-lc-down-1 — shift relative to parent.
   Perfect for hover states. -->

<button class="hue-primary bg-lc-5 chroma-mhi text-lc-0
  hover:bg-lc-up-1 active:bg-lc-down-1">
  Hover brightens, press darkens
</button>

<!-- ── ARBITRARY VALUES (escape hatch) ─────────────────────
   When named stops aren't precise enough. -->

<div class="hue-[180] chroma-[15] bg-lc-[22] text-lc-[88] rounded-lg p-4">
  Exact control. Auto-flips in dark mode.
</div>`,
	},
	how: {
		label: 'How It Works',
		lang: 'css',
		code: `/* ── WHAT THE UTILITIES ACTUALLY DO ──────────────────────────

   Every setter both updates its axis variable AND applies the
   resolved oklch() color. This is why a single bg-lc-5 works
   — the other two axes cascade from :root defaults. */

/* Named luminance utility (from index.css) */
.bg-lc-5 {
  --bg-l: var(--l-5);                    /* set the axis     */
  background-color: oklch(                /* apply the color  */
    var(--bg-l) var(--bg-c) var(--bg-h)
  );
}

/* Half-step — same pattern, finer granularity */
.bg-lc-05 {
  --bg-l: var(--l-05);                   /* 0.91 light, 0.16 dark */
  background-color: oklch(var(--bg-l) var(--bg-c) var(--bg-h));
}

/* Arbitrary luminance — auto-flips in dark mode */
.bg-lc-\\[80\\] {
  --bg-l: calc(0.8 + var(--lc-flip) * -0.6);
  background-color: oklch(var(--bg-l) var(--bg-c) var(--bg-h));
}

/* Global hue — sets ALL hue properties at once */
.hue-primary {
  --bg-h: var(--hue-primary);
  --tx-h: var(--hue-primary);
  --bd-h: var(--hue-primary);
  /* ...and gradient, shadow, accent, etc. */
}

/* ── PER-PROPERTY CHROMA DEFAULTS ──────────────────────────

   The :root sets sensible chroma per property type:
     --bg-c: 0.02  (lo)   backgrounds are subtle
     --tx-c: 0.02  (lo)   text is readable
     --bd-c: 0.06  (mlo)  borders are visible
     --ac-c: 0.18  (mhi)  accents stand out

   So bg-lc-5 is already a valid, nice-looking color.
   You only set chroma when you want MORE than the default. */

/* ── THE LUMINANCE SCALE ────────────────────────────────────

   15 stops with half-steps at the extremes:

   0  05  1  15  2   3   4   5   6   7   8  85  9  95  10
   ╰──── 0.04 ────╯   ╰── 0.08 ──╯   ╰──── 0.04 ────╯

   Dense at the edges where subtle differences matter most
   (card backgrounds, near-text elements). Coarser in the
   middle where the eye is more forgiving.

   The direction flips in dark mode:
   Light: 0→0.95, 05→0.91, ... 10→0.15
   Dark:  0→0.12, 05→0.16, ... 10→0.92 */`,
	},
	arbitrary: {
		label: 'Arbitrary Values',
		lang: 'html',
		code: `<!-- ── WHEN NAMED STOPS AREN'T ENOUGH ─────────────────────
   Bracket syntax for all three axes. Integer scales:
   hue 0–360, chroma 0–100, luminance 0–100. -->

<!-- Arbitrary hue + chroma -->
<div class="hue-[180] chroma-[12]">
  <div class="bg-lc-1 text-lc-fore">
    Teal card — hue 180°, chroma 0.12
  </div>
</div>

<!-- Per-property arbitrary values -->
<div class="bg-h-[280] bg-c-[20] bg-lc-5">
  Purple background — hue 280°, chroma 0.20
</div>

<!-- ── AUTO-FLIP LUMINANCE ───────────────────────────────
   bg-lc-[N] auto-flips for dark mode.
   bg-lc-[80] → L=0.80 in light, L=0.20 in dark. -->

<div class="hue-[180] chroma-[12]">
  <div class="bg-lc-[15] text-lc-[90]">Near-page bg, high-contrast text</div>
  <span class="bg-lc-[30]">Subtle chip</span>
  <span class="bg-lc-[50]">Mid-range chip</span>
  <span class="bg-lc-[70]">Prominent chip</span>
</div>

<!-- ── MIXING NAMED + ARBITRARY ─────────────────────────
   Named stops for quick work, brackets for precision.
   Mix freely — they're the same underlying system. -->

<div class="hue-danger chroma-mid">
  <div class="bg-lc-1 text-lc-fore border border-lc-3">
    Named stops everywhere
  </div>
  <button class="bg-lc-[42] chroma-[22] text-lc-0">
    Precise button that doesn't hit a named stop
  </button>
</div>

<!-- ── WHEN TO USE WHAT ─────────────────────────────────
   Named scale (bg-lc-3):     90% of the time
   Half-steps (bg-lc-05):     subtle near-page elements
   Arbitrary (bg-lc-[42]):    when no named stop fits
   Relative (bg-lc-up-1):     hover/focus states -->`,
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
