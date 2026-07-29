import { useEffect, useRef, useState } from 'react'

type Snippet = { name: string; markup: string; body: string; css: string }

const LS_KEY = 'twok-repl-v1'
const DEFAULT_BODY = 'bg-lum-1 text-con-mhigh'

const PRESETS: Snippet[] = [
	{
		name: 'Callout — mood on wrapper',
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
		name: 'Composition — con + chroma',
		body: DEFAULT_BODY,
		css: '',
		markup: `<div class="space-y-2">
  <p class="text-con-mid text-chroma-max">text-con-mid text-chroma-max  (0.7: chroma wins, near-black)</p>
  <p class="text-con-mid chroma-max">text-con-mid + bare chroma-max seeder  (composes)</p>
</div>`,
	},
	{
		name: 'Surfaces — contrast flips',
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
		name: 'CSS — p { @apply … }',
		body: DEFAULT_BODY,
		css: `/* injected where your stylesheet's @apply rules would live.
   every <p> now PAINTS (vs. inheriting) — compare with a bare mood. */
p { @apply text-con-mid text-chroma-high; }
h2 { @apply text-con-max; }
.danger { @apply hue-danger; }`,
		markup: `<h2>A heading</h2>
<p>First paragraph — coloured by the rule, no class on it.</p>
<p>Second paragraph, same.</p>
<div class="danger">
  <h2>Danger region</h2>
  <p>the .danger rule set the mood; these repaint into it.</p>
</div>`,
	},
	{
		name: 'Contrast mood — fans out per property',
		body: 'bg-lum-1 text-con-mhigh',
		css: `/* every element paints from the inherited contrast-* mood.
   text and borders pick DIFFERENT steps from one profile. */
* { @apply text-con border-con; }`,
		markup: `<div class="space-y-3">
  <div class="contrast-low bg-lum-2 rounded border p-3">
    <p class="font-bold">contrast-low</p>
    <p class="text-sm">text a little off the surface; border barely there</p>
  </div>
  <div class="contrast-mid bg-lum-2 rounded border p-3">
    <p class="font-bold">contrast-mid</p>
    <p class="text-sm">text mid; border a touch stronger</p>
  </div>
  <div class="contrast-high bg-lum-2 rounded border p-3">
    <p class="font-bold">contrast-high</p>
    <p class="text-sm">text high; border clearly visible</p>
  </div>
</div>`,
	},
	{
		name: 'Two con ramps — named vs numbered',
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
		name: 'SVG — fill/stroke: ride text vs independent',
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
		name: 'Edge — text-hue snaps to absolute L',
		body: 'bg-lum-8 text-con-high',
		css: '',
		markup: `<div class="space-y-2">
  <p>baseline — text-con-high on a dark surface (con → light text)</p>
  <p class="text-hue-danger">+ text-hue-danger — snaps to the ABSOLUTE --tx-l (dark), not the con luminance</p>
  <p class="hue-danger text-con-high">+ hue-danger mood with text-con-high — hue at the contrast luminance ✓</p>
  <p class="text-con-high text-sm opacity-70">the fix: change hue via the hue-* mood, let the next text-con carry it</p>
</div>`,
	},
	{
		name: 'A mood is invisible until a paint',
		body: 'bg-lum-1 text-con-mhigh',
		css: '',
		markup: `<div class="grid grid-cols-2 gap-4">
  <div class="hue-warning bg-lum-2 rounded border p-3">
    <p>hue-warning here — this text never repaints, so it stays the inherited colour</p>
    <p class="text-con-mid">this one paints → picks up the warning hue</p>
  </div>
  <div class="bg-lum-2 rounded border p-3">
    <p>no mood — identical to the sibling's un-painted line</p>
    <p class="text-con-mid">painted, neutral</p>
  </div>
</div>`,
	},
]

function buildDoc(libCss: string, css: string, markup: string, body: string, dark: boolean) {
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
${css}
</style>
<style>*{box-sizing:border-box}html,body{margin:0}body{padding:1.5rem;font-family:ui-sans-serif,system-ui,sans-serif}</style>
</head><body class="${body}">
${markup}
</body></html>`
}

type Persisted = { markup: string; body: string; css: string; dark: boolean; snippets: Snippet[] }

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
			}
		}
	} catch {
		/* ignore */
	}
	return { markup: PRESETS[0].markup, body: PRESETS[0].body, css: '', dark: false, snippets: [] }
}

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export default function Repl({ libCss }: { libCss: string }) {
	const [markup, setMarkup] = useState('')
	const [body, setBody] = useState(DEFAULT_BODY)
	const [css, setCss] = useState('')
	const [dark, setDark] = useState(false)
	const [snippets, setSnippets] = useState<Snippet[]>([])
	const [snipName, setSnipName] = useState('')
	const [hydrated, setHydrated] = useState(false)
	const iframeRef = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		const p = loadState()
		setMarkup(p.markup)
		setBody(p.body)
		setCss(p.css)
		setDark(p.dark)
		setSnippets(p.snippets)
		setHydrated(true)
	}, [])

	useEffect(() => {
		if (!hydrated) return
		localStorage.setItem(LS_KEY, JSON.stringify({ markup, body, css, dark, snippets }))
	}, [hydrated, markup, body, css, dark, snippets])

	// debounced re-render into the isolated preview
	useEffect(() => {
		if (!hydrated) return
		const id = window.setTimeout(() => {
			const f = iframeRef.current
			if (f) f.srcdoc = buildDoc(libCss, css, markup, body, dark)
		}, 300)
		return () => window.clearTimeout(id)
	}, [hydrated, markup, body, css, dark, libCss])

	function apply(s: Snippet) {
		setMarkup(s.markup)
		setBody(s.body ?? DEFAULT_BODY)
		setCss(s.css ?? '')
	}
	function saveSnippet() {
		const name = snipName.trim() || `snippet ${snippets.length + 1}`
		setSnippets((prev) => [{ name, markup, body, css }, ...prev.filter((s) => s.name !== name)])
		setSnipName('')
	}
	function deleteSnippet(name: string) {
		setSnippets((prev) => prev.filter((s) => s.name !== name))
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

					<div style={{ display: 'flex', gap: 8 }}>
						<input
							value={snipName}
							onChange={(e) => setSnipName(e.target.value)}
							placeholder="name this example…"
							style={{ ...field, flex: 1, resize: 'none', fontFamily: 'inherit', fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
						/>
						<button type="button" style={btn} onClick={saveSnippet}>
							save
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
								<button type="button" onClick={() => apply(s)} style={{ all: 'unset', cursor: 'pointer', flex: 1, fontFamily: mono, fontSize: '0.72rem' }}>
									{s.name}
								</button>
								<button type="button" aria-label={`delete ${s.name}`} onClick={() => deleteSnippet(s.name)} style={{ all: 'unset', cursor: 'pointer', opacity: 0.6, padding: '0 4px' }}>
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
