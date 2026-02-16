import { useState, useEffect, useCallback } from 'react'
import { SliderControl, RangeSliderControl } from '@/components/ui/slider'
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

	const applyLuRange = useCallback((range: { start: number; end: number }) => {
		document.documentElement.style.setProperty('--lc-range-start', String(range.start))
		document.documentElement.style.setProperty('--lc-range-end', String(range.end))
		for (let i = 0; i <= 10; i++) {
			const lVal = range.start + (range.end - range.start) * (i / 10)
			document.documentElement.style.setProperty(`--l-${i}`, String(lVal.toFixed(4)))
		}
		window.dispatchEvent(new CustomEvent('hue-change'))
	}, [])

	useEffect(() => {
		const sync = () => {
			const dark = document.documentElement.classList.contains('dark')
			setIsDark(dark)
			const defaults = dark ? LU_RANGE_DARK : LU_RANGE_LIGHT
			setLuRange(defaults)
			applyLuRange(defaults)
		}
		sync()
		const observer = new MutationObserver(sync)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [applyLuRange])

	// Range slider always works in [low, high] order; we map back to start/end based on mode
	const rangeValue: [number, number] = isDark
		? [luRange.start, luRange.end]
		: [luRange.end, luRange.start]

	const updateLuRangeFromSlider = useCallback(
		([low, high]: [number, number]) => {
			const next = isDark ? { start: low, end: high } : { start: high, end: low }
			setLuRange(next)
			applyLuRange(next)
		},
		[isDark, applyLuRange],
	)

	// ── Cross-reference state between L and C strips ───────────────────
	const [selectedChroma, setSelectedChroma] = useState(C_STOPS[2]) // mid
	const [selectedLStep, setSelectedLStep] = useState(L_STOPS[2]) // 5

	const lStopValues = L_STOPS.map((l) => ({
		...l,
		value: luValue(l.step, luRange),
	}))
	const selectedLValue = luValue(selectedLStep.step, luRange)

	return (
		<div className="space-y-6">
			{/* ── Hue Sliders ──────────────────────────────────────── */}
			<div>
				<h3 className="text-xs uppercase tracking-[0.08em] text-5-lo-primary font-semibold mb-3">
					Hues
				</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 p-5 bg-lc-1 bg-c-lo bg-h-primary rounded-xl border border-lc-2 border-c-lo border-h-primary">
					{HUES.map((hue) => (
						<div key={hue.name} className="flex flex-col gap-1.5">
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
					<div className="mb-1">
						<RangeSliderControl
							value={rangeValue}
							onValueChange={updateLuRangeFromSlider}
							min={0}
							max={1}
							step={0.01}
							labelStart="Luminance base (0)"
							labelEnd="Luminance fore (10)"
						/>
					</div>
					<div className="flex justify-between text-[0.75rem] font-mono text-5-lo-primary mb-5">
						<span>base (0): {luRange.start.toFixed(2)}</span>
						<span>fore (10): {luRange.end.toFixed(2)}</span>
					</div>

					{/* L stops strip */}
					<div className="text-[0.65rem] font-mono text-5-lo-primary mb-1">
						chroma: {selectedChroma.name} ({selectedChroma.val})
					</div>
					<div className="flex gap-[2px]">
						{lStopValues.map((l) => (
							<button
								key={l.name}
								type="button"
								onClick={() => setSelectedLStep(L_STOPS.find((s) => s.name === l.name)!)}
								className={`flex-1 flex flex-col items-center gap-1 cursor-pointer rounded-lg p-1 transition-colors ${selectedLStep.name === l.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
							>
								<div
									className="w-full aspect-[2/1] rounded-md border border-white/10"
									style={{ backgroundColor: `oklch(${l.value.toFixed(3)} ${selectedChroma.val} var(--hue-primary))` }}
								/>
								<div className="text-[0.6rem] font-mono text-5-lo-primary leading-none">
									L:{l.name}
								</div>
								<div className="text-[0.55rem] font-mono text-5-lo-primary opacity-60 leading-none">
									{l.value.toFixed(2)}
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Chroma Stops */}
				<div className="p-5 rounded-xl border border-lc-2 border-c-lo border-h-primary bg-lc-1 bg-c-lo bg-h-primary">
					<h3 className="text-xs uppercase tracking-[0.08em] text-5-lo-primary font-semibold mb-4">
						Chroma Stops
					</h3>
					<div className="text-[0.65rem] font-mono text-5-lo-primary mb-1">
						luminance: L:{selectedLStep.name} ({selectedLValue.toFixed(2)})
					</div>
					<div className="flex gap-[2px] mb-3">
						{C_STOPS.map((c) => (
							<button
								key={c.name}
								type="button"
								onClick={() => setSelectedChroma(c)}
								className={`flex-1 flex flex-col items-center gap-1 cursor-pointer rounded-lg p-1 transition-colors ${selectedChroma.name === c.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
							>
								<div
									className="w-full aspect-[2/1] rounded-md border border-white/10"
									style={{ backgroundColor: `oklch(${selectedLValue.toFixed(3)} ${c.val} var(--hue-primary))` }}
								/>
								<div className="text-[0.6rem] font-mono text-5-lo-primary leading-none">
									C:{c.name}
								</div>
								<div className="text-[0.55rem] font-mono text-5-lo-primary opacity-60 leading-none">
									{c.val}
								</div>
							</button>
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
