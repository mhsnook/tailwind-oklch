import { useState, useEffect, useCallback } from 'react'
import { HUES, L_STOPS, C_STOPS } from '@/lib/color-config'

export default function ColorMatrix() {
	const [, setTick] = useState(0)
	const [preview, setPreview] = useState<{
		color: string
		className: string
		oklch: string
	} | null>(null)

	useEffect(() => {
		const handler = () => setTick((t) => t + 1)
		window.addEventListener('hue-change', handler)
		return () => window.removeEventListener('hue-change', handler)
	}, [])

	const getHueVal = useCallback((name: string) => {
		if (typeof window === 'undefined') {
			return String(HUES.find((h) => h.name === name)?.default ?? 260)
		}
		const val = getComputedStyle(document.documentElement).getPropertyValue(`--hue-${name}`).trim()
		return val || String(HUES.find((h) => h.name === name)?.default ?? 260)
	}, [])

	return (
		<>
			<div className="flex gap-10 flex-wrap">
				{HUES.map((hue) => {
					const hueVal = getHueVal(hue.name)
					return (
						<div key={hue.name} className="flex-1 min-w-[280px]">
							<h3
								className="text-[0.85rem] font-semibold mb-3 font-mono tracking-[-0.01em]"
								style={{
									color: `oklch(var(--l-60) var(--c-mlo) var(--hue-${hue.name}))`,
								}}
							>
								{hue.name} ({hueVal}°)
							</h3>
							<div className="grid grid-cols-[auto_repeat(5,1fr)] grid-rows-[auto_repeat(5,1fr)] gap-[2px]">
								{/* Top-left empty corner */}
								<div className="matrix-label" />

								{/* Column headers */}
								{C_STOPS.map((c) => (
									<div key={c.name} className="matrix-label col-label">
										C:{c.name}
									</div>
								))}

								{/* Rows */}
								{L_STOPS.map((l) => (
									<>
										<div key={`label-${l.name}`} className="matrix-label">
											L:{l.name}
										</div>
										{C_STOPS.map((c) => {
											const color = `oklch(${l.val} ${c.val} ${hueVal})`
											const className = `bg-${l.name}-${c.name}-${hue.name}`
											const oklch = `oklch(${l.val} ${c.val} ${hueVal})`
											return (
												<div
													key={`${l.name}-${c.name}`}
													className="matrix-cell aspect-square rounded-md min-w-12 min-h-12 cursor-pointer transition-[transform,box-shadow] duration-150 relative"
													style={{ backgroundColor: color }}
													onMouseEnter={() => setPreview({ color, className, oklch })}
													onMouseLeave={() => setPreview(null)}
												/>
											)
										})}
									</>
								))}
							</div>
						</div>
					)
				})}
			</div>

			{/* Preview toast */}
			<div
				className={`class-preview fixed bottom-8 left-1/2 -translate-x-1/2 rounded-[10px] px-6 py-4 font-mono text-[0.85rem] flex items-center gap-4 backdrop-blur-md transition-opacity duration-200 z-[100] ${preview ? 'visible' : ''}`}
			>
				{preview && (
					<>
						<div className="swatch w-8 h-8 rounded-md" style={{ backgroundColor: preview.color }} />
						<div>
							<div className="text-hi-mhi-primary">{preview.className}</div>
							<div className="text-mid-lo-primary text-xs">{preview.oklch}</div>
						</div>
					</>
				)}
			</div>
		</>
	)
}
