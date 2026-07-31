import { useEffect, useRef, useState } from 'react'

type Snippet = { name: string; markup: string; body: string; css: string }

const LS_KEY = 'twok-repl-v2'
const DEFAULT_BODY = 'bg-lum-1 text-con-mhigh'

type Component = { name: string; markup: string }

// grab a class="…" (or class='…') value out of an attribute string.
const CLASS_ATTR = /class\s*=\s*"([^"]*)"|class\s*=\s*'([^']*)'/

// Merge classes from an invocation (<BigButton class="hue-info" />) onto the
// component's top-level element — appended to its existing class list, or added if
// it has none. If a component has more than one top-level element only the first
// gets them; that's on the author.
function mergeClass(markup: string, classes: string): string {
	if (!classes) return markup
	return markup.replace(/<([a-zA-Z][\w-]*)((?:\s[^>]*?)?)(\/?)>/, (m, tag, attrs, selfClose) => {
		const cls = CLASS_ATTR.exec(attrs)
		if (!cls) return `<${tag}${attrs} class="${classes}"${selfClose}>`
		const q = cls[1] != null ? '"' : "'"
		const existing = cls[1] ?? cls[2] ?? ''
		return `<${tag}${attrs.replace(cls[0], `class=${q}${(existing + ' ' + classes).trim()}${q}`)}${selfClose}>`
	})
}

// Expand stored components referenced in the scene markup. One form, React-style:
//   <BigButton />                    — a self-closing PascalCase tag.
//   <BigButton class="hue-info" />   — classes land on the component's top element.
// The name IS the key: <BigButton /> looks up a component saved as "BigButton",
// verbatim — no case/punctuation munging. The uppercase first letter is what
// separates a component from real markup: lowercase tags (<div/>, <circle/>,
// <my-web-component/>) are never matched, so real self-closing HTML/SVG passes
// straight through. Attributes other than `class` are ignored. Only names present
// in the store are replaced; re-runs so components nest, depth-capped so a
// self-reference can't hang.
function expandComponents(src: string, components: Component[], depth = 0): string {
	if (!components.length || depth > 10) return src
	const map = new Map(components.map((c) => [c.name, c.markup]))
	let changed = false
	const out = src.replace(/<([A-Z][A-Za-z0-9]*)((?:\s[^<>]*?)?)\/>/g, (m, name, attrs) => {
		const v = map.get(name)
		if (v == null) return m
		changed = true
		const cls = CLASS_ATTR.exec(attrs || '')
		return cls ? mergeClass(v, cls[1] ?? cls[2] ?? '') : v
	})
	return changed ? expandComponents(out, components, depth + 1) : out
}

// Seed component so the feature works out of the box. Uses lib classes that react
// to the surrounding mood (con + lum-up), so the same button reads differently on
// each surface it's dropped into.
const DEFAULT_COMPONENTS: Component[] = [
	{
		name: 'BigButton',
		markup: `<button class="bg-lum-up-2 hover:bg-lum-up-3 border-con-2 text-con-high rounded-lg border px-4 py-2 font-semibold transition-colors">
  Big Button
</button>`,
	},
]

const PRESETS: Snippet[] = [
	{
		name: '[1. showcase]: an upgrade card, mood down the tree',
		body: 'bg-lum-none',
		css: '',
		markup: `<section class="hue-primary chroma-mid contrast-mid bg-lum-1 mx-auto max-w-md space-y-4 rounded-xl border border-con-2 p-6">
  <header class="space-y-1">
    <p class="text-con-mlow text-xs font-semibold uppercase tracking-wide">Current plan</p>
    <h1 class="text-con-high text-2xl font-bold">Starter</h1>
    <p class="text-con-mid text-sm">Everything you need to get going, with room to grow.</p>
  </header>

  <div class="bg-lum-2 space-y-2 rounded-lg p-4">
    <div class="flex items-baseline justify-between">
      <span class="text-con-high text-lg font-semibold">$12</span>
      <span class="text-con-mlow text-xs">/ month</span>
    </div>
    <ul class="text-con-mid space-y-1 text-sm">
      <li>10 projects</li>
      <li>Unlimited collaborators</li>
      <li>Email support</li>
    </ul>
  </div>

  <aside class="hue-success chroma-mhigh bg-lum-2 space-y-1 rounded-lg border border-con-1 p-4">
    <p class="text-con-high text-sm font-semibold">Upgrade to Pro</p>
    <p class="text-con-mid text-xs">Analytics, priority support, and custom domains.</p>
    <button class="bg-lum-6 hover:bg-lum-7 text-con-max chroma-high mt-2 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors">Upgrade — $29/mo</button>
  </aside>

  <footer class="flex items-center justify-between">
    <button class="text-con-mid hover:text-con-high text-sm transition-colors">Manage billing</button>
    <button class="text-con-high border-con-2 hover:bg-lum-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors">Cancel plan</button>
  </footer>
</section>`,
	},
	{
		name: '[2. standard]: mood on a wrapper',
		body: DEFAULT_BODY,
		css: '',
		markup: `<div class="hue-danger chroma-mid bg-lum-2 border-lum-4 flex gap-3 rounded border p-4">
  <div class="bg-lum-1 size-10 shrink-0 rounded-2xl border"></div>
  <div>
    <p class="text-con-mhigh font-bold">Something went wrong</p>
    <p class="text-con-mid text-sm">painted text picks up the mood; bare text would not</p>
  </div>
</div>`,
	},
	{
		name: '[3. standard]: contrast against any surface',
		body: DEFAULT_BODY,
		css: '',
		markup: `<div class="bg-lum-2 space-y-1 rounded p-4">
  <p class="text-con-high">con-high</p>
  <p class="text-con-mid">con-mid</p>
  <p class="text-con-low">con-low</p>
  <div class="bg-lum-8 mt-3 rounded p-3">
    <p class="text-con-high">same classes, dark surface — con auto-flips</p>
  </div>
</div>`,
	},
	{
		name: '[4. standard]: contrast as a mood',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="space-y-3">
  <div class="contrast-low bg-lum-2 rounded border border-con p-3">
    <p class="text-con font-bold">contrast-low</p>
    <p class="text-con text-sm">text a little off the surface; border barely there</p>
  </div>
  <div class="contrast-mid bg-lum-2 rounded border border-con p-3">
    <p class="text-con font-bold">contrast-mid</p>
    <p class="text-con text-sm">text mid; border a touch stronger</p>
  </div>
  <div class="contrast-high bg-lum-2 rounded border border-con p-3">
    <p class="text-con font-bold">contrast-high</p>
    <p class="text-con text-sm">text high; border clearly visible</p>
  </div>
</div>`,
	},
	{
		name: '[5. standard]: two contrast ramps',
		body: 'bg-lum-3 text-con-mid',
		css: '',
		markup: `<div class="space-y-4">
  <div class="space-y-1">
    <p class="text-xs font-bold uppercase tracking-wide">named ramp — text</p>
    <p class="text-con-low">text-con-low</p>
    <p class="text-con-mid">text-con-mid</p>
    <p class="text-con-high">text-con-high</p>
  </div>
  <div class="space-y-1">
    <p class="text-xs font-bold uppercase tracking-wide">numbered ramp — decorative bumps</p>
    <div class="flex gap-2">
      <div class="border-con-1 grid size-14 place-items-center rounded border-2 text-xs">con-1</div>
      <div class="border-con-2 grid size-14 place-items-center rounded border-2 text-xs">con-2</div>
      <div class="border-con-3 grid size-14 place-items-center rounded border-2 text-xs">con-3</div>
      <div class="border-con-low grid size-14 place-items-center rounded border-2 text-xs">con-low</div>
    </div>
  </div>
</div>`,
	},
	{
		name: '[6. standard]: compose con + chroma',
		body: DEFAULT_BODY,
		css: '',
		markup: `<div class="space-y-2">
  <p class="text-con-mid">text-con-mid — contrast against the surface, mood chroma</p>
  <p class="text-con-mid chroma-max">text-con-mid + chroma-max — same contrast, louder colour</p>
  <p class="text-con-mid chroma-low">text-con-mid + chroma-low — same contrast, near-grey</p>
</div>`,
	},
	{
		name: '[7. standard]: SVG fill & stroke',
		body: 'bg-lum-1 text-con-mhigh hue-primary',
		css: '',
		markup: `<div class="flex items-center gap-5 text-con-high chroma-high">
  <svg viewBox="0 0 24 24" class="size-10 fill-current"><circle cx="12" cy="12" r="10"/></svg>
  <svg viewBox="0 0 24 24" class="size-10 fill-hue-info fill-chroma-high"><circle cx="12" cy="12" r="10"/></svg>
  <svg viewBox="0 0 24 24" class="size-10 fill-none stroke-con-mid stroke-2"><circle cx="12" cy="12" r="9"/></svg>
  <svg viewBox="0 0 24 24" class="size-10 fill-lum-6 stroke-con-1 stroke-2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
</div>
<p class="mt-3 text-con-mid text-sm">
  1 · fill-current follows the text colour &nbsp; 2 · fill-hue-info is independent &nbsp;
  3 · stroke-con-mid off the surface &nbsp; 4 · fill-lum-6 + stroke-con-1 bump
</p>`,
	},
	{
		name: '[8. standard]: a component across moods',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="flex flex-col gap-y-6">
  <div>
    <BigButton />
  </div>
  <div class="hue-danger chroma-mhigh">
    <BigButton />
  </div>
  <div>
    <BigButton class="hue-info chroma-mhigh" />
  </div>
</div>`,
	},
	{
		name: '[9. standard]: light / dark islands nest',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="bg-lum-2 space-y-2 rounded p-4">
  <p class="text-con-mid">light page — bg-lum-2, low numbers hug the page</p>
  <div class="dark bg-lum-2 space-y-2 rounded p-4">
    <p class="text-con-mid">.dark island — same class names, flipped scale</p>
    <div class="light bg-lum-2 rounded p-3">
      <p class="text-con-mid">.light island inside the .dark one — flipped back</p>
    </div>
  </div>
</div>`,
	},
	{
		name: '[10. standard]: .flip by context',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="bg-lum-2 space-y-2 rounded p-4">
  <p class="text-con-mid">page scale</p>
  <div class="flip bg-lum-2 space-y-2 rounded p-4">
    <p class="text-con-mid">.flip → opposite of the page</p>
    <div class="flip bg-lum-2 space-y-2 rounded p-4">
      <p class="text-con-mid">.flip again → back</p>
      <div class="flip bg-lum-2 rounded p-3">
        <p class="text-con-mid">…and again. same class every level, no light/dark named.</p>
      </div>
    </div>
  </div>
</div>`,
	},
	{
		name: '[11. standard]: repaint all text + borders (one rule)',
		body: 'bg-lum-1 text-con-mhigh',
		css: `/* Opt every element into repainting its text and border from the current
   mood. Costs a little computation, but text (color) and border (currentColor)
   are the two colours that otherwise keep their LAST-painted value — so one rule
   keeps them tracking the mood everywhere, with no per-element con classes. */
* { @apply text-con border-con; }`,
		markup: `<div class="space-y-3">
  <div class="contrast-mid bg-lum-2 rounded border p-3">
    <p class="font-bold">contrast-mid — no con classes on these lines</p>
    <p class="text-sm">text and border are both painted by the * rule</p>
  </div>
  <div class="hue-danger contrast-high bg-lum-2 rounded border p-3">
    <p class="font-bold">hue-danger + contrast-high</p>
    <p class="text-sm">same markup, different mood — it repaints into it</p>
  </div>
</div>`,
	},
	{
		name: '[12. edge case]: a new mood paints nothing by itself',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="hue-warning bg-lum-2 rounded border border-con-2 p-4">
  <p>hue-warning is set on this box, but this line never repaints — it keeps the colour it inherited from the page, not the warning hue.</p>
</div>`,
	},
	{
		name: '[12. the fix]: paint, and the mood shows',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="hue-warning bg-lum-2 rounded border border-con-2 p-4">
  <p class="text-con-mid">same mood — but this line paints (text-con-mid), so it picks up hue-warning.</p>
</div>`,
	},
	{
		name: '[13. edge case]: text-hue snaps to absolute L',
		body: 'bg-lum-8 text-con-high',
		css: '',
		markup: `<div class="space-y-2">
  <p>baseline — text-con-high on this dark surface paints light, readable text.</p>
  <p class="text-hue-danger">text-hue-danger repaints at the ABSOLUTE --tx-l (dark) — barely readable on the dark surface.</p>
</div>`,
	},
	{
		name: '[13. the fix]: change hue through the mood',
		body: 'bg-lum-8 text-con-high',
		css: '',
		markup: `<div class="hue-danger space-y-2">
  <p class="text-con-high">hue-danger on the wrapper + text-con-high here — the danger hue at the contrast luminance ✓</p>
</div>`,
	},
]

// Site theme: lift dark surfaces off pure black — the numbered dark stops start at
// ~.30 instead of the library default (.185). This is a THEME override, not a
// library change: the library keeps its near-black default; this is what's active
// on the demo site + REPL. (Derived from the same ramp with near = .30.)
const THEME_CSS = `.dark {
  --lum-1: .3; --lum-2: .379; --lum-3: .459; --lum-4: .543; --lum-5: .629;
  --lum-6: .713; --lum-7: .788; --lum-8: .85; --lum-9: .895; --lum-10: .92;
  --con-flip: .671;
}`

function buildDoc(libCss: string, css: string, markup: string, body: string, dark: boolean, components: Component[]) {
	const scene = expandComponents(markup, components)
	return `<!doctype html><html class="${dark ? 'dark' : ''}"><head><meta charset="utf-8">
<script>
(function () {
  function show(msg) {
    var d = document.getElementById('__err');
    if (!d) {
      d = document.createElement('div'); d.id = '__err';
      d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:45%;overflow:auto;margin:0;padding:8px 12px;font:12px/1.5 ui-monospace,monospace;background:#7f1d1d;color:#fff;white-space:pre-wrap;z-index:99999';
      (document.body || document.documentElement).appendChild(d);
    }
    d.textContent += msg + '\\n';
  }
  addEventListener('error', function (e) { show('⚠ ' + (e.message || e.error || e)); });
  addEventListener('unhandledrejection', function (e) { show('⚠ ' + ((e.reason && e.reason.message) || e.reason || e)); });
  var ce = console.error; console.error = function () { show(Array.prototype.map.call(arguments, String).join(' ')); ce.apply(console, arguments); };
})();
</script>
<script src="/tw-browser.js"></script>
<style type="text/tailwindcss">
@import "tailwindcss";
@custom-variant dark (&:is(.dark, .dark *));
${libCss}
${THEME_CSS}
${css}
</style>
<style>*{box-sizing:border-box}html,body{margin:0}body{padding:1.5rem;font-family:ui-sans-serif,system-ui,sans-serif}</style>
</head><body class="${body}">
${scene}
</body></html>`
}

type Persisted = { markup: string; body: string; css: string; dark: boolean; snippets: Snippet[]; components: Component[] }

function loadState(): Persisted {
	try {
		const raw = localStorage.getItem(LS_KEY)
		if (raw) {
			const p = JSON.parse(raw) as Partial<Persisted>
			return {
				markup: p.markup ?? PRESETS[0].markup,
				body: p.body ?? DEFAULT_BODY,
				css: p.css ?? '',
				dark: !!p.dark,
				snippets: (Array.isArray(p.snippets) ? p.snippets : []).map((s) => ({ ...s, css: s.css ?? '' })),
				// undefined (older saved state) seeds the default; an explicit [] is respected.
				components: Array.isArray(p.components)
					? p.components.map((c) => ({ name: c.name, markup: c.markup ?? '' }))
					: DEFAULT_COMPONENTS,
			}
		}
	} catch {
		/* ignore */
	}
	return { markup: PRESETS[0].markup, body: PRESETS[0].body, css: '', dark: false, snippets: [], components: DEFAULT_COMPONENTS }
}

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export default function Repl({ libCss }: { libCss: string }) {
	const [markup, setMarkup] = useState('')
	const [body, setBody] = useState(DEFAULT_BODY)
	const [css, setCss] = useState('')
	const [dark, setDark] = useState(false)
	const [snippets, setSnippets] = useState<Snippet[]>([])
	const [snipName, setSnipName] = useState('')
	const [components, setComponents] = useState<Component[]>([])
	const [compName, setCompName] = useState('')
	const [compMarkup, setCompMarkup] = useState('')
	const [hydrated, setHydrated] = useState(false)
	const iframeRef = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		const p = loadState()
		setMarkup(p.markup)
		setBody(p.body)
		setCss(p.css)
		setDark(p.dark)
		setSnippets(p.snippets)
		setComponents(p.components)
		setHydrated(true)
	}, [])

	useEffect(() => {
		if (!hydrated) return
		localStorage.setItem(LS_KEY, JSON.stringify({ markup, body, css, dark, snippets, components }))
	}, [hydrated, markup, body, css, dark, snippets, components])

	// debounced re-render into the isolated preview
	useEffect(() => {
		if (!hydrated) return
		const id = window.setTimeout(() => {
			const f = iframeRef.current
			if (f) f.srcdoc = buildDoc(libCss, css, markup, body, dark, components)
		}, 300)
		return () => window.clearTimeout(id)
	}, [hydrated, markup, body, css, dark, libCss, components])

	function apply(s: Snippet) {
		setMarkup(s.markup)
		setBody(s.body ?? DEFAULT_BODY)
		setCss(s.css ?? '')
	}
	function saveSnippet() {
		const name = snipName.trim() || `snippet ${snippets.length + 1}`
		setSnippets((prev) => [{ name, markup, body, css }, ...prev.filter((s) => s.name !== name)])
		setSnipName(name) // keep the name so the next save updates this same entry
	}
	function deleteSnippet(name: string) {
		setSnippets((prev) => prev.filter((s) => s.name !== name))
	}

	// ── components: the second save-point — reusable markup expanded into the scene
	function saveComponent() {
		const name = compName.trim()
		if (!name) return
		setComponents((prev) => [{ name, markup: compMarkup }, ...prev.filter((c) => c.name !== name)])
	}
	function editComponent(c: Component) {
		setCompName(c.name)
		setCompMarkup(c.markup)
	}
	function deleteComponent(name: string) {
		setComponents((prev) => prev.filter((c) => c.name !== name))
	}
	function insertComponent(c: Component) {
		setMarkup((m) => `${m.replace(/\s*$/, '')}\n<${c.name} />\n`)
	}

	const btn: React.CSSProperties = {
		font: '500 0.8rem/1 ui-sans-serif,system-ui,sans-serif',
		padding: '0.4rem 0.7rem',
		borderRadius: 8,
		border: '1px solid var(--line)',
		background: 'var(--chip)',
		color: 'var(--ink)',
		cursor: 'pointer',
	}
	const chip: React.CSSProperties = {
		...btn,
		fontFamily: mono,
		fontSize: '0.72rem',
		textAlign: 'left',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
		width: '100%',
	}
	const field: React.CSSProperties = {
		fontFamily: mono,
		fontSize: '0.78rem',
		lineHeight: 1.55,
		padding: '0.75rem 0.85rem',
		borderRadius: 10,
		border: '1px solid var(--line)',
		background: 'var(--page)',
		color: 'var(--ink)',
		resize: 'vertical',
		tabSize: 2,
	}
	const label: React.CSSProperties = { fontSize: '0.78rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 4 }
	const heading: React.CSSProperties = { fontSize: '0.68rem', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.08em' }

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
			<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
				<h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>REPL</h1>
				<p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
					Live-compiled with <code style={{ fontFamily: mono }}>@tailwindcss/browser</code> against the real library
					CSS. Edits autosave &amp; survive refresh.
				</p>
			</div>

			<div
				style={{
					display: 'grid',
					gap: '1rem',
					gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
					marginTop: '1.25rem',
					alignItems: 'start',
				}}
			>
				{/* ── controls ── */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
						<button type="button" style={btn} onClick={() => setDark((d) => !d)}>
							{dark ? '☾ preview: dark' : '☀ preview: light'}
						</button>
						<button type="button" style={btn} onClick={() => apply(PRESETS[0])}>
							reset
						</button>
					</div>

					<label style={label}>
						<span>
							preview <code style={{ fontFamily: mono }}>&lt;body&gt;</code> classes{' '}
							<span className="muted" style={{ fontWeight: 400 }}>— the page surface + default text paint</span>
						</span>
						<input value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false} style={{ ...field, resize: 'none' }} />
					</label>

					<label style={label}>
						markup
						<textarea value={markup} onChange={(e) => setMarkup(e.target.value)} spellCheck={false} rows={13} style={field} />
					</label>

					<label style={label}>
						<span>
							CSS <span className="muted" style={{ fontWeight: 400 }}>— injected where your <code style={{ fontFamily: mono }}>index.css</code> would go (<code style={{ fontFamily: mono }}>@apply</code>, custom rules)</span>
						</span>
						<textarea value={css} onChange={(e) => setCss(e.target.value)} spellCheck={false} rows={7} style={field} placeholder="p { @apply text-con-mid text-chroma-high; }" />
					</label>

					<div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--line)', paddingTop: '0.85rem' }}>
						<input
							value={snipName}
							onChange={(e) => setSnipName(e.target.value)}
							placeholder="name this scene…"
							style={{ ...field, flex: 1, resize: 'none', fontFamily: 'inherit', fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
						/>
						<button type="button" style={btn} onClick={saveSnippet}>
							{snippets.some((s) => s.name === snipName.trim()) ? 'update scene' : 'save scene'}
						</button>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						<div className="muted" style={heading}>presets</div>
						{PRESETS.map((s) => (
							<button key={s.name} type="button" style={chip} onClick={() => apply(s)}>
								<span>{s.name}</span>
							</button>
						))}
						{snippets.length > 0 && (
							<div className="muted" style={{ ...heading, marginTop: 6 }}>saved</div>
						)}
						{snippets.map((s) => (
							<div key={s.name} style={{ ...chip, cursor: 'default' }}>
								<button type="button" onClick={() => { apply(s); setSnipName(s.name) }} style={{ all: 'unset', cursor: 'pointer', flex: 1, fontFamily: mono, fontSize: '0.72rem' }}>
									{s.name}
								</button>
								<button type="button" aria-label={`delete ${s.name}`} onClick={() => deleteSnippet(s.name)} style={{ all: 'unset', cursor: 'pointer', opacity: 0.6, padding: '0 4px' }}>
									✕
								</button>
							</div>
						))}
					</div>

					{/* ── components: reusable markup expanded into the scene by name ── */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line)', paddingTop: '0.85rem' }}>
						<div className="muted" style={heading}>components</div>
						<p className="muted" style={{ fontSize: '0.72rem', margin: '0 0 2px', lineHeight: 1.5 }}>
							reusable markup macros, always a self-closing PascalCase tag like <code style={{ fontFamily: mono }}>&lt;BigButton /&gt;</code>.
							you can nest one inside another, but they don't take <code style={{ fontFamily: mono }}>{'{children}'}</code> and the only prop they accept is a class.
						</p>
						<input
							value={compName}
							onChange={(e) => setCompName(e.target.value)}
							placeholder="component name, PascalCase (e.g. BigButton)"
							spellCheck={false}
							style={{ ...field, resize: 'none', fontFamily: mono, fontSize: '0.76rem', padding: '0.45rem 0.6rem' }}
						/>
						<textarea
							value={compMarkup}
							onChange={(e) => setCompMarkup(e.target.value)}
							placeholder={'<button class="bg-lum-up-2 border-con-2 text-con-high …">…</button>'}
							spellCheck={false}
							rows={5}
							style={field}
						/>
						<div style={{ display: 'flex', gap: 8 }}>
							<button type="button" style={btn} onClick={saveComponent}>
								save component
							</button>
							<button type="button" style={btn} onClick={() => { setCompName(''); setCompMarkup('') }}>
								new
							</button>
						</div>
						{components.map((c) => (
							<div key={c.name} style={{ ...chip, cursor: 'default' }}>
								<button type="button" onClick={() => editComponent(c)} style={{ all: 'unset', cursor: 'pointer', flex: 1, fontFamily: mono, fontSize: '0.72rem' }}>
									{c.name}
								</button>
								<button type="button" title="insert into scene" aria-label={`insert ${c.name}`} onClick={() => insertComponent(c)} style={{ all: 'unset', cursor: 'pointer', opacity: 0.6, padding: '0 6px' }}>
									＋
								</button>
								<button type="button" aria-label={`delete ${c.name}`} onClick={() => deleteComponent(c.name)} style={{ all: 'unset', cursor: 'pointer', opacity: 0.6, padding: '0 4px' }}>
									✕
								</button>
							</div>
						))}
					</div>
				</div>

				{/* ── preview ── */}
				<div style={{ position: 'sticky', top: '1rem', minWidth: 0 }}>
					<div className="muted" style={{ ...heading, marginBottom: 6 }}>preview</div>
					<iframe
						ref={iframeRef}
						title="preview"
						style={{ width: '100%', height: 560, border: '1px solid var(--line)', borderRadius: 12, background: '#fff' }}
					/>
				</div>
			</div>
		</div>
	)
}
