"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@briom/components/ui/input-group";
import { type FormStore, insert, remove, useField } from "@formisch/react";
import { SearchIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

import { useRoomParticipantPicker } from "../../hooks/use-room-form-participant-picker";
import type { RoomFormSchema } from "../../schema/schema";
import { RoomParticipantGrid } from "./RoomParticipantGrid";
import { RoomParticipantSelectionItem } from "./RoomParticipantSelectionItem";

interface RoomParticipantPickerProps {
	/**
	 * @description
	 * Wether to disable the input.
	 */
	disabled?: boolean;

	/**
	 * @description
	 * Form instance resolving the `RoomFormSchema`.
	 */
	form: FormStore<RoomFormSchema>;

	/**
	 * @description
	 * If true, non selected participant will be disabled.
	 */
	maxParticipantsReached?: boolean;
}

export function RoomParticipantPicker({
	disabled,
	form,
	maxParticipantsReached = false,
}: RoomParticipantPickerProps) {
	const participants = useField(form, { path: ["participants"] }).input;
	const {
		filteredModels,
		isFeatured,
		isFiltering,
		isLoading,
		isSelected,
		query,
		setQuery,
	} = useRoomParticipantPicker({ participants });

	const inviteHandler = (model: (typeof filteredModels)[number]) => {
		const alreadyExists = participants.some(
			(p) => `${p.provider}/${p.model}` === model.id,
		);

		if (alreadyExists) return;
		insert(form, {
			path: ["participants"],
			initialInput: {
				displayName: model.name,
				model: model.model,
				provider: model.provider,
			},
		});
	};

	const uninviteHandler = (model: (typeof filteredModels)[number]) => {
		const index = participants.findIndex(
			(p) => `${p.provider}/${p.model}` === model.id,
		);

		if (index !== -1) remove(form, { path: ["participants"], at: index });
	};

	return (
		<Fragment>
			<div className="px-4">
				<InputGroup className="shrink-0">
					<InputGroupAddon align="inline-start">
						<SearchIcon className="size-4 text-muted-foreground" />
					</InputGroupAddon>
					<InputGroupInput
						disabled={disabled}
						onChange={(e) => setQuery(e.currentTarget.value)}
						placeholder="@free anthropic, gpt, google"
						value={query}
					/>
				</InputGroup>
			</div>
			<RoomParticipantGrid isLoading={isLoading} models={filteredModels}>
				{(model) => {
					const isModelSelected = isSelected(model);
					return (
						<RoomParticipantSelectionItem
							disabled={
								disabled ||
								!model.isFree ||
								(maxParticipantsReached && !isModelSelected)
							}
							isFeatured={isFeatured(model)}
							isPending={isFiltering}
							isSelected={isModelSelected}
							key={model.id}
							model={model}
							onSelect={() => {
								if (isModelSelected) {
									uninviteHandler(model);
								} else {
									inviteHandler(model);
								}
							}}
						/>
					);
				}}
			</RoomParticipantGrid>
		</Fragment>
	);
}
