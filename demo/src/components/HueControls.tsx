import { useState, useEffect, useCallback } from 'react'
import { SliderControl, RangeSliderControl } from '@/components/ui/slider'
import { HUES, LUM_STOPS, C_STOPS, LUM_RANGE_DARK, LUM_RANGE_LIGHT, lumValue, DEFAULT_BEZIER, generateLumScale } from '@/lib/color-config'

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
	const [lumRange, setLumRange] = useState(LUM_RANGE_DARK)

	const applyLumRange = useCallback((range: { min: number; max: number }) => {
		document.documentElement.style.setProperty('--lum-min', String(range.min))
		document.documentElement.style.setProperty('--lum-max', String(range.max))
		const scale = generateLumScale(range.min, range.max, DEFAULT_BEZIER)
		for (let i = 0; i < 12; i++) {
			document.documentElement.style.setProperty(`--lum-${i + 1}`, String(scale[i].toFixed(4)))
		}
		window.dispatchEvent(new CustomEvent('hue-change'))
	}, [])

	useEffect(() => {
		const sync = () => {
			const dark = document.documentElement.classList.contains('dark')
			setIsDark(dark)
			const defaults = dark ? LUM_RANGE_DARK : LUM_RANGE_LIGHT
			setLumRange(defaults)
			applyLumRange(defaults)
		}
		sync()
		const observer = new MutationObserver(sync)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [applyLumRange])

	// Range slider always works in [low, high] order; we map back to min/max based on mode
	const rangeValue: [number, number] = isDark
		? [lumRange.max, lumRange.min]
		: [lumRange.min, lumRange.max]

	const updateLumRangeFromSlider = useCallback(
		([low, high]: [number, number]) => {
			const next = isDark ? { min: high, max: low } : { min: low, max: high }
			setLumRange(next)
			applyLumRange(next)
		},
		[isDark, applyLumRange],
	)

	// ── Cross-reference state between H, L, and C strips ───────────────
	const [selectedHue, setSelectedHue] = useState(HUES[0].name) // primary
	const [selectedChroma, setSelectedChroma] = useState(C_STOPS[2]) // mid
	const [selectedLStop, setSelectedLStop] = useState(LUM_STOPS.find((s) => s.name === '6')!) // 6

	const lStopValues = LUM_STOPS.map((l) => ({
		...l,
		value: lumValue(l.stop, lumRange),
	}))
	const selectedLValue = lumValue(selectedLStop.stop, lumRange)

	return (
		<div className="hue-primary chroma-[2] space-y-6">
			{/* ── Hue Sliders ──────────────────────────────────────── */}
			<div className="p-5 bg-lum-10 rounded-xl border border-lum-9">
				<h3 className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold mb-3">
					Hues
				</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
					{HUES.map((hue) => (
						<button
							key={hue.name}
							type="button"
							onClick={() => setSelectedHue(hue.name)}
							className={`flex flex-col gap-1.5 text-left cursor-pointer rounded-lg p-2 transition-colors ${selectedHue === hue.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
						>
							<label className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold pointer-events-none">
								{hue.name}
							</label>
							<div onClick={(e) => e.stopPropagation()}>
								<SliderControl
									value={values[hue.name]}
									onValueChange={(val) => updateHue(hue.name, val)}
									min={0}
									max={360}
									step={1}
									label={`${hue.name} hue`}
								/>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-5 h-5 rounded-md border border-white/10 shrink-0"
									style={{ backgroundColor: `oklch(${selectedLValue.toFixed(3)} ${selectedChroma.val} var(--hue-${hue.name}))` }}
								/>
								<div className="font-mono text-[0.8rem] text-lum-[22] chroma-[12]">{values[hue.name]}°</div>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* ── Luminance + Chroma ──────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
				{/* Luminance Range */}
				<div className="p-5 rounded-xl border border-lum-9 bg-lum-10">
					<h3 className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold mb-4">
						Luminance Range
						<span className="normal-case tracking-normal font-normal ml-2 opacity-70">
							({isDark ? 'dark' : 'light'} mode)
						</span>
					</h3>
					<div className="mb-1">
						<RangeSliderControl
							value={rangeValue}
							onValueChange={updateLumRangeFromSlider}
							min={0}
							max={1}
							step={0.01}
							labelStart="Luminance min (1)"
							labelEnd="Luminance max (12)"
						/>
					</div>
					<div className="flex justify-between text-[0.75rem] font-mono text-lum-[50] mb-5">
						<span>min (1): {lumRange.min.toFixed(2)}</span>
						<span>max (12): {lumRange.max.toFixed(2)}</span>
					</div>

					{/* L stops strip */}
					<div className="text-[0.65rem] font-mono text-lum-[50] mb-1">
						bg-h-{selectedHue} &middot; bg-c-{selectedChroma.name} ({selectedChroma.val})
					</div>
					<div className="flex gap-[2px]">
						{lStopValues.map((l) => (
							<button
								key={l.name}
								type="button"
								onClick={() => setSelectedLStop(LUM_STOPS.find((s) => s.name === l.name)!)}
								className={`flex-1 flex flex-col items-center gap-1 cursor-pointer rounded-lg p-1 transition-colors ${selectedLStop.name === l.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
							>
								<div
									className="w-full aspect-[2/1] rounded-md border border-white/10"
									style={{ backgroundColor: `oklch(${l.value.toFixed(3)} ${selectedChroma.val} var(--hue-${selectedHue}))` }}
								/>
								<div className="text-[0.6rem] font-mono text-lum-[50] leading-none">
									bg-lum-{l.name}
								</div>
								<div className="text-[0.55rem] font-mono text-lum-[50] opacity-60 leading-none">
									{l.value.toFixed(2)}
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Chroma Stops */}
				<div className="p-5 rounded-xl border border-lum-9 bg-lum-10">
					<h3 className="text-xs uppercase tracking-[0.08em] text-lum-[50] font-semibold mb-4">
						Chroma Stops
					</h3>
					<div className="text-[0.65rem] font-mono text-lum-[50] mb-1">
						bg-h-{selectedHue} &middot; bg-lum-{selectedLStop.name} ({selectedLValue.toFixed(2)})
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
									style={{ backgroundColor: `oklch(${selectedLValue.toFixed(3)} ${c.val} var(--hue-${selectedHue}))` }}
								/>
								<div className="text-[0.6rem] font-mono text-lum-[50] leading-none">
									bg-c-{c.name}
								</div>
								<div className="text-[0.55rem] font-mono text-lum-[50] opacity-60 leading-none">
									{c.val}
								</div>
							</button>
						))}
					</div>
					<p className="text-[0.75rem] text-lum-[50] leading-relaxed">
						Chroma controls saturation intensity &mdash; from nearly
						neutral (<span className="font-mono">lo</span>) to fully
						vivid (<span className="font-mono">hi</span>).
					</p>
				</div>
			</div>

			{/* ── Selected Color Classes ─────────────────────────── */}
			<div className="p-5 rounded-xl border border-lum-9 bg-lum-10">
				{/* Hero: full LCH class */}
				<div className="flex items-center gap-4 mb-4">
					<div
						className="w-14 h-14 rounded-xl border border-white/10 shrink-0"
						style={{ backgroundColor: `oklch(${selectedLValue.toFixed(3)} ${selectedChroma.val} var(--hue-${selectedHue}))` }}
					/>
					<div className="flex flex-col gap-1">
						<code className="text-lg sm:text-xl font-mono font-semibold text-lum-[22] chroma-[12]">
							bg-{selectedLStop.name}-{selectedChroma.name}-{selectedHue}
						</code>
						<div className="text-[0.75rem] font-mono text-lum-[50] flex items-center gap-1 flex-wrap">
							<span>bg-</span>
							<span className="rounded bg-white/10 px-1.5 py-0.5">{selectedLStop.name}</span>
							<span>-</span>
							<span className="rounded bg-white/10 px-1.5 py-0.5">{selectedChroma.name}</span>
							<span>-</span>
							<span className="rounded bg-white/10 px-1.5 py-0.5">{selectedHue}</span>
							<span className="opacity-50 ml-1">=</span>
							<span className="opacity-50 ml-1">L - C - H</span>
						</div>
					</div>
				</div>

				{/* Individual property classes */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
					{[
						`bg-lum-${selectedLStop.name}`,
						`bg-c-${selectedChroma.name}`,
						`bg-h-${selectedHue}`,
					].map((cls) => (
						<div
							key={cls}
							className="flex items-center rounded-lg bg-white/5 px-3 py-2"
						>
							<code className="text-[0.75rem] font-mono text-lum-[22] chroma-[12] break-all">
								{cls}
							</code>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
