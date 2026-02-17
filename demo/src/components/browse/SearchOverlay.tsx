import { useState, useRef, useEffect, useCallback } from 'react'

// ── Mock data ────────────────────────────────────────────────────────

const LANGUAGES = [
	{ id: 'ja', name: 'Japanese', flag: '🇯🇵' },
	{ id: 'ko', name: 'Korean', flag: '🇰🇷' },
	{ id: 'es', name: 'Spanish', flag: '🇪🇸' },
]

type Phrase = {
	id: string
	text: string
	translation: string
	langId: string
	status: 'learned' | 'learning' | 'new'
}

type Playlist = {
	id: string
	name: string
	count: number
	langId: string
}

type Request = {
	id: string
	text: string
	langId: string
	votes: number
}

const PHRASES: Phrase[] = [
	{ id: '1', text: 'No hay de qué', translation: "You're welcome (it's nothing)", langId: 'es', status: 'learned' },
	{ id: '2', text: 'Hola, ¿qué tal?', translation: "Hi, how's it going?", langId: 'es', status: 'learning' },
	{ id: '3', text: 'こんにちは', translation: 'Hello', langId: 'ja', status: 'learned' },
	{ id: '4', text: 'お疲れ様です', translation: 'Good work / Thanks for your effort', langId: 'ja', status: 'new' },
	{ id: '5', text: '안녕하세요', translation: 'Hello (formal)', langId: 'ko', status: 'learning' },
	{ id: '6', text: '감사합니다', translation: 'Thank you', langId: 'ko', status: 'learned' },
	{ id: '7', text: 'Hasta luego', translation: 'See you later', langId: 'es', status: 'new' },
	{ id: '8', text: 'いただきます', translation: "Let's eat (before a meal)", langId: 'ja', status: 'learning' },
]

const PLAYLISTS: Playlist[] = [
	{ id: 'p1', name: 'Daily Greetings', count: 12, langId: 'es' },
	{ id: 'p2', name: 'Hiragana Basics', count: 46, langId: 'ja' },
	{ id: 'p3', name: 'Korean Politeness', count: 8, langId: 'ko' },
]

const REQUESTS: Request[] = [
	{ id: 'r1', text: 'How to say "excuse me" in Korean', langId: 'ko', votes: 5 },
	{ id: 'r2', text: 'Informal greetings in Japanese', langId: 'ja', votes: 12 },
]

// ── Filter types ─────────────────────────────────────────────────────

type FilterTab = 'phrases' | 'playlists' | 'requests'

// ── Icons ────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	)
}

function XIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	)
}

function ChevronDownIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="6 9 12 15 18 9" />
		</svg>
	)
}

function SparkleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
		</svg>
	)
}

function SpeechBubbleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</svg>
	)
}

function ListIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<line x1="8" y1="6" x2="21" y2="6" />
			<line x1="8" y1="12" x2="21" y2="12" />
			<line x1="8" y1="18" x2="21" y2="18" />
			<line x1="3" y1="6" x2="3.01" y2="6" />
			<line x1="3" y1="12" x2="3.01" y2="12" />
			<line x1="3" y1="18" x2="3.01" y2="18" />
		</svg>
	)
}

function HandIcon({ className }: { className?: string }) {
	return (
		<svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M18 11V6a2 2 0 0 0-4 0v4" />
			<path d="M14 10V4a2 2 0 0 0-4 0v7" />
			<path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
			<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
		</svg>
	)
}

// ── Helpers ──────────────────────────────────────────────────────────

function getLangFlag(langId: string) {
	return LANGUAGES.find(l => l.id === langId)?.flag ?? ''
}

function statusDotColor(status: Phrase['status']) {
	switch (status) {
		case 'learned': return 'bg-5-mhi-success'
		case 'learning': return 'bg-5-mhi-warning'
		case 'new': return 'bg-4-mlo-neutral'
	}
}

// ── Sub-components ───────────────────────────────────────────────────

function SearchInput({
	query,
	onQueryChange,
	onClose,
	inputRef,
}: {
	query: string
	onQueryChange: (q: string) => void
	onClose: () => void
	inputRef: React.RefObject<HTMLInputElement | null>
}) {
	return (
		<div className="flex items-center gap-3 px-4 py-3 border-b border-2-mlo-neutral">
			<SearchIcon className="text-4-mlo-neutral shrink-0" />
			<input
				ref={inputRef}
				type="text"
				value={query}
				onChange={e => onQueryChange(e.target.value)}
				placeholder="Search phrases, playlists, threads..."
				className="flex-1 bg-transparent text-8-mlo-primary text-sm placeholder:text-4-mlo-neutral outline-none"
				autoFocus
			/>
			{query ? (
				<button
					onClick={() => onQueryChange('')}
					className="p-1 rounded hover:bg-2-mlo-neutral text-4-mlo-neutral transition-colors"
				>
					<XIcon />
				</button>
			) : (
				<button
					onClick={onClose}
					className="px-2 py-0.5 rounded text-xs font-medium border border-3-mlo-neutral text-5-mlo-neutral hover:bg-2-mlo-neutral transition-colors"
				>
					Esc
				</button>
			)}
		</div>
	)
}

function FilterTabs({
	active,
	onChange,
	counts,
}: {
	active: FilterTab
	onChange: (tab: FilterTab) => void
	counts: { phrases: number; playlists: number; requests: number }
}) {
	const tabs: { key: FilterTab; label: string }[] = [
		{ key: 'phrases', label: 'Phrases' },
		{ key: 'playlists', label: 'Playlists' },
		{ key: 'requests', label: 'Requests' },
	]
	return (
		<div className="flex gap-1.5 px-4 pt-3 pb-2">
			{tabs.map(tab => {
				const isActive = active === tab.key
				const count = counts[tab.key]
				return (
					<button
						key={tab.key}
						onClick={() => onChange(tab.key)}
						className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
							isActive
								? 'bg-3-mid-primary text-10-lo-primary'
								: 'bg-1-mlo-neutral text-5-mlo-neutral hover:bg-2-mlo-neutral'
						}`}
					>
						{tab.label}
						{count > 0 && <span className="ml-1 opacity-70">{count}</span>}
					</button>
				)
			})}
		</div>
	)
}

function LanguagesSection({
	expanded,
	onToggle,
	selectedLangs,
	onToggleLang,
}: {
	expanded: boolean
	onToggle: () => void
	selectedLangs: string[]
	onToggleLang: (id: string) => void
}) {
	return (
		<div className="mx-4 border-b border-2-mlo-neutral">
			<button
				onClick={onToggle}
				className="flex items-center justify-between w-full py-2.5 text-xs font-medium text-5-mlo-neutral hover:text-6-mlo-neutral transition-colors"
			>
				<span>Languages ({LANGUAGES.length})</span>
				<ChevronDownIcon
					className={`transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
				/>
			</button>
			{expanded && (
				<div className="pb-3">
					<div className="flex items-center justify-between mb-2">
						<span className="text-[0.65rem] font-semibold tracking-wider text-4-mlo-neutral uppercase">
							My Languages
						</span>
						<button className="text-[0.65rem] font-medium text-5-mid-primary hover:text-6-mid-primary transition-colors">
							Show all
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{LANGUAGES.map(lang => {
							const isSelected = selectedLangs.includes(lang.id)
							return (
								<button
									key={lang.id}
									onClick={() => onToggleLang(lang.id)}
									className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
										isSelected
											? 'bg-3-mid-primary text-10-lo-primary'
											: 'bg-1-mlo-neutral text-6-mlo-neutral hover:bg-2-mlo-neutral border border-2-mlo-neutral'
									}`}
								>
									<span>{lang.flag}</span>
									<span>{lang.name}</span>
								</button>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
			<SparkleIcon className="text-4-mlo-neutral mb-3" />
			<p className="text-sm font-medium text-6-mlo-neutral">Start typing to search</p>
			<p className="text-xs text-4-mlo-neutral mt-1">
				Search across {LANGUAGES.length} languages
			</p>
		</div>
	)
}

function PhraseResult({
	phrase,
	isHighlighted,
}: {
	phrase: Phrase
	isHighlighted: boolean
}) {
	return (
		<div
			className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
				isHighlighted ? 'bg-2-mlo-neutral' : 'hover:bg-1-mlo-neutral'
			}`}
		>
			<SpeechBubbleIcon className="text-4-mlo-neutral shrink-0" />
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-8-mlo-primary truncate">
						{phrase.text}
					</span>
					<span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(phrase.status)}`} />
				</div>
				<p className="text-xs text-4-mlo-neutral truncate">{phrase.translation}</p>
			</div>
			<span className="text-sm shrink-0">{getLangFlag(phrase.langId)}</span>
		</div>
	)
}

function PlaylistResult({
	playlist,
	isHighlighted,
}: {
	playlist: Playlist
	isHighlighted: boolean
}) {
	return (
		<div
			className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
				isHighlighted ? 'bg-2-mlo-neutral' : 'hover:bg-1-mlo-neutral'
			}`}
		>
			<ListIcon className="text-4-mlo-neutral shrink-0" />
			<div className="flex-1 min-w-0">
				<span className="text-sm font-medium text-8-mlo-primary truncate block">
					{playlist.name}
				</span>
				<p className="text-xs text-4-mlo-neutral">{playlist.count} phrases</p>
			</div>
			<span className="text-sm shrink-0">{getLangFlag(playlist.langId)}</span>
		</div>
	)
}

function RequestResult({
	request,
	isHighlighted,
}: {
	request: Request
	isHighlighted: boolean
}) {
	return (
		<div
			className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
				isHighlighted ? 'bg-2-mlo-neutral' : 'hover:bg-1-mlo-neutral'
			}`}
		>
			<HandIcon className="text-4-mlo-neutral shrink-0" />
			<div className="flex-1 min-w-0">
				<span className="text-sm font-medium text-8-mlo-primary truncate block">
					{request.text}
				</span>
				<p className="text-xs text-4-mlo-neutral">{request.votes} votes</p>
			</div>
			<span className="text-sm shrink-0">{getLangFlag(request.langId)}</span>
		</div>
	)
}

function ResultsSection({
	label,
	count,
	children,
}: {
	label: string
	count: number
	children: React.ReactNode
}) {
	if (count === 0) return null
	return (
		<div>
			<div className="px-4 pt-3 pb-1">
				<span className="text-[0.65rem] font-semibold tracking-wider text-4-mlo-neutral uppercase">
					{label} {count}
				</span>
			</div>
			{children}
		</div>
	)
}

function BottomBar() {
	return (
		<div className="flex items-center gap-4 px-4 py-2 border-t border-2-mlo-neutral text-[0.65rem] text-4-mlo-neutral">
			<div className="flex items-center gap-1">
				<span className="font-medium">Navigate</span>
				<kbd className="px-1 py-0.5 rounded border border-3-mlo-neutral text-[0.6rem] font-mono">
					&uarr;
				</kbd>
				<kbd className="px-1 py-0.5 rounded border border-3-mlo-neutral text-[0.6rem] font-mono">
					&darr;
				</kbd>
			</div>
			<div className="flex items-center gap-1">
				<kbd className="px-1 py-0.5 rounded border border-3-mlo-neutral text-[0.6rem] font-mono">
					Enter
				</kbd>
				<span className="font-medium">Open</span>
			</div>
			<div className="flex items-center gap-1">
				<kbd className="px-1 py-0.5 rounded border border-3-mlo-neutral text-[0.6rem] font-mono">
					&#8984; K
				</kbd>
				<span className="font-medium">Toggle</span>
			</div>
		</div>
	)
}

// ── Main overlay ─────────────────────────────────────────────────────

export default function SearchOverlay() {
	const [query, setQuery] = useState('')
	const [activeTab, setActiveTab] = useState<FilterTab>('phrases')
	const [langsExpanded, setLangsExpanded] = useState(false)
	const [selectedLangs, setSelectedLangs] = useState<string[]>([])
	const [highlightIndex, setHighlightIndex] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)

	// ── Search / filter logic ──────────────────────────────────────

	const q = query.toLowerCase().trim()

	const filteredPhrases = PHRASES.filter(p => {
		if (selectedLangs.length > 0 && !selectedLangs.includes(p.langId)) return false
		if (!q) return false
		return p.text.toLowerCase().includes(q) || p.translation.toLowerCase().includes(q)
	})

	const filteredPlaylists = PLAYLISTS.filter(p => {
		if (selectedLangs.length > 0 && !selectedLangs.includes(p.langId)) return false
		if (!q) return false
		return p.name.toLowerCase().includes(q)
	})

	const filteredRequests = REQUESTS.filter(r => {
		if (selectedLangs.length > 0 && !selectedLangs.includes(r.langId)) return false
		if (!q) return false
		return r.text.toLowerCase().includes(q)
	})

	const counts = {
		phrases: filteredPhrases.length,
		playlists: filteredPlaylists.length,
		requests: filteredRequests.length,
	}

	// Get items for the current tab
	const currentItems = activeTab === 'phrases'
		? filteredPhrases
		: activeTab === 'playlists'
		? filteredPlaylists
		: filteredRequests

	// ── Keyboard navigation ────────────────────────────────────────

	const handleClose = useCallback(() => {
		window.location.href = '/browse'
	}, [])

	useEffect(() => {
		setHighlightIndex(-1)
	}, [query, activeTab])

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault()
				handleClose()
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setHighlightIndex(prev => Math.min(prev + 1, currentItems.length - 1))
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				setHighlightIndex(prev => Math.max(prev - 1, -1))
			}
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				handleClose()
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [currentItems.length, handleClose])

	const toggleLang = (id: string) => {
		setSelectedLangs(prev =>
			prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
		)
	}

	// ── Render ─────────────────────────────────────────────────────

	const hasResults = q && (counts.phrases > 0 || counts.playlists > 0 || counts.requests > 0)
	const hasQuery = q.length > 0

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-lc-0 bg-c-lo bg-h-neutral opacity-80"
				onClick={handleClose}
			/>

			{/* Panel */}
			<div className="relative w-full max-w-[520px] mx-4 flex flex-col rounded-xl border border-2-mlo-neutral bg-0-lo-neutral shadow-2xl overflow-hidden max-h-[70vh]">
				<SearchInput
					query={query}
					onQueryChange={setQuery}
					onClose={handleClose}
					inputRef={inputRef}
				/>
				<FilterTabs active={activeTab} onChange={setActiveTab} counts={counts} />
				<LanguagesSection
					expanded={langsExpanded}
					onToggle={() => setLangsExpanded(p => !p)}
					selectedLangs={selectedLangs}
					onToggleLang={toggleLang}
				/>

				{/* Results area */}
				<div className="flex-1 overflow-y-auto min-h-0">
					{!hasQuery && <EmptyState />}

					{hasQuery && !hasResults && (
						<div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
							<p className="text-sm text-5-mlo-neutral">No results for &ldquo;{query}&rdquo;</p>
							<p className="text-xs text-4-mlo-neutral mt-1">Try a different search term</p>
						</div>
					)}

					{hasResults && activeTab === 'phrases' && (
						<ResultsSection label="Phrases" count={counts.phrases}>
							{filteredPhrases.map((phrase, i) => (
								<PhraseResult
									key={phrase.id}
									phrase={phrase}
									isHighlighted={highlightIndex === i}
								/>
							))}
						</ResultsSection>
					)}

					{hasResults && activeTab === 'playlists' && (
						<ResultsSection label="Playlists" count={counts.playlists}>
							{filteredPlaylists.map((playlist, i) => (
								<PlaylistResult
									key={playlist.id}
									playlist={playlist}
									isHighlighted={highlightIndex === i}
								/>
							))}
						</ResultsSection>
					)}

					{hasResults && activeTab === 'requests' && (
						<ResultsSection label="Requests" count={counts.requests}>
							{filteredRequests.map((request, i) => (
								<RequestResult
									key={request.id}
									request={request}
									isHighlighted={highlightIndex === i}
								/>
							))}
						</ResultsSection>
					)}
				</div>

				<BottomBar />
			</div>
		</div>
	)
}
