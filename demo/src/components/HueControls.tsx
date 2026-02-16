import { useState, useEffect, useCallback } from 'react'
import { SliderControl } from '@/components/ui/slider'
import { HUES, L_STOPS, C_STOPS, LU_RANGE_DARK, LU_RANGE_LIGHT, luValue } from '@/lib/color-config'

export default function HueControls() {
	// ── Hue state ───────────────────────────────────────────────────────
	const [values, setValues] = useState<Record<string, number>>(
		Object.fromEntries(HUES.map((h) => [h.name, h.default])),
	)

	const updateHue = useCallback((name: string, val: number) => {
		setValues((prev) => ({ ...prev, [name]: val }))
		document.documentElement.style.setProperty(`--hue-${name}`, String(val))
		window.dispatchEvent(new CustomEvent('hue-change'))
	}, [])

	// ── Luminance range state ───────────────────────────────────────────
	const [isDark, setIsDark] = useState(true)
	const [luRange, setLuRange] = useState(LU_RANGE_DARK)

	useEffect(() => {
		const sync = () => {
			const dark = document.documentElement.classList.contains('dark')
			setIsDark(dark)
			const defaults = dark ? LU_RANGE_DARK : LU_RANGE_LIGHT
			setLuRange(defaults)
			document.documentElement.style.setProperty('--lc-range-start', String(defaults.start))
			document.documentElement.style.setProperty('--lc-range-end', String(defaults.end))
			for (let i = 0; i <= 10; i++) {
				const lVal = defaults.start + (defaults.end - defaults.start) * (i / 10)
				document.documentElement.style.setProperty(`--l-${i}`, String(lVal.toFixed(4)))
			}
			window.dispatchEvent(new CustomEvent('hue-change'))
		}
		sync()
		const observer = new MutationObserver(sync)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

	const updateLuRange = useCallback((key: 'start' | 'end', val: number) => {
		setLuRange((prev) => {
			const next = { ...prev, [key]: val }
			document.documentElement.style.setProperty('--lc-range-start', String(next.start))
			document.documentElement.style.setProperty('--lc-range-end', String(next.end))
			for (let i = 0; i <= 10; i++) {
				const lVal = next.start + (next.end - next.start) * (i / 10)
				document.documentElement.style.setProperty(`--l-${i}`, String(lVal.toFixed(4)))
			}
			window.dispatchEvent(new CustomEvent('hue-change'))
			return next
		})
	}, [])

	const lStopValues = L_STOPS.map((l) => ({
		...l,
		value: luValue(l.step, luRange),
	}))

	return (
		<div className="space-y-6">
			{/* ── Hue Sliders ──────────────────────────────────────── */}
			<div>
				<h3 className="text-xs uppercase tracking-[0.08em] text-5-lo-primary font-semibold mb-3">
					Hues
				</h3>
				<div className="flex gap-6 flex-wrap p-5 bg-lc-1 bg-c-lo bg-h-primary rounded-xl border border-lc-2 border-c-lo border-h-primary">
					{HUES.map((hue) => (
						<div key={hue.name} className="flex flex-col gap-1.5 min-w-[160px] flex-1">
							<label className="text-xs uppercase tracking-[0.08em] text-5-lo-primary font-semibold">
								{hue.name}
							</label>
							<SliderControl
								value={values[hue.name]}
								onValueChange={(val) => updateHue(hue.name, val)}
								min={0}
								max={360}
								step={1}
								label={`${hue.name} hue`}
							/>
							<div className="font-mono text-[0.8rem] text-8-mid-primary">{values[hue.name]}°</div>
						</div>
					))}
				</div>
			</div>

			{/* ── Luminance + Chroma ──────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
				{/* Luminance Range */}
				<div className="p-5 rounded-xl border border-lc-2 border-c-lo border-h-primary bg-lc-1 bg-c-lo bg-h-primary">
					<h3 className="text-xs uppercase tracking-[0.08em] text-5-lo-primary font-semibold mb-4">
						Luminance Range
						<span className="normal-case tracking-normal font-normal ml-2 opacity-70">
							({isDark ? 'dark' : 'light'} mode)
						</span>
					</h3>
					<div className="flex gap-6 mb-5">
						<div className="flex-1">
							<label className="text-[0.75rem] font-mono text-5-lo-primary mb-1 block">
								base (0): {luRange.start.toFixed(2)}
							</label>
							<SliderControl
								value={luRange.start}
								onValueChange={(val) => updateLuRange('start', val)}
								min={0}
								max={1}
								step={0.01}
								label="Luminance range start"
							/>
						</div>
						<div className="flex-1">
							<label className="text-[0.75rem] font-mono text-5-lo-primary mb-1 block">
								fore (10): {luRange.end.toFixed(2)}
							</label>
							<SliderControl
								value={luRange.end}
								onValueChange={(val) => updateLuRange('end', val)}
								min={0}
								max={1}
								step={0.01}
								label="Luminance range end"
							/>
						</div>
					</div>

					{/* L stops strip */}
					<div className="flex gap-[2px]">
						{lStopValues.map((l) => (
							<div key={l.name} className="flex-1 flex flex-col items-center gap-1">
								<div
									className="w-full aspect-[2/1] rounded-md border border-white/10"
									style={{ backgroundColor: `oklch(${l.value.toFixed(3)} 0 0)` }}
								/>
								<div className="text-[0.6rem] font-mono text-5-lo-primary leading-none">
									L:{l.name}
								</div>
								<div className="text-[0.55rem] font-mono text-5-lo-primary opacity-60 leading-none">
									{l.value.toFixed(2)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Chroma Stops */}
				<div className="p-5 rounded-xl border border-lc-2 border-c-lo border-h-primary bg-lc-1 bg-c-lo bg-h-primary">
					<h3 className="text-xs uppercase tracking-[0.08em] text-5-lo-primary font-semibold mb-4">
						Chroma Stops
					</h3>
					<div className="flex gap-[2px] mb-3">
						{C_STOPS.map((c) => (
							<div key={c.name} className="flex-1 flex flex-col items-center gap-1">
								<div
									className="w-full aspect-[2/1] rounded-md border border-white/10"
									style={{ backgroundColor: `oklch(0.65 ${c.val} var(--hue-primary))` }}
								/>
								<div className="text-[0.6rem] font-mono text-5-lo-primary leading-none">
									C:{c.name}
								</div>
								<div className="text-[0.55rem] font-mono text-5-lo-primary opacity-60 leading-none">
									{c.val}
								</div>
							</div>
						))}
					</div>
					<p className="text-[0.75rem] text-5-lo-primary leading-relaxed">
						Chroma controls saturation intensity &mdash; from nearly
						neutral (<span className="font-mono">lo</span>) to fully
						vivid (<span className="font-mono">hi</span>).
					</p>
				</div>
			</div>
		</div>
	)
}
