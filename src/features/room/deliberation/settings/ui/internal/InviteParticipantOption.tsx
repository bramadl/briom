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
import { Field, FieldLabel } from "@briom/components/ui/field";
import { Input } from "@briom/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@briom/components/ui/input-group";
import { Separator } from "@briom/components/ui/separator";
import { RoomParticipantGrid } from "@briom/room/form/ui/internal/RoomParticipantGrid";
import { RoomParticipantSelectionItem } from "@briom/room/form/ui/internal/RoomParticipantSelectionItem";
import { useRoom } from "@briom/room/hooks/use-room";
import {
	type ParticipantModel,
	toParticipantModel,
} from "@briom/room/participant/adapters/participant-model.adapter";
import { useParticipantModels } from "@briom/room/participant/hooks/use-participant-models";
import { FEATURED_MODEL_IDS } from "@briom/room/participant/settings/model-ranking";
import { Loader2Icon, SearchIcon, UserPlus2Icon } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { useInviteParticipantMutation } from "../../hooks/use-invite-participant-mutation";

const MAX_DISPLAY_NAME_LENGTH = 64;

function isFeatured(model: ParticipantModel): boolean {
	return FEATURED_MODEL_IDS.has(model.id);
}

function parseModelQuery(rawQuery: string): {
	freeOnly: boolean;
	text: string;
} {
	const trimmed = rawQuery.trim();
	const freeOnly = /^@free\b/i.test(trimmed);
	const text = trimmed
		.replace(/^@free\b/i, "")
		.trim()
		.toLowerCase();
	return { freeOnly, text };
}

function filterModels(
	models: ParticipantModel[],
	existingIds: Set<string>,
	rawQuery: string,
): ParticipantModel[] {
	const { freeOnly, text } = parseModelQuery(rawQuery);

	return models
		.filter((model) => !existingIds.has(model.id))
		.filter((model) => {
			if (freeOnly && !model.isFree) return false;
			if (!text) return true;
			return (
				model.name.toLowerCase().includes(text) ||
				model.provider.toLowerCase().includes(text) ||
				model.id.toLowerCase().includes(text)
			);
		})
		.sort((a, b) => {
			const featuredDiff = Number(isFeatured(b)) - Number(isFeatured(a));
			if (featuredDiff !== 0) return featuredDiff;
			const freeDiff = Number(b.isFree) - Number(a.isFree);
			if (freeDiff !== 0) return freeDiff;
			return a.name.localeCompare(b.name);
		});
}

export function InviteParticipantOption() {
	const { room, roomId, canInviteParticipant } = useRoom();
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<ParticipantModel | null>(null);
	const [displayName, setDisplayName] = useState("");

	const deferredQuery = useDeferredValue(query);
	const isFiltering = query !== deferredQuery;

	const { data, isLoading } = useParticipantModels();
	const mutation = useInviteParticipantMutation(roomId);

	const existingIds = useMemo(
		() =>
			new Set(
				room.info.participants.map(
					(p) =>
						`${p.model.split("/")[0]}/${p.model.split("/").slice(1).join("/")}`,
				),
			),
		[room.info.participants],
	);

	const models = useMemo(
		() => (data?.data ?? []).map(toParticipantModel),
		[data],
	);

	const filteredModels = useMemo(
		() => filterModels(models, existingIds, deferredQuery),
		[models, existingIds, deferredQuery],
	);

	useEffect(() => {
		setDisplayName(selected?.name ?? "");
	}, [selected]);

	const trimmedName = displayName.trim();
	const canSubmit = !!selected && trimmedName.length > 0;

	const closeDialog = () => {
		setIsOpen(false);
		setSelected(null);
		setDisplayName("");
		setQuery("");
	};

	const invite = () => {
		if (!selected || !trimmedName) return;
		mutation.mutate(
			{
				roomId,
				displayName: trimmedName.slice(0, MAX_DISPLAY_NAME_LENGTH),
				model: selected.model,
				provider: selected.provider,
			},
			{ onSuccess: closeDialog },
		);
	};

	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) closeDialog();
				else setIsOpen(true);
			}}
			open={isOpen}
		>
			<DialogTrigger asChild>
				<DropdownMenuItem
					disabled={!canInviteParticipant}
					onSelect={(e) => e.preventDefault()}
				>
					<UserPlus2Icon />
					Invite Participant
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[calc(80%-2rem)] h-full max-h-[80%] flex flex-col gap-0 p-0 overflow-hidden">
				<DialogHeader className="p-4">
					<DialogTitle>Invite Participant</DialogTitle>
					<DialogDescription>
						Pick one AI perspective to bring into this room. You can invite
						again afterwards, one at a time.
					</DialogDescription>
				</DialogHeader>

				{selected && (
					<div className="px-4 pb-4">
						<Field>
							<FieldLabel htmlFor="invite-participant-display-name">
								Display Name
							</FieldLabel>
							<Input
								autoComplete="off"
								disabled={mutation.isPending}
								id="invite-participant-display-name"
								maxLength={MAX_DISPLAY_NAME_LENGTH}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Name this participant"
								value={displayName}
							/>
						</Field>
					</div>
				)}

				<div className="px-4">
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<SearchIcon className="size-4 text-muted-foreground" />
						</InputGroupAddon>
						<InputGroupInput
							disabled={mutation.isPending}
							onChange={(e) => setQuery(e.currentTarget.value)}
							placeholder="@free anthropic, gpt, google"
							value={query}
						/>
					</InputGroup>
				</div>

				<div className="flex-1 flex overflow-hidden">
					<RoomParticipantGrid isLoading={isLoading} models={filteredModels}>
						{(model) => (
							<RoomParticipantSelectionItem
								disabled={mutation.isPending || !model.isFree}
								isFeatured={isFeatured(model)}
								isPending={isFiltering}
								isSelected={selected?.id === model.id}
								key={model.id}
								model={model}
								onSelect={() =>
									setSelected((prev) => (prev?.id === model.id ? null : model))
								}
							/>
						)}
					</RoomParticipantGrid>
				</div>

				<Separator />

				<DialogFooter className="p-4 mx-0 mb-0">
					<Button
						disabled={mutation.isPending}
						onClick={closeDialog}
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={mutation.isPending || !canSubmit} onClick={invite}>
						{mutation.isPending && <Loader2Icon className="animate-spin" />}
						{mutation.isPending ? "Inviting..." : "Invite"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
