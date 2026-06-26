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
import { useSidebar } from "@briom/components/ui/sidebar";
import { isServerError } from "@briom/libs/server-action";
import { useCloseRoomMutation } from "@briom/rooms/_/room/mutations/use-close-room.mutation";
import { Loader2Icon, MessageCircleOffIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function CloseRoom() {
	const [open, setOpen] = useState(false);
	const { roomId } = useParams<{ roomId: string }>();

	const sidebar = useSidebar();
	const router = useRouter();
	const mutation = useCloseRoomMutation();

	const handleConfirm = useCallback(async () => {
		const result = await mutation.mutateAsync({ roomId });

		if (isServerError(result)) {
			toast.error("Failed to close room", {
				description: result.error.message,
			});
			return;
		}

		setOpen(false);
		toast.success("Room closed", {
			description: "The room has been permanently closed.",
		});

		if (sidebar.open) sidebar.setOpen(false);
		router.push("/rooms");
	}, [
		mutation.mutateAsync,
		roomId,
		router.push,
		sidebar.open,
		sidebar.setOpen,
	]);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					variant="destructive"
				>
					<MessageCircleOffIcon className="size-4 mr-2" />
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
						onClick={() => setOpen(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={mutation.isPending}
						onClick={handleConfirm}
						variant="destructive"
					>
						{mutation.isPending ? (
							<>
								<Loader2Icon className="animate-spin" />
								Closing...
							</>
						) : (
							"Close Room"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
