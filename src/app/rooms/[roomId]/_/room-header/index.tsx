import { Button } from "@briom/components/ui/button";
import { SidebarTrigger } from "@briom/components/ui/sidebar";
import { EllipsisVertical, ScrollText, Share2 } from "lucide-react";

interface RoomHeaderProps {
	title: string;
}

export function RoomHeader({ title }: RoomHeaderProps) {
	return (
		<header className="shrink-0 h-14 px-4 lg:px-6 flex items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
			<div className="flex items-center gap-4">
				<SidebarTrigger className="md:hidden" />
				<h1 className="font-serif text-lg truncate">{title}</h1>
			</div>
			<div className="ml-auto flex items-center gap-1.5">
				<Button className="hidden md:flex" variant="secondary">
					<ScrollText />
					Summarize
				</Button>
				<Button className="hidden md:flex" variant="secondary">
					<Share2 />
					Share
				</Button>
				<Button size="icon" variant="secondary">
					<EllipsisVertical />
				</Button>
			</div>
		</header>
	);
}
