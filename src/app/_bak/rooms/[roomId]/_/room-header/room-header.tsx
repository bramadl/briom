import { SidebarTrigger } from "@briom/components/ui/sidebar";

interface RoomHeaderProps {
	children?: React.ReactNode;
	title: string;
}

export function RoomHeader({ children, title }: RoomHeaderProps) {
	return (
		<header className="shrink-0 h-14 px-4 lg:px-6 flex items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
			<div className="flex items-center gap-4">
				<SidebarTrigger className="md:hidden" />
				<h1 className="font-serif text-lg truncate">{title}</h1>
			</div>
			{children}
		</header>
	);
}
