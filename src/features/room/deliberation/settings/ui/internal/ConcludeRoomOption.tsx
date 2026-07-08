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
import { ConciergeBellIcon, Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useConcludeRoomMutation } from "../../hooks/use-conclude-room-mutation";

export function ConcludeRoomOption() {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const { roomId } = useParams<{ roomId: string }>();
	const mutation = useConcludeRoomMutation(roomId);

	const closeDialog = () => void setIsOpen(false);
	const concludeRoom = () => {
		void mutation.mutate({ roomId }, { onSuccess: closeDialog });
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<ConciergeBellIcon />
					Conclude Room
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Conclude Room</DialogTitle>
					<DialogDescription>
						This will archive the room and make all its deliberation history
						read-only. No further changes can be made, but you can still view it
						anytime.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={mutation.isPending}
						onClick={closeDialog}
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={mutation.isPending} onClick={concludeRoom}>
						{mutation.isPending && <Loader2Icon className="animate-spin" />}
						{mutation.isPending ? "Concluding..." : "Conclude Room"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
