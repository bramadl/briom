"use client";

import type { ParticipantModelDTO } from "@briom/app";
import { Badge } from "@briom/components/ui/badge";
import { Button } from "@briom/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxTrigger,
} from "@briom/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@briom/components/ui/dialog";
import { Input } from "@briom/components/ui/input";
import { Label } from "@briom/components/ui/label";
import { useIsMobile } from "@briom/hooks/use-mobile";
import { isServerError } from "@briom/libs/server-action";
import { cn } from "@briom/libs/utils";
import { useParticipantSelector } from "@briom/rooms/_/participant/hooks/use-participant-selector";
import { useInviteParticipantMutation } from "@briom/rooms/_/participant/mutations/use-invite-participant.mutation";
import { ParticipantBadge } from "@briom/rooms/_/participant/ui/participant-badge";
import { Loader2Icon, UserPlus2Icon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface InviteParticipantProps {
	existingParticipants?: Array<{ model: string; name: string }>;
	roomId: string;
}

export function InviteParticipant({
	roomId,
	existingParticipants = [],
}: InviteParticipantProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [selectedModel, setSelectedModel] =
		useState<ParticipantModelDTO | null>(null);

	const dialogRef = useRef<HTMLDivElement>(null);
	const chosenParticipants = useMemo(
		() => existingParticipants.map((p) => p.model).join(","),
		[existingParticipants],
	);

	const inviteMutation = useInviteParticipantMutation();
	const { filteredModels, isDeferring, isFreeModels } = useParticipantSelector({
		chosenParticipants,
		search,
	});

	const handleOpenChange = useCallback((open: boolean) => {
		setOpen(open);
		if (!open) {
			setSearch("");
			setSelectedModel(null);
			setDisplayName("");
		}
	}, []);

	const handleSelectModel = useCallback(
		(model: ParticipantModelDTO | null) => {
			setSelectedModel(model);
			if (model && !displayName) {
				setDisplayName(model.name);
			}
		},
		[displayName],
	);

	const handleInvite = async () => {
		if (!selectedModel || !displayName.trim()) return;

		const result = await inviteMutation.mutateAsync({
			roomId,
			displayName: displayName.trim(),
			model: selectedModel.model,
			provider: selectedModel.provider,
		});

		if (isServerError(result)) {
			toast.error("Failed to invite participant", {
				description: result.error.message,
			});
			return;
		}

		toast.success(`${displayName.trim()} invited`, {
			description: `${selectedModel.provider}/${selectedModel.model} is ready to deliberate.`,
		});

		handleOpenChange(false);
	};

	const canSubmit =
		selectedModel && displayName.trim().length > 0 && !inviteMutation.isPending;

	const isMobile = useIsMobile();

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button size={isMobile ? "icon" : "default"} variant="secondary">
					<UserPlus2Icon className="size-4" />
					<span className="hidden sm:inline">Invite Participant</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md gap-0" ref={dialogRef}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Invite a Perspective
					</DialogTitle>
					<DialogDescription>
						Choose an AI model and give it a name to join this deliberation.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 my-4">
					<div className="flex flex-col gap-2.5">
						<Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
							Select Model
						</Label>
						<Combobox
							filter={null}
							inputValue={search}
							items={filteredModels}
							itemToStringLabel={(item: ParticipantModelDTO) => item.name}
							onInputValueChange={(value) => setSearch(value)}
							onValueChange={handleSelectModel}
							virtualized
						>
							<ComboboxTrigger
								render={
									<Button
										className="w-full justify-between font-normal text-muted-foreground focus-visible:border-primary! text-base md:text-sm"
										variant="outline"
									>
										{selectedModel ? (
											<span className="flex items-center gap-2 min-w-0">
												<span className="text-sm font-medium truncate">
													{selectedModel.name}
												</span>
												<span className="text-xs text-muted-foreground font-mono shrink-0">
													{selectedModel.provider}
												</span>
											</span>
										) : (
											<span className="text-muted-foreground">
												Search models...
											</span>
										)}
										<UserPlus2Icon className="size-4 text-muted-foreground shrink-0" />
									</Button>
								}
							/>
							<ComboboxContent
								className="min-w-full w-(--anchor-width)"
								container={dialogRef}
							>
								<ComboboxInput
									autoComplete="off"
									className="has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0"
									placeholder="@free anthropic, gpt, google"
									showTrigger={false}
								/>
								<ComboboxEmpty>No models match your search.</ComboboxEmpty>
								<ComboboxList
									className={cn(
										"max-h-64 overflow-y-auto",
										isDeferring && "opacity-60 transition-opacity",
									)}
								>
									{filteredModels.map((group, index) => (
										<div key={group.label}>
											{index !== 0 && <ComboboxSeparator />}
											<ComboboxGroup items={group.items}>
												<ComboboxLabel>{group.label}</ComboboxLabel>
												{group.items.map((item) => (
													<ComboboxItem
														disabled={isFreeModels && !item.isFree}
														key={item.id}
														value={item}
													>
														<span className="flex-1">{item.name}</span>
														{!item.isFree && (
															<Badge
																className="ml-auto text-[10px]"
																variant="secondary"
															>
																Paid
															</Badge>
														)}
													</ComboboxItem>
												))}
											</ComboboxGroup>
										</div>
									))}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
					</div>

					<div className="flex flex-col gap-2.5">
						<Label
							className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
							htmlFor="invite-display-name"
						>
							Display Name
						</Label>
						<Input
							autoComplete="off"
							id="invite-display-name"
							onChange={(e) => setDisplayName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && canSubmit) {
									e.preventDefault();
									handleInvite();
								}
							}}
							placeholder="e.g., Claude, GPT-4, Gemini..."
							value={displayName}
						/>
					</div>

					{selectedModel && (
						<div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
							<p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
								Preview
							</p>
							<div className="flex items-center gap-3">
								<ParticipantBadge
									name={displayName || selectedModel.name}
									participantId={selectedModel.id}
								/>
								<div className="flex flex-col min-w-0">
									<span className="text-sm font-medium truncate">
										{displayName || selectedModel.name}
									</span>
									<span className="text-xs text-muted-foreground font-mono truncate">
										{selectedModel.model}
									</span>
								</div>
								{!selectedModel.isFree && (
									<Badge className="ml-auto text-[10px]" variant="secondary">
										Paid
									</Badge>
								)}
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						disabled={inviteMutation.isPending}
						onClick={() => handleOpenChange(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={!canSubmit} onClick={handleInvite}>
						{inviteMutation.isPending ? (
							<>
								<Loader2Icon className="animate-spin size-4" />
								Inviting...
							</>
						) : (
							<>
								<UserPlus2Icon className="size-4" />
								Invite Participant
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
