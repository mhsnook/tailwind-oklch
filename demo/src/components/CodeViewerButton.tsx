import { useState, useEffect, useCallback, useRef } from 'react'

export default function CodeViewerButton({ code }: { code: string }) {
	const [open, setOpen] = useState(false)
	const [highlighted, setHighlighted] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		if (!open) return
		let cancelled = false

		async function highlight() {
			const { codeToHtml } = await import('shiki')
			const html = await codeToHtml(code, {
				lang: 'html',
				theme: 'github-dark',
			})
			if (!cancelled) setHighlighted(html)
		}

		highlight()
		return () => {
			cancelled = true
		}
	}, [open, code])

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open) {
			dialog.showModal()
		} else {
			dialog.close()
			setHighlighted(null)
			setCopied(false)
		}
	}, [open])

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		})
	}, [code])

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="absolute top-2 right-2 p-1.5 rounded-md text-[0.7rem] font-mono leading-none opacity-40 hover:opacity-100 transition-opacity cursor-pointer bg-lc-0 bg-c-lo text-lc-fore"
				title="View source"
			>
				&lt;/&gt;
			</button>

			<dialog
				ref={dialogRef}
				onClose={() => setOpen(false)}
				className="m-auto max-w-[720px] w-[90vw] max-h-[80vh] rounded-xl p-0 border border-5-mlo-neutral bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm"
			>
				<div className="code-block rounded-xl overflow-hidden">
					<div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
						<span className="text-[0.75rem] font-mono text-white/50">
							HTML
						</span>
						<div className="flex items-center gap-2">
							<button
								onClick={handleCopy}
								className="text-[0.7rem] font-mono text-white/50 hover:text-white/90 transition-colors cursor-pointer px-2 py-1 rounded"
							>
								{copied ? 'Copied!' : 'Copy'}
							</button>
							<button
								onClick={() => setOpen(false)}
								className="text-[0.7rem] font-mono text-white/50 hover:text-white/90 transition-colors cursor-pointer px-2 py-1 rounded"
							>
								Close
							</button>
						</div>
					</div>
					<div className="p-4 overflow-auto max-h-[calc(80vh-3rem)]">
						{highlighted ? (
							<div
								className="font-mono text-[0.78rem] leading-[1.7] [&_pre]:!bg-transparent [&_code]:!bg-transparent"
								dangerouslySetInnerHTML={{ __html: highlighted }}
							/>
						) : (
							<pre className="font-mono text-[0.78rem] leading-[1.7] text-white/60">
								{code}
							</pre>
						)}
					</div>
				</div>
			</dialog>
		</>
	)
}
