import * as React from 'react'
import { Slider } from '@base-ui/react/slider'
import { cn } from '@/lib/utils'

interface SliderControlProps {
	value: number
	onValueChange: (value: number) => void
	min?: number
	max?: number
	step?: number
	label?: string
	className?: string
}

function SliderControl({
	value,
	onValueChange,
	min = 0,
	max = 100,
	step = 1,
	label,
	className,
}: SliderControlProps) {
	return (
		<Slider.Root
			value={value}
			onValueChange={(val) => onValueChange(val as number)}
			min={min}
			max={max}
			step={step}
			className={cn('relative flex w-full touch-none items-center select-none', className)}
		>
			<Slider.Control className="flex w-full items-center py-2">
				<Slider.Track className="bg-black/15 dark:bg-white/15 relative h-1.5 w-full grow overflow-hidden rounded-full">
					<Slider.Indicator className="bg-primary absolute h-full rounded-full" />
					<Slider.Thumb
						aria-label={label}
						className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
					/>
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	)
}

export { SliderControl }
