import { RoomFormHotkey, RoomFormTrigger } from "@briom/app/_/room";
import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import { SidebarTrigger } from "@briom/components/ui/sidebar";

export default function RoomsPage() {
	return (
		<main className="relative min-h-full flex-1 flex items-center justify-center">
			<Button
				asChild
				className="absolute left-4 top-4 md:hidden"
				variant="outline"
			>
				<SidebarTrigger />
			</Button>
			<div className="size-full max-w-xl flex flex-col items-center justify-center gap-6 px-16 text-center">
				<Logo animate className="text-muted-foreground/40" size={40} />
				<div className="flex flex-col gap-2">
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
						No room selected
					</p>
					<h1 className="font-serif text-2xl sm:text-3xl">
						Pick a room, or start a new one
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Choose a conversation from the list, or open a new room and invite a
						few AI participants to think it through with you.
					</p>
				</div>
				<RoomFormTrigger />
			</div>
			<RoomFormHotkey />
		</main>
	);
}
