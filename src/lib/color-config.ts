export const HUES = [
	{ name: 'primary', default: 233 },
	{ name: 'accent', default: 350 },
	{ name: 'success', default: 145 },
	{ name: 'warning', default: 55 },
	{ name: 'danger', default: 15 },
	{ name: 'info', default: 220 },
] as const

export const L_STOPS = [
	{ name: 'base', val: 0.25 },
	{ name: 'subtle', val: 0.4 },
	{ name: 'mid', val: 0.55 },
	{ name: 'strong', val: 0.72 },
	{ name: 'full', val: 0.9 },
] as const

export const C_STOPS = [
	{ name: 'lo', val: 0.02 },
	{ name: 'mlo', val: 0.06 },
	{ name: 'mid', val: 0.12 },
	{ name: 'mhi', val: 0.18 },
	{ name: 'hi', val: 0.25 },
] as const

export type HueName = (typeof HUES)[number]['name']
