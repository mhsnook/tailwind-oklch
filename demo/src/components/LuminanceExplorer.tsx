import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_BEZIER, generateLumScale, LUM_RANGE } from '@/lib/color-config'
import { SliderControl } from '@/components/ui/slider'

type Point = { x: number; y: number }

const SVG_W = 360
const SVG_H = 240
const PAD = 32

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
	const sx = (v: number) => PAD + v * (SVG_W - 2 * PAD)
	const sy = (v: number) => SVG_H - PAD - v * (SVG_H - 2 * PAD)
	return `M ${sx(0)} ${sy(0)} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${sx(1)} ${sy(1)}`
}

function contrastRatio(l1: number, l2: number): number {
	// Approximate WCAG contrast from OKLCH lightness
	// Convert L to relative luminance (rough approximation)
	const toY = (l: number) => Math.pow(l, 2.2)
	const y1 = toY(l1)
	const y2 = toY(l2)
	const lighter = Math.max(y1, y2)
	const darker = Math.min(y1, y2)
	return (lighter + 0.05) / (darker + 0.05)
}

function ratingLabel(ratio: number): { label: string; color: string } {
	if (ratio >= 7) return { label: 'AAA', color: '#22c55e' }
	if (ratio >= 4.5) return { label: 'AA', color: '#22c55e' }
	if (ratio >= 3) return { label: 'AA-lg', color: '#eab308' }
	return { label: 'Fail', color: '#ef4444' }
}

export default function LuminanceExplorer() {
	const [bezier, setBezier] = useState<[number, number, number, number]>([...DEFAULT_BEZIER])
	const [lumMin, setLumMin] = useState(0.12)
	const [lumMax, setLumMax] = useState(0.96)
	const [isDark, setIsDark] = useState(true)
	const [hue, setHue] = useState(233)
	const [dragging, setDragging] = useState<1 | 2 | null>(null)
	const svgRef = useRef<SVGSVGElement>(null)

	// Sync dark mode (range is mode-independent; only isDark changes)
	useEffect(() => {
		const sync = () => {
			setIsDark(document.documentElement.classList.contains('dark'))
		}
		sync()
		const observer = new MutationObserver(sync)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

	const scale = generateLumScale(lumMin, lumMax, bezier)
	// Dark mode reverses which stop gets which value
	const assigned = isDark ? [...scale].reverse() : scale

	// Push changes to document
	useEffect(() => {
		const root = document.documentElement.style
		root.setProperty('--lum-min', String(lumMin))
		root.setProperty('--lum-max', String(lumMax))
		for (let i = 0; i < 12; i++) {
			root.setProperty(`--lum-${i + 1}`, String(assigned[i].toFixed(4)))
		}
		window.dispatchEvent(new CustomEvent('hue-change'))
	}, [assigned, lumMin, lumMax])

	// SVG coordinate helpers
	const toSvg = useCallback((nx: number, ny: number): Point => ({
		x: PAD + nx * (SVG_W - 2 * PAD),
		y: SVG_H - PAD - ny * (SVG_H - 2 * PAD),
	}), [])

	const fromSvg = useCallback((sx: number, sy: number): Point => ({
		x: Math.max(0, Math.min(1, (sx - PAD) / (SVG_W - 2 * PAD))),
		y: Math.max(0, Math.min(1, (SVG_H - PAD - sy) / (SVG_H - 2 * PAD))),
	}), [])

	const handlePointerMove = useCallback((e: PointerEvent) => {
		if (!dragging || !svgRef.current) return
		const rect = svgRef.current.getBoundingClientRect()
		const sx = (e.clientX - rect.left) * (SVG_W / rect.width)
		const sy = (e.clientY - rect.top) * (SVG_H / rect.height)
		const { x, y } = fromSvg(sx, sy)
		setBezier((prev) => {
			const next = [...prev] as [number, number, number, number]
			if (dragging === 1) {
				next[0] = x
				next[1] = y
			} else {
				next[2] = x
				next[3] = y
			}
			return next
		})
	}, [dragging, fromSvg])

	const handlePointerUp = useCallback(() => {
		setDragging(null)
	}, [])

	useEffect(() => {
		if (dragging) {
			window.addEventListener('pointermove', handlePointerMove)
			window.addEventListener('pointerup', handlePointerUp)
			return () => {
				window.removeEventListener('pointermove', handlePointerMove)
				window.removeEventListener('pointerup', handlePointerUp)
			}
		}
	}, [dragging, handlePointerMove, handlePointerUp])

	const cp1 = toSvg(bezier[0], bezier[1])
	const cp2 = toSvg(bezier[2], bezier[3])
	const origin = toSvg(0, 0)
	const end = toSvg(1, 1)

	// Stop dots on curve
	const stopDots = scale.map((lum, i) => {
		const nx = i / 11
		const ny = (lum - lumMin) / (lumMax - lumMin || 1)
		return toSvg(nx, ny)
	})

	return (
		<div className="hue-primary chroma-[2] space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* ── Bezier Curve Editor ─────────────────────── */}
				<div className="p-5 rounded-xl border border-lum-9 bg-lum-11">
					<h3 className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold mb-3">
						Bezier Curve Editor
					</h3>
					<svg
						ref={svgRef}
						viewBox={`0 0 ${SVG_W} ${SVG_H}`}
						className="w-full rounded-lg bg-black/20 touch-none select-none"
					>
						{/* Grid lines */}
						{[0.25, 0.5, 0.75].map((v) => {
							const p = toSvg(v, 0)
							const p2 = toSvg(v, 1)
							return <line key={`vg-${v}`} x1={p.x} y1={p.y} x2={p2.x} y2={p2.y} stroke="white" strokeOpacity="0.08" />
						})}
						{[0.25, 0.5, 0.75].map((v) => {
							const p = toSvg(0, v)
							const p2 = toSvg(1, v)
							return <line key={`hg-${v}`} x1={p.x} y1={p.y} x2={p2.x} y2={p2.y} stroke="white" strokeOpacity="0.08" />
						})}

						{/* Control point lines */}
						<line x1={origin.x} y1={origin.y} x2={cp1.x} y2={cp1.y} stroke="white" strokeOpacity="0.3" strokeDasharray="4 4" />
						<line x1={end.x} y1={end.y} x2={cp2.x} y2={cp2.y} stroke="white" strokeOpacity="0.3" strokeDasharray="4 4" />

						{/* Bezier curve */}
						<path d={bezierPath(bezier[0], bezier[1], bezier[2], bezier[3])} fill="none" stroke="white" strokeWidth="2" />

						{/* Stop dots */}
						{stopDots.map((dot, i) => (
							<circle key={i} cx={dot.x} cy={dot.y} r="4" fill={`oklch(${scale[i]} 0.12 ${hue})`} stroke="white" strokeWidth="1.5" />
						))}

						{/* Draggable control points */}
						<circle
							cx={cp1.x}
							cy={cp1.y}
							r="8"
							fill="white"
							fillOpacity="0.9"
							stroke="white"
							strokeWidth="2"
							className="cursor-grab active:cursor-grabbing"
							onPointerDown={() => setDragging(1)}
						/>
						<circle
							cx={cp2.x}
							cy={cp2.y}
							r="8"
							fill="white"
							fillOpacity="0.9"
							stroke="white"
							strokeWidth="2"
							className="cursor-grab active:cursor-grabbing"
							onPointerDown={() => setDragging(2)}
						/>

						{/* Axis labels */}
						<text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontFamily="monospace">
							stop index (1→12)
						</text>
						<text x={10} y={SVG_H / 2} textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontFamily="monospace" transform={`rotate(-90, 10, ${SVG_H / 2})`}>
							lightness
						</text>
					</svg>
					<div className="mt-2 text-[0.72rem] font-mono text-lum-[50]">
						cubic-bezier({bezier.map((v) => v.toFixed(2)).join(', ')})
					</div>
				</div>

				{/* ── Theme Controls ──────────────────────────── */}
				<div className="p-5 rounded-xl border border-lum-9 bg-lum-11 space-y-4">
					<h3 className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold">
						Theme Controls
					</h3>

					<div>
						<label className="text-[0.72rem] font-mono text-lum-[50] block mb-1">
							Theme min (lum-1): {lumMin.toFixed(2)}
						</label>
						<SliderControl value={lumMin} onValueChange={setLumMin} min={0.05} max={0.5} step={0.01} label="Theme min" />
					</div>

					<div>
						<label className="text-[0.72rem] font-mono text-lum-[50] block mb-1">
							Theme max (lum-12): {lumMax.toFixed(2)}
						</label>
						<SliderControl value={lumMax} onValueChange={setLumMax} min={0.6} max={0.99} step={0.01} label="Theme max" />
					</div>

					<div>
						<label className="text-[0.72rem] font-mono text-lum-[50] block mb-1">
							Preview hue: {hue}°
						</label>
						<SliderControl value={hue} onValueChange={setHue} min={0} max={360} step={1} label="Preview hue" />
					</div>

					<div className="flex items-center gap-3 pt-1">
						<button
							onClick={() => {
								const next = !isDark
								document.documentElement.classList.toggle('dark', next)
								localStorage.setItem('theme', next ? 'dark' : 'light')
								setIsDark(next)
							}}
							className="text-[0.75rem] font-mono px-3 py-1.5 rounded-lg bg-lum-9 text-lum-1 cursor-pointer hover:bg-lum-8 transition-colors"
						>
							{isDark ? 'Light mode' : 'Dark mode'}
						</button>
						<button
							onClick={() => setBezier([...DEFAULT_BEZIER])}
							className="text-[0.75rem] font-mono px-3 py-1.5 rounded-lg bg-lum-9 text-lum-1 cursor-pointer hover:bg-lum-8 transition-colors"
						>
							Reset bezier
						</button>
					</div>
				</div>
			</div>

			{/* ── Color Sample Grid ──────────────────────────── */}
			<div className="p-5 rounded-xl border border-lum-9 bg-lum-11">
				<h3 className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold mb-3">
					Luminance Swatches &amp; Contrast
				</h3>
				<div className="grid grid-cols-[repeat(14,1fr)] gap-[3px]">
					{/* Header row */}
					{['none', ...Array.from({ length: 12 }, (_, i) => String(i + 1)), 'full'].map((label) => (
						<div key={`h-${label}`} className="text-[0.55rem] font-mono text-lum-[50] text-center pb-1">
							{label}
						</div>
					))}

					{/* Swatch row — uses assigned (mode-aware) values */}
					{[isDark ? 1 : 0, ...assigned, isDark ? 0 : 1].map((lum, i) => {
						const labels = ['none', ...Array.from({ length: 12 }, (_, j) => String(j + 1)), 'full']
						const whiteRatio = contrastRatio(lum, 1)
						const blackRatio = contrastRatio(lum, 0)
						const whiteRating = ratingLabel(whiteRatio)
						const blackRating = ratingLabel(blackRatio)

						return (
							<div
								key={`s-${labels[i]}`}
								className="rounded-md aspect-square flex flex-col items-center justify-center gap-0.5 relative text-center min-h-[3.5rem]"
								style={{ backgroundColor: `oklch(${lum} 0.12 ${hue})` }}
							>
								<span className="text-[0.6rem] font-bold" style={{ color: 'white' }}>Aa</span>
								<span className="text-[0.45rem] font-mono" style={{ color: whiteRating.color }}>
									{whiteRatio.toFixed(1)}
								</span>
								<span className="text-[0.6rem] font-bold" style={{ color: 'black' }}>Aa</span>
								<span className="text-[0.45rem] font-mono" style={{ color: blackRating.color }}>
									{blackRatio.toFixed(1)}
								</span>
							</div>
						)
					})}

					{/* Lightness value row */}
					{[isDark ? 1 : 0, ...assigned, isDark ? 0 : 1].map((lum, i) => {
						const labels = ['none', ...Array.from({ length: 12 }, (_, j) => String(j + 1)), 'full']
						return (
							<div key={`v-${labels[i]}`} className="text-[0.5rem] font-mono text-lum-[50] text-center pt-1">
								{lum.toFixed(2)}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
