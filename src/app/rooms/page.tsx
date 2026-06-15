import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import { Plus } from "lucide-react";

import { getAvailableModels } from "../api/rooms/actions";
import { CreateRoomDialog } from "./_/create-room-dialog";

export default async function RoomsPage() {
	const result = await getAvailableModels();
	if (!result.success) throw new Error(result.error.message);
	const models = result.data;

	return (
		<div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
			<Logo className="text-muted-foreground/40" size={36} />

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

			<CreateRoomDialog availableModels={models}>
				<Button>
					<Plus />
					New room
				</Button>
			</CreateRoomDialog>
		</div>
	);
}
