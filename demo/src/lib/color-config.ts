export const HUES = [
	{ name: 'primary', default: 233 },
	{ name: 'accent', default: 350 },
	{ name: 'success', default: 145 },
	{ name: 'warning', default: 55 },
	{ name: 'danger', default: 15 },
	{ name: 'info', default: 220 },
] as const

/** Full luminance scale: 12 bezier-distributed stops. */
export const LUM_STOPS = [
	{ name: '1', stop: 1 },
	{ name: '2', stop: 2 },
	{ name: '3', stop: 3 },
	{ name: '4', stop: 4 },
	{ name: '5', stop: 5 },
	{ name: '6', stop: 6 },
	{ name: '7', stop: 7 },
	{ name: '8', stop: 8 },
	{ name: '9', stop: 9 },
	{ name: '10', stop: 10 },
	{ name: '11', stop: 11 },
	{ name: '12', stop: 12 },
] as const

/** Subset of LUM stops for compact demo grids. */
export const LUM_STOPS_COMPACT = [
	{ name: '1', stop: 1 },
	{ name: '4', stop: 4 },
	{ name: '6', stop: 6 },
	{ name: '9', stop: 9 },
	{ name: '12', stop: 12 },
] as const

/** Default bezier control points: cubic-bezier(0.35, 0.24, 0.68, 0.93) */
export const DEFAULT_BEZIER: [number, number, number, number] = [0.35, 0.24, 0.68, 0.93]

/** Default luminance range endpoints (mode-independent).
 *  The bezier curve always maps between min and max.
 *  Dark mode reverses which stop gets which value. */
export const LUM_RANGE = { min: 0.12, max: 0.96 }

function cubicBezierY(t: number, _x1: number, y1: number, _x2: number, y2: number): number {
	const mt = 1 - t
	return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t
}

function cubicBezierX(t: number, x1: number, _y1: number, x2: number, _y2: number): number {
	const mt = 1 - t
	return 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t
}

function solveBezierT(x: number, x1: number, y1: number, x2: number, y2: number): number {
	let t = x
	for (let i = 0; i < 8; i++) {
		const currentX = cubicBezierX(t, x1, y1, x2, y2)
		const dx = currentX - x
		if (Math.abs(dx) < 1e-7) break
		const mt = 1 - t
		const dXdt = 3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2)
		if (Math.abs(dXdt) < 1e-7) break
		t -= dx / dXdt
	}
	return t
}

/**
 * Generate luminance scale values from a cubic bezier curve.
 * Returns 12 values (for stops 1-12) mapped between min and max.
 */
export function generateLumScale(
	min: number,
	max: number,
	bezier: [number, number, number, number] = DEFAULT_BEZIER,
): number[] {
	const [x1, y1, x2, y2] = bezier
	const values: number[] = []

	for (let i = 1; i <= 12; i++) {
		const x = (i - 1) / 11
		const t = solveBezierT(x, x1, y1, x2, y2)
		const y = cubicBezierY(t, x1, y1, x2, y2)
		const lum = min + (max - min) * y
		values.push(Math.round(lum * 100) / 100)
	}

	return values
}

/** Compute the OKLCH lightness for a given stop (1-12) and range. */
export function lumValue(
	stop: number,
	range: { min: number; max: number },
	bezier: [number, number, number, number] = DEFAULT_BEZIER,
): number {
	const [x1, y1, x2, y2] = bezier
	const x = (stop - 1) / 11
	const t = solveBezierT(x, x1, y1, x2, y2)
	const y = cubicBezierY(t, x1, y1, x2, y2)
	return range.min + (range.max - range.min) * y
}

export const C_STOPS = [
	{ name: 'lo', val: 0.02 },
	{ name: 'mlo', val: 0.06 },
	{ name: 'mid', val: 0.12 },
	{ name: 'mhi', val: 0.18 },
	{ name: 'hi', val: 0.25 },
] as const

export type HueName = (typeof HUES)[number]['name']
