import { useState } from 'react'
import type { HueName } from '@/lib/color-config'
import { HUES } from '@/lib/color-config'

const hueNames = HUES.map((h) => h.name)

/* Static maps so Tailwind can see every class at scan time */
const hueClass: Record<HueName, string> = {
	primary: 'hue-primary',
	accent: 'hue-accent',
	success: 'hue-success',
	warning: 'hue-warning',
	danger: 'hue-danger',
	info: 'hue-info',
}

export default function HueContextDemo() {
	const [active, setActive] = useState<HueName>('primary')

	return (
		<div className="flex flex-col gap-6">
			{/* Hue selector buttons */}
			<div className="flex flex-wrap gap-2">
				{hueNames.map((name) => (
					<button
						key={name}
						onClick={() => setActive(name)}
						className={`${hueClass[name]} cursor-pointer rounded-lg px-4 py-2 text-[0.82rem] font-semibold transition-all duration-150 ${
							active === name
								? 'bg-lum-6 chroma-mhi text-lum-12 ring-2 ring-offset-2 ring-offset-transparent'
								: 'bg-lum-9 chroma-mid text-lum-1 hover:bg-lum-8'
						}`}
					>
						{name}
					</button>
				))}
			</div>

			{/* Showcase container — hue class applied here */}
			<div className={`${hueClass[active]} rounded-xl border border-lum-9 p-6`}>
				<div className="grid gap-6 sm:grid-cols-2">
					{/* Card */}
					<div className="flex flex-col gap-4 rounded-lg border border-lum-9 bg-lum-11 p-5">
						<div>
							<h4 className="text-lum-1 mb-1 text-[0.9rem] font-semibold">
								Project Settings
							</h4>
							<p className="text-lum-6 chroma-lo text-[0.8rem] leading-relaxed">
								Manage your project configuration and team preferences.
							</p>
						</div>

						{/* Input */}
						<label className="flex flex-col gap-1.5">
							<span className="text-lum-4 text-[0.78rem] font-medium">
								Project name
							</span>
							<input
								type="text"
								defaultValue="tailwind-oklch"
								className="bg-lum-12 border-lum-8 text-lum-3 placeholder:text-lum-7 rounded-md border px-3 py-2 text-[0.82rem] outline-none transition-colors focus:border-c-mid"
							/>
						</label>

						{/* Select-style dropdown (static) */}
						<label className="flex flex-col gap-1.5">
							<span className="text-lum-4 text-[0.78rem] font-medium">
								Visibility
							</span>
							<div className="bg-lum-12 border-lum-8 text-lum-4 flex items-center justify-between rounded-md border px-3 py-2 text-[0.82rem]">
								<span>Public</span>
								<svg
									className="text-lum-6"
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</div>
						</label>

						{/* Buttons */}
						<div className="flex gap-2 pt-1">
							<button className="bg-lum-6 chroma-mhi text-lum-12 cursor-pointer rounded-md px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:bg-lum-5">
								Save
							</button>
							<button className="border-lum-8 text-lum-4 cursor-pointer rounded-md border bg-transparent px-4 py-2 text-[0.8rem] font-medium transition-colors hover:bg-lum-11">
								Cancel
							</button>
						</div>
					</div>

					{/* Right column — mixed elements */}
					<div className="flex flex-col gap-4">
						{/* Notification card */}
						<div className="bg-lum-11 chroma-mlo flex items-start gap-3 rounded-lg p-4">
							<div className="bg-lum-7 chroma-mhi mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
								<svg
									className="text-lum-1"
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
									<path d="M13.73 21a2 2 0 0 1-3.46 0" />
								</svg>
							</div>
							<div>
								<p className="text-lum-2 text-[0.82rem] font-medium">
									3 new notifications
								</p>
								<p className="text-lum-6 chroma-lo text-[0.75rem]">
									You have unread messages from your team.
								</p>
							</div>
						</div>

						{/* Badges */}
						<div className="flex flex-wrap gap-2">
							<span className="bg-lum-9 chroma-mid text-lum-2 rounded-full px-3 py-1 text-[0.72rem] font-semibold">
								Active
							</span>
							<span className="bg-lum-11 chroma-mlo text-lum-4 rounded-full px-3 py-1 text-[0.72rem] font-medium">
								Draft
							</span>
							<span className="border-lum-8 text-lum-5 chroma-mlo rounded-full border px-3 py-1 text-[0.72rem] font-medium">
								Archived
							</span>
						</div>

						{/* Toggle row */}
						<div className="border-lum-9 flex items-center justify-between rounded-lg border p-4">
							<div>
								<p className="text-lum-2 text-[0.82rem] font-medium">
									Email notifications
								</p>
								<p className="text-lum-6 chroma-lo text-[0.75rem]">
									Receive updates about activity.
								</p>
							</div>
							<div className="bg-lum-6 chroma-mhi relative h-6 w-11 rounded-full">
								<div className="absolute top-1 left-[calc(100%-1.25rem-0.25rem)] h-4 w-5 rounded-full bg-white transition-all" />
							</div>
						</div>

						{/* Stats row */}
						<div className="grid grid-cols-3 gap-3">
							{[
								{ label: 'Users', value: '2,847' },
								{ label: 'Revenue', value: '$48k' },
								{ label: 'Growth', value: '+12%' },
							].map(({ label, value }) => (
								<div
									key={label}
									className="bg-lum-11 border-lum-9 rounded-lg border p-3 text-center"
								>
									<p className="text-lum-2 chroma-mhi text-[1rem] font-bold">
										{value}
									</p>
									<p className="text-lum-6 chroma-lo text-[0.72rem]">
										{label}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Explainer */}
			<p className="hue-neutral text-lum-6 chroma-lo text-[0.8rem] leading-relaxed">
				One{' '}
				<code className="hue-primary text-lum-5 chroma-mhi font-mono text-[0.78rem]">
					hue-{active}
				</code>{' '}
				class on the container. Every element inside uses{' '}
				<code className="hue-primary text-lum-5 chroma-mhi font-mono text-[0.78rem]">
					bg-lum-N
				</code>{' '}
				and{' '}
				<code className="hue-primary text-lum-5 chroma-mhi font-mono text-[0.78rem]">
					chroma-mid
				</code>{' '}
				&mdash; no hue suffix needed. Click a different hue above and the
				entire showcase re-themes instantly.
			</p>
		</div>
	)
}
