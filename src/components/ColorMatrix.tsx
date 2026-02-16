import { Fragment, useState, useEffect, useCallback } from 'react'
import { HUES, L_STOPS, C_STOPS, LU_RANGE_DARK, luValue } from '@/lib/color-config'

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

	const getLuRange = useCallback(() => {
		if (typeof window === 'undefined') return LU_RANGE_DARK
		const style = getComputedStyle(document.documentElement)
		const start = parseFloat(style.getPropertyValue('--lu-range-start').trim())
		const end = parseFloat(style.getPropertyValue('--lu-range-end').trim())
		if (isNaN(start) || isNaN(end)) return LU_RANGE_DARK
		return { start, end }
	}, [])

	return (
		<>
			<div className="flex gap-10 flex-wrap">
				{HUES.map((hue) => {
					const hueVal = getHueVal(hue.name)
					const range = getLuRange()
					return (
						<div key={hue.name} className="flex-1 min-w-[280px]">
							<h3
								className="text-[0.85rem] font-semibold mb-3 font-mono tracking-[-0.01em]"
								style={{
									color: `oklch(var(--l-7) var(--c-mlo) var(--hue-${hue.name}))`,
								}}
							>
								{hue.name} ({hueVal}°)
							</h3>
							<div className="grid grid-cols-[auto_repeat(5,1fr)] grid-rows-[auto_repeat(5,1fr)] gap-[2px]">
								{/* Top-left empty corner */}
								<div className="matrix-label" />

								{/* Column headers — luminance (left=base, right=fore) */}
								{L_STOPS.map((l) => (
									<div key={l.name} className="matrix-label col-label">
										L:{l.name}
									</div>
								))}

								{/* Rows — chroma (top=hi, bottom=lo) */}
								{[...C_STOPS].reverse().map((c) => (
									<Fragment key={c.name}>
										<div className="matrix-label">
											C:{c.name}
										</div>
										{L_STOPS.map((l) => {
											const lVal = luValue(l.step, range)
											const color = `oklch(${lVal.toFixed(3)} ${c.val} ${hueVal})`
											const className = `bg-${l.name}-${c.name}-${hue.name}`
											const oklch = `oklch(${lVal.toFixed(2)} ${c.val} ${hueVal})`
											return (
												<div
													key={`${l.name}-${c.name}`}
													className="matrix-cell aspect-square rounded-md min-w-8 min-h-8 cursor-pointer transition-[transform,box-shadow] duration-150 relative"
													style={{ backgroundColor: color }}
													onMouseEnter={() => setPreview({ color, className, oklch })}
													onMouseLeave={() => setPreview(null)}
												/>
											)
										})}
									</Fragment>
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
							<div className="text-fore-mhi-primary">{preview.className}</div>
							<div className="text-5-lo-primary text-xs">{preview.oklch}</div>
						</div>
					</>
				)}
			</div>
		</>
	)
}
