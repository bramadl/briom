"use client";

import { Button } from "@briom/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@briom/components/ui/dialog";
import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { useConcludeRoomMutation } from "@briom/rooms/_/room/mutations/use-conclude-room.mutation";
import { ConciergeBellIcon, Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ConcludeRoom() {
	const [open, setOpen] = useState(false);

	const { roomId } = useParams<{ roomId: string }>();
	const mutation = useConcludeRoomMutation();

	const handleConfirm = async () => {
		try {
			await mutation.mutateAsync({ roomId });
			setOpen(false);
		} catch (error) {
			toast.error("Cannot conclude room", {
				description: (error as Error).message,
			});
		}
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<ConciergeBellIcon className="size-4 mr-2" />
					Conclude Discussion
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Conclude this deliberation?</DialogTitle>
					<DialogDescription>
						This will permanently end the discussion. No further turns can be
						initiated, and the room becomes read-only. This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={mutation.isPending}
						onClick={() => setOpen(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={mutation.isPending} onClick={handleConfirm}>
						{mutation.isPending ? (
							<>
								<Loader2Icon className="animate-spin size-4" />
								Concluding...
							</>
						) : (
							"Conclude"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
