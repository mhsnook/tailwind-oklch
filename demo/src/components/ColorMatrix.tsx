import { Fragment, useState, useEffect, useCallback } from 'react'
import { HUES, LUM_STOPS_COMPACT, C_STOPS, LUM_RANGE_DARK, lumValue } from '@/lib/color-config'

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

	const getLumRange = useCallback(() => {
		if (typeof window === 'undefined') return LUM_RANGE_DARK
		const style = getComputedStyle(document.documentElement)
		const min = parseFloat(style.getPropertyValue('--lum-min').trim())
		const max = parseFloat(style.getPropertyValue('--lum-max').trim())
		if (isNaN(min) || isNaN(max)) return LUM_RANGE_DARK
		return { min, max }
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
									color: `oklch(var(--lum-4) var(--c-mlo) var(--hue-${hue.name}))`,
								}}
							>
								{hue.name} ({hueVal}°)
							</h3>
							<div className="grid grid-cols-[auto_repeat(5,1fr)] grid-rows-[auto_repeat(5,1fr)] gap-[2px]">
								{/* Top-left empty corner */}
								<div className="matrix-label" />

								{/* Column headers — luminance (left=darkest, right=lightest) */}
								{LUM_STOPS_COMPACT.map((l) => (
									<div key={l.name} className="matrix-label col-label">
										lum&#8209;{l.name}
									</div>
								))}

								{/* Rows — chroma (top=hi, bottom=lo) */}
								{[...C_STOPS].reverse().map((c) => (
									<Fragment key={c.name}>
										<div className="matrix-label">c&#8209;{c.name}</div>
										{LUM_STOPS_COMPACT.map((l) => {
											const color = `oklch(var(--lum-${l.name}) ${c.val} var(--hue-${hue.name}))`
											const className = `hue-${hue.name} bg-lum-${l.name} bg-c-${c.name}`
											return (
												<div
													key={`${l.name}-${c.name}`}
													className="matrix-cell aspect-square rounded-md min-w-8 min-h-8 cursor-pointer transition-[transform,box-shadow] duration-150 relative"
													style={{ backgroundColor: color }}
													onMouseEnter={() => {
														const range = getLumRange()
														const lVal = lumValue(l.stop, range)
														setPreview({
															color,
															className,
															oklch: `oklch(${lVal.toFixed(2)} ${c.val} ${hueVal})`,
														})
													}}
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
						<div className="hue-primary">
							<div className="text-lum-1 chroma-mhi">{preview.className}</div>
							<div className="text-lum-6 chroma-lo text-xs">{preview.oklch}</div>
						</div>
					</>
				)}
			</div>
		</>
	)
}
