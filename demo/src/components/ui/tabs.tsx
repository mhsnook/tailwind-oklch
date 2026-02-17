import * as React from 'react'
import { Tabs } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'

function TabsRoot({ className, ...props }: React.ComponentProps<typeof Tabs.Root>) {
	return <Tabs.Root className={cn('flex flex-col gap-2', className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof Tabs.List>) {
	return (
		<Tabs.List
			className={cn('border-b border-border inline-flex w-full items-center gap-1 overflow-x-auto overflow-y-hidden scrollbar-none', className)}
			{...props}
		/>
	)
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof Tabs.Tab>) {
	return (
		<Tabs.Tab
			className={cn(
				'inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 border-transparent -mb-px',
				'text-muted-foreground hover:text-foreground',
				'data-[selected]:text-foreground data-[selected]:border-primary',
				'focus-visible:outline-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	)
}

function TabsPanel({ className, ...props }: React.ComponentProps<typeof Tabs.Panel>) {
	return <Tabs.Panel className={cn('flex-1 outline-none', className)} {...props} />
}

export { TabsRoot, TabsList, TabsTrigger, TabsPanel }
