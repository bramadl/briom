import { AccordionExpander } from "@briom/components/ui/accordion";

interface RoomInformationHeaderProps {
	children?: React.ReactNode;
	title: string;
}

export function RoomInformationHeader({
	children,
	title,
}: RoomInformationHeaderProps) {
	return (
		<AccordionExpander className="flex items-center justify-between h-12 p-4 bg-muted/25 font-normal focus-visible:ring-transparent focus-visible:after:border-transparent border-transparent hover:no-underline cursor-pointer">
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
		</AccordionExpander>
	);
}
