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
								? 'bg-5-mhi text-0-lo ring-2 ring-offset-2 ring-offset-transparent'
								: 'bg-2-mid text-10-lo hover:bg-3-mid'
						}`}
					>
						{name}
					</button>
				))}
			</div>

			{/* Showcase container — hue class applied here */}
			<div className={`${hueClass[active]} rounded-xl border border-2-mlo p-6`}>
				<div className="grid gap-6 sm:grid-cols-2">
					{/* Card */}
					<div className="flex flex-col gap-4 rounded-lg border border-2-mlo bg-1-lo p-5">
						<div>
							<h4 className="text-10-lo mb-1 text-[0.9rem] font-semibold">
								Project Settings
							</h4>
							<p className="text-5-mlo text-[0.8rem] leading-relaxed">
								Manage your project configuration and team preferences.
							</p>
						</div>

						{/* Input */}
						<label className="flex flex-col gap-1.5">
							<span className="text-7-lo text-[0.78rem] font-medium">
								Project name
							</span>
							<input
								type="text"
								defaultValue="tailwind-oklch"
								className="bg-0-lo border-3-mlo text-8-lo placeholder:text-4-lo rounded-md border px-3 py-2 text-[0.82rem] outline-none transition-colors focus:border-c-mid"
							/>
						</label>

						{/* Select-style dropdown (static) */}
						<label className="flex flex-col gap-1.5">
							<span className="text-7-lo text-[0.78rem] font-medium">
								Visibility
							</span>
							<div className="bg-0-lo border-3-mlo text-7-lo flex items-center justify-between rounded-md border px-3 py-2 text-[0.82rem]">
								<span>Public</span>
								<svg
									className="text-5-lo"
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
							<button className="bg-5-mhi text-0-lo cursor-pointer rounded-md px-4 py-2 text-[0.8rem] font-semibold transition-colors hover:bg-lc-6">
								Save
							</button>
							<button className="border-3-mlo text-7-lo cursor-pointer rounded-md border bg-transparent px-4 py-2 text-[0.8rem] font-medium transition-colors hover:bg-1-lo">
								Cancel
							</button>
						</div>
					</div>

					{/* Right column — mixed elements */}
					<div className="flex flex-col gap-4">
						{/* Notification card */}
						<div className="bg-1-mlo flex items-start gap-3 rounded-lg p-4">
							<div className="bg-4-mhi mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
								<svg
									className="text-10-lo"
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
								<p className="text-9-lo text-[0.82rem] font-medium">
									3 new notifications
								</p>
								<p className="text-5-mlo text-[0.75rem]">
									You have unread messages from your team.
								</p>
							</div>
						</div>

						{/* Badges */}
						<div className="flex flex-wrap gap-2">
							<span className="bg-2-mid text-9-lo rounded-full px-3 py-1 text-[0.72rem] font-semibold">
								Active
							</span>
							<span className="bg-1-mlo text-7-lo rounded-full px-3 py-1 text-[0.72rem] font-medium">
								Draft
							</span>
							<span className="border-3-mlo text-6-mlo rounded-full border px-3 py-1 text-[0.72rem] font-medium">
								Archived
							</span>
						</div>

						{/* Toggle row */}
						<div className="border-2-mlo flex items-center justify-between rounded-lg border p-4">
							<div>
								<p className="text-9-lo text-[0.82rem] font-medium">
									Email notifications
								</p>
								<p className="text-5-mlo text-[0.75rem]">
									Receive updates about activity.
								</p>
							</div>
							<div className="bg-5-mhi relative h-6 w-11 rounded-full">
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
									className="bg-1-lo border-2-mlo rounded-lg border p-3 text-center"
								>
									<p className="text-9-mhi text-[1rem] font-bold">
										{value}
									</p>
									<p className="text-5-mlo text-[0.72rem]">
										{label}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Explainer */}
			<p className="text-5-lo-neutral text-[0.8rem] leading-relaxed">
				One{' '}
				<code className="text-6-mhi-primary font-mono text-[0.78rem]">
					hue-{active}
				</code>{' '}
				class on the container. Every element inside uses two-axis
				shorthands like{' '}
				<code className="text-6-mhi-primary font-mono text-[0.78rem]">
					bg-5-mhi
				</code>{' '}
				and{' '}
				<code className="text-6-mhi-primary font-mono text-[0.78rem]">
					text-10-lo
				</code>{' '}
				&mdash; no hue suffix needed. Click a different hue above and the
				entire showcase re-themes instantly.
			</p>
		</div>
	)
}
