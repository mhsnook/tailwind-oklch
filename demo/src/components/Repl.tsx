import { useEffect, useRef, useState } from 'react'

type Snippet = { name: string; markup: string; body: string }

const LS_KEY = 'twok-repl-v1'
const DEFAULT_BODY = 'bg-lum-1 text-con-mhigh'

const PRESETS: Snippet[] = [
	{
		name: 'Callout — mood on wrapper',
		body: DEFAULT_BODY,
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
		markup: `<div class="space-y-2">
  <p class="text-con-mid text-chroma-max">text-con-mid text-chroma-max  (0.7: chroma wins, near-black)</p>
  <p class="text-con-mid chroma-max">text-con-mid + bare chroma-max seeder  (composes)</p>
</div>`,
	},
	{
		name: 'Surfaces — contrast flips',
		body: DEFAULT_BODY,
		markup: `<div class="bg-lum-2 space-y-1 rounded p-4">
  <p class="text-con-high">con-high</p>
  <p class="text-con-mid">con-mid</p>
  <p class="text-con-low">con-low</p>
  <div class="bg-lum-8 mt-3 rounded p-3">
    <p class="text-con-high">same classes, dark surface — con auto-flips</p>
  </div>
</div>`,
	},
]

function buildDoc(libCss: string, markup: string, body: string, dark: boolean) {
	return `<!doctype html><html class="${dark ? 'dark' : ''}"><head><meta charset="utf-8">
<script src="/tw-browser.js"></script>
<style type="text/tailwindcss">
@import "tailwindcss";
@custom-variant dark (&:is(.dark, .dark *));
${libCss}
</style>
<style>*{box-sizing:border-box}html,body{margin:0}body{padding:1.5rem;font-family:ui-sans-serif,system-ui,sans-serif}</style>
</head><body class="${body}">
${markup}
</body></html>`
}

type Persisted = { markup: string; body: string; dark: boolean; snippets: Snippet[] }

function loadState(): Persisted {
	try {
		const raw = localStorage.getItem(LS_KEY)
		if (raw) return JSON.parse(raw) as Persisted
	} catch {
		/* ignore */
	}
	return { markup: PRESETS[0].markup, body: PRESETS[0].body, dark: false, snippets: [] }
}

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export default function Repl({ libCss }: { libCss: string }) {
	const [markup, setMarkup] = useState('')
	const [body, setBody] = useState(DEFAULT_BODY)
	const [dark, setDark] = useState(false)
	const [snippets, setSnippets] = useState<Snippet[]>([])
	const [snipName, setSnipName] = useState('')
	const [hydrated, setHydrated] = useState(false)
	const iframeRef = useRef<HTMLIFrameElement>(null)

	// hydrate once from localStorage
	useEffect(() => {
		const p = loadState()
		setMarkup(p.markup)
		setBody(p.body ?? DEFAULT_BODY)
		setDark(!!p.dark)
		setSnippets(Array.isArray(p.snippets) ? p.snippets : [])
		setHydrated(true)
	}, [])

	// persist on any change
	useEffect(() => {
		if (!hydrated) return
		localStorage.setItem(LS_KEY, JSON.stringify({ markup, body, dark, snippets }))
	}, [hydrated, markup, body, dark, snippets])

	// debounced re-render into the isolated preview
	useEffect(() => {
		if (!hydrated) return
		const id = window.setTimeout(() => {
			const f = iframeRef.current
			if (f) f.srcdoc = buildDoc(libCss, markup, body, dark)
		}, 300)
		return () => window.clearTimeout(id)
	}, [hydrated, markup, body, dark, libCss])

	function apply(s: Snippet) {
		setMarkup(s.markup)
		setBody(s.body ?? DEFAULT_BODY)
	}
	function saveSnippet() {
		const name = snipName.trim() || `snippet ${snippets.length + 1}`
		setSnippets((prev) => [{ name, markup, body }, ...prev.filter((s) => s.name !== name)])
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

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
			<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
				<h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
					REPL
				</h1>
				<p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
					Live-compiled with <code style={{ fontFamily: mono }}>@tailwindcss/browser</code> against the real
					library CSS. Edits autosave &amp; survive refresh.
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

					<label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 4 }}>
						<span>
							preview <code style={{ fontFamily: mono }}>&lt;body&gt;</code> classes{' '}
							<span className="muted" style={{ fontWeight: 400 }}>— the page surface + default text paint</span>
						</span>
						<input
							value={body}
							onChange={(e) => setBody(e.target.value)}
							spellCheck={false}
							style={{
								fontFamily: mono,
								fontSize: '0.78rem',
								padding: '0.5rem 0.6rem',
								borderRadius: 8,
								border: '1px solid var(--line)',
								background: 'var(--page)',
								color: 'var(--ink)',
							}}
						/>
					</label>

					<label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 4 }}>
						markup
						<textarea
							value={markup}
							onChange={(e) => setMarkup(e.target.value)}
							spellCheck={false}
							rows={16}
							style={{
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
							}}
						/>
					</label>

					<div style={{ display: 'flex', gap: 8 }}>
						<input
							value={snipName}
							onChange={(e) => setSnipName(e.target.value)}
							placeholder="name this example…"
							style={{
								flex: 1,
								fontSize: '0.8rem',
								padding: '0.45rem 0.6rem',
								borderRadius: 8,
								border: '1px solid var(--line)',
								background: 'var(--page)',
								color: 'var(--ink)',
							}}
						/>
						<button type="button" style={btn} onClick={saveSnippet}>
							save
						</button>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						<div className="muted" style={{ fontSize: '0.68rem', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
							presets
						</div>
						{PRESETS.map((s) => (
							<button key={s.name} type="button" style={chip} onClick={() => apply(s)}>
								<span>{s.name}</span>
							</button>
						))}
						{snippets.length > 0 && (
							<div className="muted" style={{ fontSize: '0.68rem', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>
								saved
							</div>
						)}
						{snippets.map((s) => (
							<div key={s.name} style={{ ...chip, cursor: 'default' }}>
								<button
									type="button"
									onClick={() => apply(s)}
									style={{ all: 'unset', cursor: 'pointer', flex: 1, fontFamily: mono, fontSize: '0.72rem' }}
								>
									{s.name}
								</button>
								<button
									type="button"
									aria-label={`delete ${s.name}`}
									onClick={() => deleteSnippet(s.name)}
									style={{ all: 'unset', cursor: 'pointer', opacity: 0.6, padding: '0 4px' }}
								>
									✕
								</button>
							</div>
						))}
					</div>
				</div>

				{/* ── preview ── */}
				<div style={{ position: 'sticky', top: '1rem', minWidth: 0 }}>
					<div className="muted" style={{ fontSize: '0.68rem', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
						preview
					</div>
					<iframe
						ref={iframeRef}
						title="preview"
						style={{
							width: '100%',
							height: 520,
							border: '1px solid var(--line)',
							borderRadius: 12,
							background: '#fff',
						}}
					/>
				</div>
			</div>
		</div>
	)
}
