export const HUES = [
	{ name: 'primary', default: 233 },
	{ name: 'accent', default: 350 },
	{ name: 'success', default: 145 },
	{ name: 'warning', default: 55 },
	{ name: 'danger', default: 15 },
	{ name: 'info', default: 220 },
] as const

/** 0–10 luminance scale. step = index into the scale (0 = surface, 10 = max contrast). */
export const L_STOPS = [
	{ name: '0', step: 0 },
	{ name: '1', step: 1 },
	{ name: '2', step: 2 },
	{ name: '3', step: 3 },
	{ name: '4', step: 4 },
	{ name: '5', step: 5 },
	{ name: '6', step: 6 },
	{ name: '7', step: 7 },
	{ name: '8', step: 8 },
	{ name: '9', step: 9 },
	{ name: '10', step: 10 },
] as const

/** Default luminance range endpoints (dark mode). */
export const LU_RANGE_DARK = { start: 0.12, end: 0.92 }
export const LU_RANGE_LIGHT = { start: 0.95, end: 0.15 }

/** Compute the OKLCH lightness for a given step and range. */
export function luValue(step: number, range: { start: number; end: number }) {
	return range.start + (range.end - range.start) * (step / 10)
}

export const C_STOPS = [
	{ name: 'lo', val: 0.02 },
	{ name: 'mlo', val: 0.06 },
	{ name: 'mid', val: 0.12 },
	{ name: 'mhi', val: 0.18 },
	{ name: 'hi', val: 0.25 },
] as const

export type HueName = (typeof HUES)[number]['name']
