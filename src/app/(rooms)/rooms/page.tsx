import { Logo } from "@briom/components/logo";

import { RoomFormDialogTrigger, SidebarButtonExpander } from "./room-composer";

export default async function RoomsPage() {
	return (
		<div className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-24 text-center">
			<SidebarButtonExpander />

			<Logo animate className="text-muted-foreground/40" size={40} />

			<div className="flex flex-col gap-2">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					No room selected
				</p>
				<h1 className="font-serif text-2xl sm:text-3xl">
					Pick a room, or start a new one
				</h1>
				<p className="max-w-md text-sm text-muted-foreground leading-relaxed">
					Choose a conversation from the list, or open a new room and invite a
					few AI participants to think it through with you.
				</p>
			</div>

			<RoomFormDialogTrigger />
		</div>
	);
}
