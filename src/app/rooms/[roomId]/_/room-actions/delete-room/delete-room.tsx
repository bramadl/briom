import { useProgress, useRouter } from "@bprogress/next";
import { deleteRoom } from "@briom/api/rooms/actions";
import { Button } from "@briom/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@briom/components/ui/dialog";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteRoomProps extends React.PropsWithChildren {
	onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
	open: boolean;
	roomId: string;
}

export function DeleteRoom({
	children,
	onOpenChange,
	open,
	roomId,
}: DeleteRoomProps) {
	const [pending, startTransition] = useTransition();

	const progress = useProgress();
	const router = useRouter();

	async function handleDelete() {
		progress.start(0, 0, false);
		startTransition(async () => {
			const result = await deleteRoom(roomId);
			if (!result.success) {
				toast.error("Failed to delete the room", {
					description: result.error.message,
				});
			}

			onOpenChange(false);
			router.replace("/rooms");
			progress.stop();
		});
	}

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ini Title</DialogTitle>
					<DialogDescription>Ini Description</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild disabled={pending}>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button
						disabled={pending}
						onClick={handleDelete}
						variant="destructive"
					>
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
