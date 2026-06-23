"use client";

import { cn } from "@briom/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import * as React from "react";

function Accordion({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
	return (
		<AccordionPrimitive.Root
			className={cn("flex w-full flex-col", className)}
			data-slot="accordion"
			{...props}
		/>
	);
}

function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return (
		<AccordionPrimitive.Item
			className={cn("not-last:border-b", className)}
			data-slot="accordion-item"
			{...props}
		/>
	);
}

function AccordionTrigger({
	className,
	children,
	withIcon = true,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
	withIcon?: boolean;
}) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				className={cn(
					"group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
					className,
				)}
				data-slot="accordion-trigger"
				{...props}
			>
				{children}
				{withIcon && (
					<React.Fragment>
						<ChevronDownIcon
							className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
							data-slot="accordion-trigger-icon"
						/>
						<ChevronUpIcon
							className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
							data-slot="accordion-trigger-icon"
						/>
					</React.Fragment>
				)}
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionExpander({
	className,
	children,
	title,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
	title?: string;
}) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				asChild
				className={cn(
					"group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
					"flex items-center justify-between h-12 p-4 bg-muted/25 font-normal focus-visible:ring-transparent focus-visible:after:border-transparent border-transparent hover:no-underline cursor-pointer",
					className,
				)}
				data-slot="accordion-trigger"
				{...props}
			>
				<header>
					<div className="flex items-center gap-1">
						<span className="font-mono text-[10px] text-muted-foreground/50 group-hover/accordion-trigger:text-muted-foreground transition-colors group-aria-expanded/accordion-trigger:hidden">
							[+]
						</span>
						<span className="font-mono text-[10px] text-muted-foreground/50 group-hover/accordion-trigger:text-muted-foreground transition-colors hidden group-aria-expanded/accordion-trigger:inline">
							[-]
						</span>
						<h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							{title}
						</h3>
					</div>
					{children}
				</header>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
	return (
		<AccordionPrimitive.Content
			className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
			data-slot="accordion-content"
			{...props}
		>
			<div
				className={cn(
					"pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
					className,
				)}
			>
				{children}
			</div>
		</AccordionPrimitive.Content>
	);
}

export {
	Accordion,
	AccordionContent,
	AccordionExpander,
	AccordionItem,
	AccordionTrigger,
};
