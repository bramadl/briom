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
import { Loader2Icon, MessageCircleOffIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useCloseRoomMutation } from "../../hooks/use-close-room-mutation";

export function CloseRoomOption() {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const { roomId } = useParams<{ roomId: string }>();
	const mutation = useCloseRoomMutation(roomId);

	const closeDialog = () => void setIsOpen(false);
	const closeRoom = () => {
		void mutation.mutate({ roomId }, { onSuccess: closeDialog });
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					variant="destructive"
				>
					<MessageCircleOffIcon />
					Close Room
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Close Room</DialogTitle>
					<DialogDescription>
						This will permanently close this room and all its deliberation
						history. This action cannot be undone.
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
					<Button
						disabled={mutation.isPending}
						onClick={closeRoom}
						variant="destructive"
					>
						{mutation.isPending && <Loader2Icon className="animate-spin" />}
						{mutation.isPending ? "Closing..." : "Close Room"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
