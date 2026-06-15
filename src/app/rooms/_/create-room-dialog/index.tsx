"use client";

import { useProgress, useRouter } from "@bprogress/next";
import { createRoom } from "@briom/api/rooms/actions";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@briom/components/ui/dropdown-menu";
import { Input } from "@briom/components/ui/input";
import { Label } from "@briom/components/ui/label";
import { Loader2Icon, Plus } from "lucide-react";
import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";

import type { AvailableModelDTO } from "./available-models.data";
import { ParticipantRow, type StagedParticipant } from "./participant-row";

const MAX_PARTICIPANTS = 4;

interface CreateRoomDialogProps {
	availableModels: AvailableModelDTO[];
	children: React.ReactNode;
}

export function CreateRoomDialog({
	availableModels,
	children,
}: CreateRoomDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [participants, setParticipants] = useState<StagedParticipant[]>([]);
	const [pending, startTransition] = useTransition();

	const progress = useProgress();
	const router = useRouter();

	const disabled = participants.length === 0 || title.trim().length === 0;
	const addedModels = new Set(
		participants.map((p) => `${p.provider}/${p.model}`),
	);

	const groupedByProvider = availableModels
		.filter((m) => !addedModels.has(`${m.provider}/${m.model}`))
		.reduce<Record<string, AvailableModelDTO[]>>((acc, m) => {
			// biome-ignore lint/suspicious/noAssignInExpressions: idc
			(acc[m.provider] ??= []).push(m);
			return acc;
		}, {});

	function reset() {
		setTitle("");
		setParticipants([]);
	}

	function handleOpenChange(next: boolean) {
		if (!pending) {
			setOpen(next);
			if (!next) reset();
		}
	}

	function handleAddParticipant(model: AvailableModelDTO) {
		if (participants.length >= MAX_PARTICIPANTS) return;
		const newModel = {
			displayName: model.displayName,
			key: model.model,
			model: model.model,
			provider: model.provider,
		};
		setParticipants((prev) => [...prev, newModel]);
	}

	function handleParticipantChange(next: StagedParticipant) {
		setParticipants((prev) => prev.map((p) => (p.key === next.key ? next : p)));
	}

	function handleParticipantRemove(key: string) {
		setParticipants((prev) => prev.filter((p) => p.key !== key));
	}

	async function handleSubmit() {
		if (!title.trim()) return toast.error("Give your room a name first.");
		if (participants.length === 0) {
			return toast.error("Add at least one AI participant.");
		}

		progress.start(0, 0, false);
		startTransition(async () => {
			const result = await createRoom(
				title.trim(),
				participants.map((p) => ({
					displayName: p.displayName.trim() || p.model,
					model: p.model,
					provider: p.provider,
				})),
			);

			progress.stop();

			if (!result.success) {
				toast.error("Couldn't create room", {
					description: result.error.message,
				});
				return;
			}

			setOpen(false);
			router.replace(`/rooms/${result.data.roomId}`);
		});
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>New room</DialogTitle>
					<DialogDescription>
						Name your room and invite up to {MAX_PARTICIPANTS} AI participants
						to join the discussion.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-5">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="room-title">Room name</Label>
						<Input
							autoFocus
							id="room-title"
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Rethinking our onboarding flow"
							value={title}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label>Participants</Label>
							<span className="text-xs text-muted-foreground font-mono">
								{participants.length}/{MAX_PARTICIPANTS}
							</span>
						</div>

						<div className="flex flex-col gap-2">
							{participants.map((participant) => (
								<ParticipantRow
									canRemove={participants.length > 1}
									key={participant.key}
									onChange={handleParticipantChange}
									onRemove={() => handleParticipantRemove(participant.key)}
									participant={participant}
								/>
							))}
						</div>

						{participants.length < MAX_PARTICIPANTS && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div className="w-full">
										<Button
											className="self-start text-muted-foreground"
											size="sm"
											type="button"
											variant="ghost"
										>
											<Plus className="size-3.5" />
											Add participant
										</Button>
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="max-h-64">
									{Object.entries(groupedByProvider).map(
										([provider, models], index) => (
											<Fragment key={index.toString()}>
												{index !== 0 && <DropdownMenuSeparator />}
												<DropdownMenuGroup>
													<DropdownMenuLabel>{provider}</DropdownMenuLabel>
													{models.map((m) => (
														<DropdownMenuItem
															key={`${m.provider}/${m.model}`}
															onClick={() => handleAddParticipant(m)}
														>
															{m.displayName}
														</DropdownMenuItem>
													))}
												</DropdownMenuGroup>
											</Fragment>
										),
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						disabled={pending}
						onClick={() => handleOpenChange(false)}
						type="button"
						variant="ghost"
					>
						Cancel
					</Button>
					<Button
						disabled={disabled || pending}
						onClick={handleSubmit}
						type="button"
					>
						{pending ? (
							<Fragment>
								<Loader2Icon className="animate-spin" />
								Creating...
							</Fragment>
						) : (
							"Create room"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
