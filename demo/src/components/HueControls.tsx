import { useState, useCallback } from 'react'
import { SliderControl } from '@/components/ui/slider'
import { HUES } from '@/lib/color-config'

export default function HueControls() {
	const [values, setValues] = useState<Record<string, number>>(
		Object.fromEntries(HUES.map((h) => [h.name, h.default])),
	)

	const updateHue = useCallback((name: string, val: number) => {
		setValues((prev) => ({ ...prev, [name]: val }))
		document.documentElement.style.setProperty(`--hue-${name}`, String(val))
		window.dispatchEvent(new CustomEvent('hue-change'))
	}, [])

	return (
		<div className="flex gap-6 flex-wrap p-6 bg-lc-1 bg-c-lo bg-h-primary rounded-xl border border-lc-2 border-c-lo border-h-primary">
			{HUES.map((hue) => (
				<div key={hue.name} className="flex flex-col gap-1.5 min-w-[180px]">
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
	)
}
